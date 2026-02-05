import * as opaque from "@serenity-kit/opaque";
import sodium from "libsodium-wrappers-sumo";
import { Base64 } from 'js-base64';

import { registerStartAPI, registerEndAPI, registerUpdateAPI, loginStartAPI, loginEndAPI, logoutAPI, getPublicKeyEncAPI, getPublicKeySignAPI, getMessagesAPI, getOneMessageAPI, sendMessageAPI, uploadFileToS3, finishUploadFileToS3, downloadFileFromS3 } from "./api";
import { getItemFromSessionStorage } from "./utils";

import * as errors from "../messages/errors";
import * as strings from "../messages/strings";

async function initLibsodium() {
    await sodium.ready;
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

    // Generate encryption key pair
    const KeyPairEnc = sodium.crypto_box_keypair();
    const PublicKeyEnc = KeyPairEnc.publicKey;
    const PrivateKeyEnc = KeyPairEnc.privateKey;

    // Encrypt private key
    const nonce_enc = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
    const cpriv_enc = sodium.crypto_secretbox_easy(PrivateKeyEnc, nonce_enc, exportKeyDecoded);

    // Generate signing key pair
    const KeyPairSign = sodium.crypto_sign_keypair();
    const PublicKeySign = KeyPairSign.publicKey;
    const PrivateKeySign = KeyPairSign.privateKey;

    // Encrypt private key
    const nonce_sign = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
    const cpriv_sign = sodium.crypto_secretbox_easy(PrivateKeySign, nonce_sign, exportKeyDecoded);


    // Base64 encode all binary data
    const cpriv_enc_b64 = Base64.fromUint8Array(cpriv_enc, true);
    const nonce_enc_b64 = Base64.fromUint8Array(nonce_enc, true);
    const PublicKeyEnc_b64 = Base64.fromUint8Array(PublicKeyEnc, true);

    const cpriv_sign_b64 = Base64.fromUint8Array(cpriv_sign, true);
    const nonce_sign_b64 = Base64.fromUint8Array(nonce_sign, true);
    const PublicKeySign_b64 = Base64.fromUint8Array(PublicKeySign, true);

    const result = await registerEndAPI(username, registrationRecord, cpriv_enc_b64, nonce_enc_b64, PublicKeyEnc_b64, cpriv_sign_b64, nonce_sign_b64, PublicKeySign_b64);

    // Return the keys
    return {
        success: true,
    };
}

async function login(username: string, password: string) {

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

    let { pub_enc, cpriv_enc, nonce_priv_enc, pub_sign, cpriv_sign, nonce_priv_sign } = result2;

    // Decode it from base64Url
    const exportKeyDecoded = Base64.toUint8Array(exportKey).slice(0, 32); // Take only first 32 bytes

    // Convert the keys from base64 to Uint8Array
    pub_enc = Base64.toUint8Array(pub_enc);
    cpriv_enc = Base64.toUint8Array(cpriv_enc);
    nonce_priv_enc = Base64.toUint8Array(nonce_priv_enc);

    pub_sign = Base64.toUint8Array(pub_sign);
    cpriv_sign = Base64.toUint8Array(cpriv_sign);
    nonce_priv_sign = Base64.toUint8Array(nonce_priv_sign);

    // Init libsodium
    await initLibsodium();

    // Decrypt private keys
    const PrivateKeyEnc = sodium.crypto_secretbox_open_easy(cpriv_enc, nonce_priv_enc, exportKeyDecoded);
    const PublicKeyEnc = pub_enc;

    const PrivateKeySign = sodium.crypto_secretbox_open_easy(cpriv_sign, nonce_priv_sign, exportKeyDecoded);
    const PublicKeySign = pub_sign;


    // Save keys in session storage
    sessionStorage.setItem("username", username);
    sessionStorage.setItem("exportKey", Base64.fromUint8Array(exportKeyDecoded));
    sessionStorage.setItem("PrivateKeyEnc", Base64.fromUint8Array(PrivateKeyEnc));
    sessionStorage.setItem("PublicKeyEnc", Base64.fromUint8Array(PublicKeyEnc));
    sessionStorage.setItem("PrivateKeySign", Base64.fromUint8Array(PrivateKeySign));
    sessionStorage.setItem("PublicKeySign", Base64.fromUint8Array(PublicKeySign));

    return {
        success: true,
        message: "Login successful!",
    };
}

async function logout() {

    await initLibsodium();

    const username = sessionStorage.getItem("username");

    try {
        let response = await logoutAPI(username!);
    } catch (e) {
        console.error("Logout API call failed:", e);
    }

    sessionStorage.clear();
}

async function getMessages() {

    await initLibsodium();

    const username = sessionStorage.getItem("username");

    const PrivateKeyEncDecoded = getItemFromSessionStorage("PrivateKeyEnc");

    const response = await getMessagesAPI(username!);

    // For each message:
    for (let msg of response.messages) {

        // Get the Encoded fileds of the message
        msg.signature = Base64.toUint8Array(msg.signature);
        msg.cfilename = Base64.toUint8Array(msg.cfilename);
        msg.nonce_filename = Base64.toUint8Array(msg.nonce_filename);
        msg.nonce_message = Base64.toUint8Array(msg.nonce_message);

        // Get the public key enc of the sender to decrypt the filename and file
        const responsePubKeyEnc = await getPublicKeyEncAPI(msg.sender);
        const PublicKeyEncSender = Base64.toUint8Array(responsePubKeyEnc.pub_enc);

        // Decrypt the filename to display it in the inbox
        const filenameBytes = sodium.crypto_box_open_easy(msg.cfilename, msg.nonce_filename, PublicKeyEncSender, PrivateKeyEncDecoded);
        msg.filename = new TextDecoder().decode(filenameBytes);
    }


    return response.messages;
}

async function getOneMessage(message: any, onChunk: (chunk: Uint8Array, filename: string) => Promise<void>, onProgress?: (percent: number) => void) {

    await initLibsodium();

    const username = sessionStorage.getItem("username");

    const PrivateKeyEncDecoded = getItemFromSessionStorage("PrivateKeyEnc");

    // Get the message download URL
    const response = await getOneMessageAPI(username!, message.file_id);
    const downloadUrl = response.download_url;

    // Get the public key sign of the sender to check signature
    const responsePubKey = await getPublicKeySignAPI(message.sender);
    const PublicKeySignSender = Base64.toUint8Array(responsePubKey.pub_sign);

    // Construct the signature
    let state = sodium.crypto_sign_init();

    // Generate a JSON representation of the message metadata to sign
    const messageMetadata = {
        cfilename: message.cfilename,
        nonce_filename: message.nonce_filename,
        file_id: message.file_id,
        nonce_file: message.nonce_message,
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
    const responsePubKeyEnc = await getPublicKeyEncAPI(message.sender);
    const PublicKeyEncSender = Base64.toUint8Array(responsePubKeyEnc.pub_enc);

    // Decrypt the filename
    const filenameBytes = sodium.crypto_box_open_easy(message.cfilename, message.nonce_filename, PublicKeyEncSender, PrivateKeyEncDecoded);
    message.filename = new TextDecoder().decode(filenameBytes);

    const shared_key = sodium.crypto_box_beforenm(PublicKeyEncSender, PrivateKeyEncDecoded);

    const decryptChunk = (chunk: Uint8Array) => {

        // Add chunk to signature
        sodium.crypto_sign_update(state, chunk);

        // Decrypt chunk
        const nonce_chunk = chunk.slice(0, sodium.crypto_box_NONCEBYTES);
        const ciphertext_chunk = chunk.slice(sodium.crypto_box_NONCEBYTES);
        try {
            const decryptedChunk = sodium.crypto_box_open_easy_afternm(ciphertext_chunk, nonce_chunk, shared_key);
            return { decryptedChunk };
        } catch (e) {
            console.error("Decryption of chunk failed");
            return { decryptedChunk: null };
        }
    };

    const tagSize = sodium.crypto_box_NONCEBYTES + sodium.crypto_box_MACBYTES; // For each chunk: nonce at the beginning + MAC at the end
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

async function sendMessage(receiver: string, fileName: string, file: File, lifetimeDays: number, maxDownloads: number, onProgress?: (percent: number) => void) {

    await initLibsodium();

    const username = sessionStorage.getItem("username");

    const PrivateKeyEncDecoded = getItemFromSessionStorage("PrivateKeyEnc");
    const PrivateKeySignDecoded = getItemFromSessionStorage("PrivateKeySign");

    // Get receiver's public encryption key
    const responsePubKey = await getPublicKeyEncAPI(receiver);

    const PublicKeyEncReceiver = Base64.toUint8Array(responsePubKey.pub_enc);

    // Encrypt the filename
    const nonce_filename = sodium.randombytes_buf(sodium.crypto_box_NONCEBYTES);
    const cfilename = sodium.crypto_box_easy(new TextEncoder().encode(fileName), nonce_filename, PublicKeyEncReceiver, PrivateKeyEncDecoded);

    const cfilename_b64 = Base64.fromUint8Array(cfilename, true);
    const nonce_filename_b64 = Base64.fromUint8Array(nonce_filename, true);

    // Generate the nonce for the file
    const nonce_file = sodium.randombytes_buf(sodium.crypto_box_NONCEBYTES);
    const nonce_file_b64 = Base64.fromUint8Array(nonce_file, true);

    // Get the current timestamp
    const timestamp = new Date().toISOString();

    // Send the message
    const response = await sendMessageAPI(username!, receiver, cfilename_b64, nonce_filename_b64, nonce_file_b64, maxDownloads, lifetimeDays, timestamp, file.size);

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
        nonce_file: nonce_file,
        sender: username!,
        receiver: receiver,
        max_downloads: maxDownloads,
        lifetime: lifetimeDays,
        creation_time: timestamp,
        file_size: file.size,
        chunk_size: chunkSize,
    };

    // Update the signature with the metadata JSON structure
    sodium.crypto_sign_update(state, new TextEncoder().encode(JSON.stringify(metadata)));

    // Encrypt the file in chunks
    const totalLength = file.size;
    const totalLengthWithTags = totalLength + Math.ceil(totalLength / chunkSize) * (sodium.crypto_box_MACBYTES + sodium.crypto_box_NONCEBYTES);

    if (uploadUrls.length !== Math.ceil(file.size / chunkSize)) {
        throw new Error(errors.errorAPIRequestFailed);
    }

    let ETags: string[] = [];

    const shared_key = sodium.crypto_box_beforenm(PublicKeyEncReceiver, PrivateKeyEncDecoded);

    for (let offset = 0; offset < file.size; offset += chunkSize) {
        const slice = file.slice(offset, offset + chunkSize);
        const buf = new Uint8Array(await slice.arrayBuffer());

        // Generate nonce for this chunk
        const nonce_chunk = sodium.randombytes_buf(sodium.crypto_box_NONCEBYTES);

        // Encrypt the chunk
        const encryptedChunk = sodium.crypto_box_easy_afternm(buf, nonce_chunk, shared_key)

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
    const response3 = await finishUploadFileToS3(messageFileId, upload_id, ETags, Base64.fromUint8Array(signature, true));

    return {
        success: true,
        message: "Message sent successfully!",
    };
}

export { register, login, logout, sendMessage, getMessages, getOneMessage };