import * as opaque from "@serenity-kit/opaque";
import sodium from "libsodium-wrappers-sumo";
import { Base64 } from 'js-base64';

import { registerStartAPI, registerEndAPI, registerUpdateAPI, endPasswordResetAPI, putNewKeyAPI, loginStartAPI, loginEndAPI, logoutAPI, getMessagesAPI, getOneMessageAPI, sendMessageAPI, uploadFileToS3, finishUploadFileToS3, downloadFileFromS3 } from "./api";
import { getKeyIdByUsername, getCachedPublicKeyEnc, getCachedPublicKeySign } from "./cachePubKey";
import { useAuth } from "../hooks/useAuth";

import * as errors from "../messages/errors";
import * as strings from "../messages/strings";


async function initLibsodium() {
    await sodium.ready;
}

function generateAndEncryptKeys(exportKeyDecoded: Uint8Array) {

    // Generate encryption key pair
    const KeyPairEnc = sodium.crypto_kem_keypair();
    const PublicKeyEnc = KeyPairEnc.publicKey;
    const PrivateKeyEnc = KeyPairEnc.privateKey;

    // Encrypt private key
    const nonce_enc = sodium.randombytes_buf(sodium.crypto_aead_aegis256_NPUBBYTES);
    const cpriv_enc = sodium.crypto_aead_aegis256_encrypt(PrivateKeyEnc, null, null, nonce_enc, exportKeyDecoded);

    // Generate signing key pair
    const KeyPairSign = sodium.crypto_sign_keypair(); // TODO change to PQ
    const PublicKeySign = KeyPairSign.publicKey;
    const PrivateKeySign = KeyPairSign.privateKey;

    // Encrypt private key
    const nonce_sign = sodium.randombytes_buf(sodium.crypto_aead_aegis256_NPUBBYTES);
    const cpriv_sign = sodium.crypto_aead_aegis256_encrypt(PrivateKeySign, null, null, nonce_sign, exportKeyDecoded);

    // Base64 encode all binary data
    const cpriv_enc_b64 = Base64.fromUint8Array(cpriv_enc, true);
    const nonce_enc_b64 = Base64.fromUint8Array(nonce_enc, true);
    const PublicKeyEnc_b64 = Base64.fromUint8Array(PublicKeyEnc, true);

    const cpriv_sign_b64 = Base64.fromUint8Array(cpriv_sign, true);
    const nonce_sign_b64 = Base64.fromUint8Array(nonce_sign, true);
    const PublicKeySign_b64 = Base64.fromUint8Array(PublicKeySign, true);

    return {
        enc_cipher_private_key: cpriv_enc_b64,
        enc_nonce_private_key: nonce_enc_b64,
        enc_public_key: PublicKeyEnc_b64,
        sign_cipher_private_key: cpriv_sign_b64,
        sign_nonce_private_key: nonce_sign_b64,
        sign_public_key: PublicKeySign_b64,
    };
}

function decryptKeys(keys: any[], exportKeyDecoded: Uint8Array) {

    let decryptedKeys = [];

    // Iterate on all keys
    for (let key of keys) {

        // Convert the keys from base64 to Uint8Array
        const cpriv_enc = Base64.toUint8Array(key.enc_cipher_private_key);
        const nonce_priv_enc = Base64.toUint8Array(key.enc_nonce_private_key);
        const pub_enc = Base64.toUint8Array(key.enc_public_key);

        const cpriv_sign = Base64.toUint8Array(key.sign_cipher_private_key);
        const nonce_priv_sign = Base64.toUint8Array(key.sign_nonce_private_key);
        const pub_sign = Base64.toUint8Array(key.sign_public_key);

        // Decrypt private keys
        const PrivateKeyEnc = sodium.crypto_aead_aegis256_decrypt(null, cpriv_enc, null, nonce_priv_enc, exportKeyDecoded);
        const PublicKeyEnc = pub_enc;

        const PrivateKeySign = sodium.crypto_aead_aegis256_decrypt(null, cpriv_sign, null, nonce_priv_sign, exportKeyDecoded);
        const PublicKeySign = pub_sign;

        // Store decrypted keys same form as in registration/login to be used in the app
        decryptedKeys.push({
            created_at: key.created_at,
            id: key.id,
            is_active: key.is_active,
            owner_id: key.owner_id,
            revoked_at: key.revoked_at,
            enc_private_key: Base64.fromUint8Array(PrivateKeyEnc, true),
            enc_public_key: Base64.fromUint8Array(PublicKeyEnc, true),
            sign_private_key: Base64.fromUint8Array(PrivateKeySign, true),
            sign_public_key: Base64.fromUint8Array(PublicKeySign, true),
        });
    }

    return decryptedKeys;
}

function encryptkeys(keys: any[], exportKeyDecoded: Uint8Array) {

    let encryptedKeys = [];

    // Iterate on all keys
    for (let key of keys) {

        // Convert the keys from base64 to Uint8Array
        const PrivateKeyEnc = Base64.toUint8Array(key.enc_private_key);
        const PublicKeyEnc = Base64.toUint8Array(key.enc_public_key);

        const PrivateKeySign = Base64.toUint8Array(key.sign_private_key);
        const PublicKeySign = Base64.toUint8Array(key.sign_public_key);

        // Encrypt private keys
        const nonce_priv_enc = sodium.randombytes_buf(sodium.crypto_aead_aegis256_NPUBBYTES);
        const cpriv_enc = sodium.crypto_aead_aegis256_encrypt(PrivateKeyEnc, null, null, nonce_priv_enc, exportKeyDecoded);

        const nonce_priv_sign = sodium.randombytes_buf(sodium.crypto_aead_aegis256_NPUBBYTES);
        const cpriv_sign = sodium.crypto_aead_aegis256_encrypt(PrivateKeySign, null, null, nonce_priv_sign, exportKeyDecoded);

        // Store encrypted keys same form as in registration/login to be sent to the server
        encryptedKeys.push({
            created_at: key.created_at,
            id: key.id,
            is_active: key.is_active,
            owner_id: key.owner_id,
            revoked_at: key.revoked_at,
            enc_cipher_private_key: Base64.fromUint8Array(cpriv_enc, true),
            enc_nonce_private_key: Base64.fromUint8Array(nonce_priv_enc, true),
            enc_public_key: Base64.fromUint8Array(PublicKeyEnc, true),
            sign_cipher_private_key: Base64.fromUint8Array(cpriv_sign, true),
            sign_nonce_private_key: Base64.fromUint8Array(nonce_priv_sign, true),
            sign_public_key: Base64.fromUint8Array(PublicKeySign, true),
        });
    }

    return encryptedKeys;
}

async function register(username: string, email: string, password: string) {

    const { clientRegistrationState, registrationRequest } = opaque.client.startRegistration({ password });

    const response = await registerStartAPI(username, registrationRequest);

    const registrationResponse = response.result;

    const { exportKey, serverStaticPublicKey, registrationRecord } = opaque.client.finishRegistration({
        clientRegistrationState,
        registrationResponse,
        password,
    });

    // Decode it from base64Url
    const exportKeyDecoded = Base64.toUint8Array(exportKey).slice(0, 32); // Take only first 32 bytes

    // Init libsodium
    await initLibsodium();

    // Generate encryption key pair and encrypt private keys with the export key
    const keys = generateAndEncryptKeys(exportKeyDecoded);

    const result = await registerEndAPI(username, email, registrationRecord, keys.enc_cipher_private_key, keys.enc_nonce_private_key, keys.enc_public_key, keys.sign_cipher_private_key, keys.sign_nonce_private_key, keys.sign_public_key);


    // Return success
    return {
        success: true,
        message: "Register successful!",
        username,
        exportKey: Base64.fromUint8Array(exportKeyDecoded, true),
    };
}

async function changePassword(username: string, password: string, newPassword: string, keys: any[]) {

    // Login to verify password and refresh session
    const response = await loginProcess(username, password);

    if (!response.success) {
        throw Error(errors.errorWrongPassword);
    }

    const { clientRegistrationState, registrationRequest } = opaque.client.startRegistration({ password: newPassword });

    const response2 = await registerStartAPI(username, registrationRequest);

    const registrationResponse = response2.result;

    const { exportKey, serverStaticPublicKey, registrationRecord } = opaque.client.finishRegistration({
        clientRegistrationState,
        registrationResponse,
        password: newPassword,
    });

    // Decode it from base64Url
    const exportKeyDecoded = Base64.toUint8Array(exportKey).slice(0, 32); // Take only first 32 bytes

    // Init libsodium
    await initLibsodium();

    // Encrypt the keys with the new export key
    const encryptedKeys = encryptkeys(keys, exportKeyDecoded);

    const response3 = await registerUpdateAPI(registrationRecord, encryptedKeys);

    // Decrypt the keys with the new export key
    const decryptedKeys = decryptKeys(response3.keys, exportKeyDecoded);

    // Return success
    return {
        success: true,
        message: "Password change successful!",
        exportKey: Base64.fromUint8Array(exportKeyDecoded, true),
        keys: decryptedKeys,
    };
}

async function resetPassword(username: string, password: string, token: string) {

    const { clientRegistrationState, registrationRequest } = opaque.client.startRegistration({ password: password });

    const response2 = await registerStartAPI(username, registrationRequest);

    const registrationResponse = response2.result;

    const { exportKey, serverStaticPublicKey, registrationRecord } = opaque.client.finishRegistration({
        clientRegistrationState,
        registrationResponse,
        password: password,
    });

    // Decode it from base64Url
    const exportKeyDecoded = Base64.toUint8Array(exportKey).slice(0, 32); // Take only first 32 bytes

    // Init libsodium
    await initLibsodium();

    // Generate new keys
    const encryptedKeys = generateAndEncryptKeys(exportKeyDecoded);

    const response3 = await endPasswordResetAPI(
        token,
        registrationRecord,
        encryptedKeys.enc_cipher_private_key,
        encryptedKeys.enc_nonce_private_key,
        encryptedKeys.enc_public_key,
        encryptedKeys.sign_cipher_private_key,
        encryptedKeys.sign_nonce_private_key,
        encryptedKeys.sign_public_key
    );

    // Return success
    return {
        success: true,
        message: "Password reset successful!",
    };
}

async function generateNewKeys(username: string, password: string, exportKey: string) {

    // Login to verify password and refresh session
    const response = await loginProcess(username, password);
    if (!response.success) {
        throw Error(errors.errorWrongPassword);
    }

    // Decode export key from base64
    const exportKeyDecoded = Base64.toUint8Array(exportKey).slice(0, 32); // Take only first 32 bytes

    // Init libsodium
    await initLibsodium();

    // Generate encryption key pair and encrypt private keys with the export key
    const newKey = generateAndEncryptKeys(exportKeyDecoded);

    const result = await putNewKeyAPI(newKey.enc_public_key, newKey.enc_nonce_private_key, newKey.enc_cipher_private_key, newKey.sign_public_key, newKey.sign_nonce_private_key, newKey.sign_cipher_private_key);

    // Decrypt the keys with the export key
    const decryptedKeys = decryptKeys(result.keys, exportKeyDecoded);

    return {
        success: true,
        message: "New keys generated successfully!",
        keys: decryptedKeys, // Return all keys including the new one
    };
}

async function loginProcess(username: string, password: string) {

    const { clientLoginState, startLoginRequest } = opaque.client.startLogin({
        password,
    });

    const response = await loginStartAPI(username, startLoginRequest);

    const loginResponse = response.result;

    const loginResult = opaque.client.finishLogin({
        clientLoginState,
        loginResponse,
        password,
    });

    if (!loginResult) {
        return {
            success: false,
            message: "Login failed. Please check your credentials.",
        };
    }

    const { exportKey, serverStaticPublicKey, finishLoginRequest, sessionKey } = loginResult;

    const result2 = await loginEndAPI(username, finishLoginRequest);

    // Decode it from base64Url
    const exportKeyDecoded = Base64.toUint8Array(exportKey).slice(0, 32); // Take only first 32 bytes

    let { keys, role } = result2;

    const decryptedKeys = decryptKeys(keys, exportKeyDecoded);

    return {
        success: true,
        message: "Login successful!",
        username,
        role,
        exportKey: Base64.fromUint8Array(exportKeyDecoded, true),
        keys: decryptedKeys,
    };
}

async function logoutProcess() {

    await logoutAPI();

}

async function getMessages(keys: any[]) {

    await initLibsodium();

    const response = await getMessagesAPI();

    // For each message:
    for (let msg of response.messages) {

        // Get the Encoded fileds of the message
        msg.kem_ciphertext_filename = Base64.toUint8Array(msg.kem_ciphertext_filename);
        msg.cfilename = Base64.toUint8Array(msg.cfilename);
        msg.nonce_filename = Base64.toUint8Array(msg.nonce_filename);
        msg.kem_ciphertext_file = Base64.toUint8Array(msg.kem_ciphertext_file);
        msg.signature_metadata = Base64.toUint8Array(msg.signature_metadata);
        msg.signature = Base64.toUint8Array(msg.signature);

        // Get the public keys sign of the sender
        const PublicKeySignSender = await getCachedPublicKeySign(msg.sender_key_id);

        // Check the signature of metadata
        const messageMetadata = {
            cfilename: msg.cfilename,
            nonce_filename: msg.nonce_filename,
            file_id: msg.file_id,
            sender: msg.sender,
            receiver: msg.receiver,
            max_downloads: msg.max_downloads,
            lifetime: msg.lifetime,
            creation_time: msg.creation_time,
            file_size: msg.file_size,
            chunk_size: msg.chunk_size,
        };

        msg.signatureValid = sodium.crypto_sign_verify_detached(msg.signature_metadata, new TextEncoder().encode(JSON.stringify(messageMetadata)), PublicKeySignSender);
        if (!msg.signatureValid) {
            msg.filename = "Invalid signature";
            continue; // Skip this message
        }

        // Get the private key with msg.receiver_key_id
        const PrivateKeyEnc = keys.find((k: any) => k.id === msg.receiver_key_id)?.enc_private_key;
        if (!PrivateKeyEnc) {
            throw new Error(errors.errorNoValidKeys);
        }

        const PrivateKeyEncDecoded = Base64.toUint8Array(PrivateKeyEnc);

        // Decrypt the filename to display it in the inbox
        const sharedSecretFilename = sodium.crypto_kem_dec(msg.kem_ciphertext_filename, PrivateKeyEncDecoded);
        const filenameBytes = sodium.crypto_aead_aegis256_decrypt(null, msg.cfilename, null, msg.nonce_filename, sharedSecretFilename);

        msg.filename = new TextDecoder().decode(filenameBytes);
    }


    return response.messages;
}

async function getOneMessage(username: string, keys: any[], message: any, onChunk: (chunk: Uint8Array, filename: string) => Promise<void>, onProgress?: (percent: number) => void) {

    await initLibsodium();

    // Get the private key with message.receiver_key_id
    const PrivateKeyEnc = keys.find((k: any) => k.id === message.receiver_key_id)?.enc_private_key;
    if (!PrivateKeyEnc) {
        throw new Error(errors.errorNoValidKeys);
    }
    const PrivateKeyEncDecoded = Base64.toUint8Array(PrivateKeyEnc);

    // Get the message download URL
    const response = await getOneMessageAPI(message.file_id);
    const downloadUrl = response.download_url;

    // Get the public key sign of the sender to check signature
    const PublicKeySignSender = await getCachedPublicKeySign(message.sender_key_id);

    // Construct the signature
    let state = sodium.crypto_sign_init();

    // Generate a JSON representation of the message metadata for the signature
    const messageMetadata = {
        cfilename: message.cfilename,
        nonce_filename: message.nonce_filename,
        file_id: message.file_id,
        sender: message.sender,
        receiver: username!,
        max_downloads: message.max_downloads,
        lifetime: message.lifetime,
        creation_time: message.creation_time,
        file_size: message.file_size,
        chunk_size: message.chunk_size,
    };

    // Update the signature with the metadata JSON structure
    sodium.crypto_sign_update(state, new TextEncoder().encode(JSON.stringify(messageMetadata)));

    // Get the public key enc of the sender to decrypt the filename and file
    const PublicKeyEncSender = await getCachedPublicKeyEnc(message.sender_key_id);

    // Decrypt the filename
    const shared_key_filename = sodium.crypto_kem_dec(message.kem_ciphertext_filename, PrivateKeyEncDecoded);
    const filenameBytes = sodium.crypto_aead_aegis256_decrypt(null, message.cfilename, null, message.nonce_filename, shared_key_filename);
    message.filename = new TextDecoder().decode(filenameBytes);

    const shared_key = sodium.crypto_kem_dec(message.kem_ciphertext_file, PrivateKeyEncDecoded);

    const decryptChunk = (chunk: Uint8Array) => {

        // Add chunk to signature
        sodium.crypto_sign_update(state, chunk);

        // Decrypt chunk
        const nonce_chunk = chunk.slice(0, sodium.crypto_aead_aegis256_NPUBBYTES);
        const ciphertext_chunk = chunk.slice(sodium.crypto_aead_aegis256_NPUBBYTES);
        try {
            const decryptedChunk = sodium.crypto_aead_aegis256_decrypt(null, ciphertext_chunk, null, nonce_chunk, shared_key);
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
            await onChunk(decryptedChunk, message.filename); // send chunk progressively
            return 1; // Decryption successful
        }

        return -1; // Decryption failed
    }, downloadUrl, onProgress);


    // Verify the signature
    message.signatureValid = sodium.crypto_sign_final_verify(state, message.signature, PublicKeySignSender);
    if (!message.signatureValid) {
        throw new Error(errors.errorFailureSignatureVerification);
    }

    return message;
}

async function sendMessage(username: string, privateKeyEnc: string, privateKeySign: string, receiver: string, fileName: string, file: File, lifetimeDays: number, maxDownloads: number, onProgress?: (percent: number) => void) {

    await initLibsodium();

    const PrivateKeyEncDecoded = Base64.toUint8Array(privateKeyEnc);
    const PrivateKeySignDecoded = Base64.toUint8Array(privateKeySign);

    // Get receiver's public encryption key
    const senderKeyId = await getKeyIdByUsername(username);
    const receiverKeyId = await getKeyIdByUsername(receiver);
    const PublicKeyEncReceiver = await getCachedPublicKeyEnc(receiverKeyId);

    // Generate shared secret
    const { ciphertext: kemCiphertextFilename, sharedSecret: sharedSecretFilename } = sodium.crypto_kem_enc(PublicKeyEncReceiver);
    const { ciphertext: kemCiphertextFile, sharedSecret: sharedSecretFile } = sodium.crypto_kem_enc(PublicKeyEncReceiver);

    const kemCiphertextFilename_b64 = Base64.fromUint8Array(kemCiphertextFilename, true);
    const kemCiphertextFile_b64 = Base64.fromUint8Array(kemCiphertextFile, true);


    // Encrypt the filename
    const nonce_filename = sodium.randombytes_buf(sodium.crypto_aead_aegis256_NPUBBYTES);
    const cfilename = sodium.crypto_aead_aegis256_encrypt(new TextEncoder().encode(fileName), null, null, nonce_filename, sharedSecretFilename);

    const cfilename_b64 = Base64.fromUint8Array(cfilename, true);
    const nonce_filename_b64 = Base64.fromUint8Array(nonce_filename, true);

    // Get the current timestamp
    const timestamp = new Date().toISOString();

    // Send the message
    const response = await sendMessageAPI(senderKeyId, receiverKeyId, kemCiphertextFilename_b64, cfilename_b64, nonce_filename_b64, kemCiphertextFile_b64, maxDownloads, lifetimeDays, timestamp, file.size);

    // Get the upload URL
    const uploadUrls = response.upload_urls;
    const upload_id = response.upload_id;
    const messageFileId = response.message_file_id;
    const chunkSize = response.chunk_size;

    if (!chunkSize || chunkSize <= 0) {
        throw new Error(errors.errorAPIRequestFailed);
    }

    // Sign the metadata of the message
    let state = sodium.crypto_sign_init();

    const metadata = {
        cfilename: cfilename,
        nonce_filename: nonce_filename,
        file_id: messageFileId,
        sender: username!,
        receiver: receiver,
        max_downloads: maxDownloads,
        lifetime: lifetimeDays,
        creation_time: timestamp,
        file_size: file.size,
        chunk_size: chunkSize,
    };

    const metadata_json_string = new TextEncoder().encode(JSON.stringify(metadata))

    // Sign the metadata of the message
    const signature_metadata = sodium.crypto_sign_detached(metadata_json_string, PrivateKeySignDecoded);

    // Update the signature with the metadata JSON structure
    sodium.crypto_sign_update(state, metadata_json_string);

    // Encrypt the file in chunks
    const totalLength = file.size;

    if (uploadUrls.length !== Math.ceil(file.size / chunkSize)) {
        throw new Error(errors.errorAPIRequestFailed);
    }

    let ETags: string[] = [];

    for (let offset = 0; offset < file.size; offset += chunkSize) {
        const slice = file.slice(offset, offset + chunkSize);
        const buf = new Uint8Array(await slice.arrayBuffer());

        // Encrypt the chunk
        const nonce_chunk = sodium.randombytes_buf(sodium.crypto_aead_aegis256_NPUBBYTES);
        const encryptedChunk = sodium.crypto_aead_aegis256_encrypt(buf, null, null, nonce_chunk, sharedSecretFile);

        // Add nonce at the beginning of the chunk
        const encryptedChunkWithNonce = new Uint8Array(nonce_chunk.length + encryptedChunk.length);
        encryptedChunkWithNonce.set(nonce_chunk);
        encryptedChunkWithNonce.set(encryptedChunk, nonce_chunk.length);

        // Update the signature
        sodium.crypto_sign_update(state, encryptedChunkWithNonce);

        // Upload the chunk to S3
        const chunkUploadResp = await uploadFileToS3(uploadUrls[offset / chunkSize], encryptedChunkWithNonce, void 0);
        ETags.push(chunkUploadResp.ETag);

        // Update progress
        onProgress?.(Math.min(((offset + chunkSize) / totalLength) * 100, 100)); // Avoid going over 100% if the last chunk is smaller than chunkSize
    }

    // Finalize the signature
    const signature = sodium.crypto_sign_final_create(state, PrivateKeySignDecoded);

    // Finalize the upload
    const response3 = await finishUploadFileToS3(messageFileId, upload_id, ETags, Base64.fromUint8Array(signature_metadata, true), Base64.fromUint8Array(signature, true));

    return {
        success: true,
        message: "Message sent successfully!",
    };
}

export { register, changePassword, generateNewKeys, resetPassword, loginProcess, logoutProcess, sendMessage, getMessages, getOneMessage };