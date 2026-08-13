import { Base64 } from 'js-base64';

import { getSodium, getOpaque } from "./utils";

import { uploadFileToS3, downloadFileFromS3, updateLinkMessageAPI, updatePasswordLinkMessageStartAPI, updatePasswordLinkMessageEndAPI } from "./api_link";
import { postLinkMessageLoginStartAPI, postLinkMessageLoginEndAPI, getLinkMessageMetadataAPI, getLinkMessageAPI, sendLinkMessageStartAPI, sendLinkMessageAPI, finishUploadFileToS3Link } from "./api_link";

import * as errors from "../messages/errors";
import { frontendUrl } from "./config";
import { linkTransferGeneratedPasswordLen } from "./config";


///
/// Get Link Message Metadata and Content
///

async function getOneLinkMessageMetadata(password: string, message_id: string) {

    const opaque = await getOpaque();
    const { clientLoginState, startLoginRequest } = opaque.client.startLogin({
        password,
    });

    const responseOpaque = await postLinkMessageLoginStartAPI(message_id, startLoginRequest);

    const loginResponse = responseOpaque.result;

    const loginResult = opaque.client.finishLogin({
        clientLoginState,
        loginResponse,
        password,
    });

    if (!loginResult) {
        throw new Error(errors.errorLoginFailed);
    }

    const { exportKey, serverStaticPublicKey: _serverStaticPublicKey, finishLoginRequest, sessionKey: _sessionKey } = loginResult;

    // Finish the login process
    await postLinkMessageLoginEndAPI(message_id, finishLoginRequest);

    // Decode export key
    const exportKeyDecoded = Base64.toUint8Array(exportKey).slice(0, 32);

    // Get the message metadata
    const result2 = await getLinkMessageMetadataAPI(message_id);
    let { id, c_enc_key, nonce_enc_key, c_mac_key, nonce_mac_key, cfilename, nonce_filename, file_id, max_downloads, lifetime, creation_time, hash_file, mac, number_downloads, file_size, chunk_size, sender_pub_key, sender_email, signature_metadata, signature } = result2.message;

    // Get the Encoded fileds of the message
    cfilename = Base64.toUint8Array(cfilename);
    nonce_filename = Base64.toUint8Array(nonce_filename);
    mac = Base64.toUint8Array(mac);

    const sodium = await getSodium();

    // Check the signature if not empty
    let sender = "Unknown";
    if (signature_metadata && signature_metadata.length > 0 && signature && signature.length > 0) {
        const signature_metadata_decoded = Base64.toUint8Array(signature_metadata);
        const sender_pub_key_decoded = Base64.toUint8Array(sender_pub_key);

        // Verify the signature of the metadata
        const isValidSignature = sodium.crypto_sign_verify_detached(signature_metadata_decoded, new TextEncoder().encode(JSON.stringify({
            cfilename, nonce_filename, file_id, max_downloads, lifetime, creation_time, file_size, chunk_size
        })), sender_pub_key_decoded);

        if (!isValidSignature) {
            throw new Error(errors.errorFailureSignatureVerification);
        }

        sender = sender_email;
    }

    // Decrypt the keys with the export key
    const AegisKey = sodium.crypto_aead_aegis256_decrypt(null, Base64.toUint8Array(c_enc_key), null, Base64.toUint8Array(nonce_enc_key), exportKeyDecoded);
    const MacKey = sodium.crypto_aead_aegis256_decrypt(null, Base64.toUint8Array(c_mac_key), null, Base64.toUint8Array(nonce_mac_key), exportKeyDecoded);

    if (!AegisKey || !MacKey) {
        throw new Error(errors.errorKeyDerivationFailed);
    }

    // Decrypt the filename and check auth data
    const auth_data = {
        max_downloads: max_downloads,
        lifetime: lifetime,
        creation_time: creation_time,
        file_size: file_size,
        chunk_size: chunk_size,
    };

    // Decrypt the filename and verify the auth data using the export key
    let filename: string;
    try {
        const filenameBytes = sodium.crypto_aead_aegis256_decrypt(null, cfilename, new TextEncoder().encode(JSON.stringify(auth_data)), nonce_filename, AegisKey);
        filename = new TextDecoder().decode(filenameBytes);
    } catch (e) {
        throw new Error(errors.errorFailureMACVerification);
    }

    return {
        success: true,
        exportKey,
        AegisKey: Base64.fromUint8Array(AegisKey, true),
        MacKey: Base64.fromUint8Array(MacKey, true),
        message: "Message metadata retrieved successfully!",
        messageData: {
            id, cfilename, filename, nonce_filename, message_id, file_id, creation_time, hash_file, mac, lifetime, max_downloads, number_downloads, file_size, chunk_size, signature_metadata, signature, sender
        }
    };
}

///
/// Get Link Message Content
///

async function getOneLinkMessage(AegisKeyEncoded: string, MacKeyEncoded: string, message: any, onChunk: (chunk: Uint8Array, filename: string) => Promise<void>, onProgress?: (percent: number) => void) {

    const sodium = await getSodium();

    const message_id = message.id;
    const repsonse = await getLinkMessageAPI(message_id);
    const downloadUrl = repsonse.download_url;

    // Get the key for the file decryption
    const AegisKey = Base64.toUint8Array(AegisKeyEncoded);
    const MacKey = Base64.toUint8Array(MacKeyEncoded);

    // Init the global MAC
    let mac_state = sodium.crypto_auth_hmacsha512256_init(MacKey);

    // Construct the auth data for the message
    const full_auth_data = {
        cfilename: message.cfilename,
        nonce_filename: message.nonce_filename,
        file_id: message.file_id,
        max_downloads: message.max_downloads,
        lifetime: message.lifetime,
        creation_time: message.creation_time,
        file_size: message.file_size,
        chunk_size: message.chunk_size,
    };
    const auth_data_encoded = new TextEncoder().encode(JSON.stringify(full_auth_data));

    // Authenticate the auth data with global MAC
    sodium.crypto_auth_hmacsha512256_update(mac_state, auth_data_encoded);

    // Check if the message is signed
    const isSigned = !!(message.signature && message.signature.length > 0);
    let sign_state: any;
    if (isSigned) {
        sign_state = sodium.crypto_sign_init();
        sodium.crypto_sign_update(sign_state, auth_data_encoded);
    }

    let hash_state = sodium.crypto_generichash_init(null, 64); // 512 bits for the hash output

    const decryptChunk = (chunk: Uint8Array) => {
        const nonce_chunk = chunk.slice(0, sodium.crypto_aead_aegis256_NPUBBYTES);
        const ciphertext_chunk = chunk.slice(sodium.crypto_aead_aegis256_NPUBBYTES);

        // Update the file hash with the encrypted chunk
        sodium.crypto_generichash_update(hash_state, chunk);

        try {
            const decryptedChunk = sodium.crypto_aead_aegis256_decrypt(null, ciphertext_chunk, null, nonce_chunk, AegisKey);
            return { decryptedChunk };
        } catch (e) {
            console.error("Decryption of chunk failed");
            return { decryptedChunk: null };
        }
    };

    const tagSize = sodium.crypto_aead_aegis256_NPUBBYTES + sodium.crypto_aead_aegis256_ABYTES; // For each chunk: nonce at the beginning + MAC at the end
    await downloadFileFromS3(message.chunk_size, tagSize, async (chunk: any) => {
        const { decryptedChunk } = decryptChunk(chunk);
        if (decryptedChunk) {
            await onChunk(decryptedChunk, message.filename); // 
            return 1; // Decryption successful
        }

        return -1;
    }, downloadUrl, onProgress);

    // Finalize the global hash
    const file_hash = sodium.crypto_generichash_final(hash_state, 64);

    // Update the global MAC with the file hash
    sodium.crypto_auth_hmacsha512256_update(mac_state, file_hash);

    // Finalize the global MAC and check it against the MAC sent by the sender
    const calc_mac = sodium.crypto_auth_hmacsha512256_final(mac_state);
    if (!sodium.memcmp(message.mac, calc_mac)) {
        throw new Error(errors.errorFailureMACVerification);
    }

    // Finish and verify the signature over metadata + file hash
    if (isSigned) {
        sodium.crypto_sign_update(sign_state, file_hash);

        const signature_decoded = Base64.toUint8Array(message.signature);
        const sender_pub_key_decoded = Base64.toUint8Array(message.sender_pub_key);

        const isValidSignature = sodium.crypto_sign_final_verify(sign_state, signature_decoded, sender_pub_key_decoded);
        if (!isValidSignature) {
            throw new Error(errors.errorFailureSignatureVerification);
        }

        console.log("Signature verified successfully!");
    }

    return message;
}

///
/// Send Link Message
///

async function sendMessageLink(fileName: string, file: File, lifetimeDays: number, maxDownloads: number, is_signed: boolean, keyId?: string, privateKeySign?: string, password?: string, onProgress?: (percent: number) => void, receiver_email?: string) {

    let state: any;
    let sender_key_id: string | undefined = undefined;
    let signature_metadata_b64: string | undefined = undefined;
    let signature_b64: string | undefined = undefined;

    const opaque = await getOpaque();
    const sodium = await getSodium();

    let isEmptyPassword = false;

    // If password is not provided, generate a random password
    if (password === undefined || password === null || password === "") {
        const randomBytes = sodium.randombytes_buf(linkTransferGeneratedPasswordLen);
        password = Base64.fromUint8Array(randomBytes, true);
        isEmptyPassword = true;
    }

    // Create key from OPAQUE
    const { clientRegistrationState, registrationRequest } = opaque.client.startRegistration({ password });

    const response = await sendLinkMessageStartAPI(registrationRequest);

    const registrationResponse = response.result;
    const id = response.id;
    const chunkSize = response.chunk_size

    if (!chunkSize || chunkSize <= 0) {
        throw new Error(errors.errorAPIRequestFailed);
    }

    const { exportKey, serverStaticPublicKey: _serverStaticPublicKey, registrationRecord } = opaque.client.finishRegistration({
        clientRegistrationState,
        registrationResponse,
        password,
    });

    if (!exportKey || exportKey.length < 64) {
        throw new Error(errors.errorKeyDerivationFailed);
    }

    // Decode the export key
    const exportKeyDecoded = Base64.toUint8Array(exportKey).slice(0, 32);

    // Generate keys for encryption and MAC
    const AegisKey = sodium.crypto_aead_aegis256_keygen();
    const MacKey = sodium.crypto_auth_hmacsha512256_keygen();

    // Encrypt the keys with the export key
    const nonce_enc_key = sodium.randombytes_buf(sodium.crypto_aead_aegis256_NPUBBYTES);
    const c_enc_key = sodium.crypto_aead_aegis256_encrypt(AegisKey, null, null, nonce_enc_key, exportKeyDecoded);
    const nonce_mac_key = sodium.randombytes_buf(sodium.crypto_aead_aegis256_NPUBBYTES);
    const c_mac_key = sodium.crypto_aead_aegis256_encrypt(MacKey, null, null, nonce_mac_key, exportKeyDecoded);

    const nonce_enc_key_b64 = Base64.fromUint8Array(nonce_enc_key, true);
    const c_enc_key_b64 = Base64.fromUint8Array(c_enc_key, true);
    const nonce_mac_key_b64 = Base64.fromUint8Array(nonce_mac_key, true);
    const c_mac_key_b64 = Base64.fromUint8Array(c_mac_key, true);

    // Get the current timestamp
    const timestamp = new Date().toISOString();
    const totalLength = file.size;

    // Construct the auth data for the message
    const auth_data = {
        max_downloads: maxDownloads,
        lifetime: lifetimeDays,
        creation_time: timestamp,
        file_size: file.size,
        chunk_size: chunkSize,
    };
    const auth_data_encoded = new TextEncoder().encode(JSON.stringify(auth_data));

    // Authenticate the auth data and encrypt the filename
    const nonce_filename = sodium.randombytes_buf(sodium.crypto_aead_aegis256_NPUBBYTES);
    const cfilename = sodium.crypto_aead_aegis256_encrypt(new TextEncoder().encode(fileName), auth_data_encoded, null, nonce_filename, AegisKey);

    const cfilename_b64 = Base64.fromUint8Array(cfilename, true);
    const nonce_filename_b64 = Base64.fromUint8Array(nonce_filename, true);

    // Send the initial request to get an upload ID
    const response2 = await sendLinkMessageAPI(id, registrationRecord, c_enc_key_b64, nonce_enc_key_b64, c_mac_key_b64, nonce_mac_key_b64, cfilename_b64, nonce_filename_b64, maxDownloads, lifetimeDays, timestamp, totalLength);
    const uploadUrls = response2.upload_urls;
    const transferId = response2.transfer_id;
    const upload_id = response2.upload_id;
    const message_file_id = response2.message_file_id;

    if (uploadUrls.length !== Math.ceil(file.size / chunkSize)) {
        throw new Error(errors.errorAPIRequestFailed);
    }

    // Init the global MAC
    let mac_state = sodium.crypto_auth_hmacsha512256_init(MacKey);

    const full_auth_data = {
        cfilename: cfilename,
        nonce_filename: nonce_filename,
        file_id: message_file_id,
        max_downloads: maxDownloads,
        lifetime: lifetimeDays,
        creation_time: timestamp,
        file_size: file.size,
        chunk_size: chunkSize,
    };
    const full_auth_data_encoded = new TextEncoder().encode(JSON.stringify(full_auth_data));

    // Authenticate the auth data with global MAC
    sodium.crypto_auth_hmacsha512256_update(mac_state, full_auth_data_encoded);

    // Optionally sign the metadata of the message
    if (is_signed && privateKeySign) {
        sender_key_id = keyId;

        const PrivateKeySignDecoded = Base64.toUint8Array(privateKeySign);

        const signature_metadata = sodium.crypto_sign_detached(full_auth_data_encoded, PrivateKeySignDecoded);
        signature_metadata_b64 = Base64.fromUint8Array(signature_metadata, true);

        // Update the signature with the metadata JSON structure
        state = sodium.crypto_sign_init();
        sodium.crypto_sign_update(state, full_auth_data_encoded);
    }

    let hash_state = sodium.crypto_generichash_init(null, 64); // 512 bits for the hash output

    let ETags: string[] = [];

    for (let offset = 0; offset < file.size; offset += chunkSize) {

        // Get the chunk from the file
        const slice = file.slice(offset, offset + chunkSize);
        const buf = new Uint8Array(await slice.arrayBuffer());

        // Encrypt the chunk
        const nonce_chunk = sodium.randombytes_buf(sodium.crypto_aead_aegis256_NPUBBYTES);
        const encryptedChunk = sodium.crypto_aead_aegis256_encrypt(buf, null, null, nonce_chunk, AegisKey);

        // Add nonce at the beginning of the chunk
        const encryptedChunkWithNonce = new Uint8Array(nonce_chunk.length + encryptedChunk.length);
        encryptedChunkWithNonce.set(nonce_chunk, 0);
        encryptedChunkWithNonce.set(encryptedChunk, nonce_chunk.length);

        // Update the global hash with the encrypted chunk
        sodium.crypto_generichash_update(hash_state, encryptedChunkWithNonce);

        // Upload the chunk to S3
        const chunkUploadResp = await uploadFileToS3(uploadUrls[offset / chunkSize], encryptedChunkWithNonce, void 0);
        ETags.push(chunkUploadResp.ETag);

        // Update progress
        onProgress?.(Math.min(((offset + chunkSize) / totalLength) * 100, 100)); // Avoid going over 100% if the last chunk is smaller than chunkSize
    }

    // Finalize the global hash
    const file_hash = sodium.crypto_generichash_final(hash_state, 64);
    const file_hash_b64 = Base64.fromUint8Array(file_hash, true);

    // Finalize the global MAC with the file hash
    sodium.crypto_auth_hmacsha512256_update(mac_state, file_hash);
    const mac = sodium.crypto_auth_hmacsha512256_final(mac_state);
    const mac_b64 = Base64.fromUint8Array(mac, true);

    // Optionally sign the metadata of the message
    if (is_signed && privateKeySign) {
        // Finalize the signature with the file hash
        const PrivateKeySignDecoded = Base64.toUint8Array(privateKeySign);
        sodium.crypto_sign_update(state, file_hash);
        const signature = sodium.crypto_sign_final_create(state, PrivateKeySignDecoded);
        signature_b64 = Base64.fromUint8Array(signature, true);
    }

    // Finalize the upload
    const response3 = await finishUploadFileToS3Link(id, message_file_id, upload_id, ETags, file_hash_b64, mac_b64, receiver_email, sender_key_id, signature_metadata_b64, signature_b64);
    const auth_key = response3.auth_key;

    // Construct the link to be shared
    let link: string;
    if (isEmptyPassword) {
        link = `${frontendUrl}/link-transfer/${transferId}#${password}`;

    } else {
        link = `${frontendUrl}/link-transfer/${transferId}`;
    }

    return {
        success: true,
        message: "Message sent successfully!",
        id: transferId,
        link: link,
        auth_key: auth_key,
        password: password,
    };
}

///
/// Update Link Message
///

async function updateMessageLink(id: string, auth_key_b64: string, AegisKey_b64: string, MacKey_b64: string, filename: string, maxDownloads: number, lifetimeDays: number, fileHash_b64: string, message_file_id: string, chunkSize: number, timestamp: string, file_size: number) {

    const sodium = await getSodium();

    const AegisKey = Base64.toUint8Array(AegisKey_b64);
    const MacKey = Base64.toUint8Array(MacKey_b64);

    // Construct the auth data for the message
    const auth_data = {
        max_downloads: maxDownloads,
        lifetime: lifetimeDays,
        creation_time: timestamp,
        file_size: file_size,
        chunk_size: chunkSize,
    };
    const auth_data_encoded = new TextEncoder().encode(JSON.stringify(auth_data));

    // Authenticate the auth data and encrypt the filename
    const nonce_filename = sodium.randombytes_buf(sodium.crypto_aead_aegis256_NPUBBYTES);
    const cfilename = sodium.crypto_aead_aegis256_encrypt(new TextEncoder().encode(filename), auth_data_encoded, null, nonce_filename, AegisKey);

    const cfilename_b64 = Base64.fromUint8Array(cfilename, true);
    const nonce_filename_b64 = Base64.fromUint8Array(nonce_filename, true);

    const full_auth_data = {
        cfilename: cfilename,
        nonce_filename: nonce_filename,
        file_id: message_file_id,
        max_downloads: maxDownloads,
        lifetime: lifetimeDays,
        creation_time: timestamp,
        file_size: file_size,
        chunk_size: chunkSize,
    };

    // Init the global MAC
    let mac_state = sodium.crypto_auth_hmacsha512256_init(MacKey);
    sodium.crypto_auth_hmacsha512256_update(mac_state, new TextEncoder().encode(JSON.stringify(full_auth_data)));
    sodium.crypto_auth_hmacsha512256_update(mac_state, Base64.toUint8Array(fileHash_b64));
    const mac = sodium.crypto_auth_hmacsha512256_final(mac_state);
    const mac_b64 = Base64.fromUint8Array(mac, true);

    await updateLinkMessageAPI(id, auth_key_b64, cfilename_b64, nonce_filename_b64, maxDownloads, lifetimeDays, mac_b64);

    return {
        nonce_filename: nonce_filename,
        cfilename: cfilename,
        max_downloads: maxDownloads,
        lifetime: lifetimeDays,
        mac: mac,
        message: "Message updated successfully!",
    }
}

///
/// Update Link Password
///

async function updateLinkPassword(id: string, auth_key: string, AegisKey_b64: string, MacKey_b64: string, password?: string) {

    const opaque = await getOpaque();
    const sodium = await getSodium();

    if (!password) {
        const randomBytes = sodium.randombytes_buf(linkTransferGeneratedPasswordLen);
        password = Base64.fromUint8Array(randomBytes, true);
    }

    const AegisKey = Base64.toUint8Array(AegisKey_b64);
    const MacKey = Base64.toUint8Array(MacKey_b64);

    // Create key from OPAQUE
    const { clientRegistrationState, registrationRequest } = opaque.client.startRegistration({ password });

    const response = await updatePasswordLinkMessageStartAPI(id, registrationRequest);

    const registrationResponse = response.result;

    const { exportKey, serverStaticPublicKey: _serverStaticPublicKey, registrationRecord } = opaque.client.finishRegistration({
        clientRegistrationState,
        registrationResponse,
        password,
    });

    if (!exportKey || exportKey.length < 64) {
        throw new Error(errors.errorKeyDerivationFailed);
    }

    // Decode the export key
    const exportKeyDecoded = Base64.toUint8Array(exportKey).slice(0, 32);

    // Encrypt the keys with the new export key
    const nonce_enc_key = sodium.randombytes_buf(sodium.crypto_aead_aegis256_NPUBBYTES);
    const c_enc_key = sodium.crypto_aead_aegis256_encrypt(AegisKey, null, null, nonce_enc_key, exportKeyDecoded);
    const nonce_mac_key = sodium.randombytes_buf(sodium.crypto_aead_aegis256_NPUBBYTES);
    const c_mac_key = sodium.crypto_aead_aegis256_encrypt(MacKey, null, null, nonce_mac_key, exportKeyDecoded);

    await updatePasswordLinkMessageEndAPI(
        id,
        registrationRecord,
        auth_key,
        Base64.fromUint8Array(c_enc_key, true),
        Base64.fromUint8Array(nonce_enc_key, true),
        Base64.fromUint8Array(c_mac_key, true),
        Base64.fromUint8Array(nonce_mac_key, true),
    );

    return {
        id: id,
        auth_key: auth_key,
        password: password,
    }
}

export { getOneLinkMessageMetadata, getOneLinkMessage, sendMessageLink, updateMessageLink, updateLinkPassword };