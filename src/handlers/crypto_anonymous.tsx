import * as opaque from "@serenity-kit/opaque";
import sodium from "libsodium-wrappers-sumo";
import { Base64 } from 'js-base64';

import { frontendUrl } from "./config";

import { uploadFileToS3, downloadFileFromS3 } from "./api";
import { postAnonymousMessageLoginStartAPI, postAnonymousMessageLoginEndAPI, getAnonymousMessageMetadataAPI, getAnonymousMessageAPI, sendAnonymousMessageStartAPI, sendAnonymousMessageAPI, finishUploadFileToS3Anonymous } from "./api_anonymous";

import * as errors from "../messages/errors";
import * as strings from "../messages/strings";

async function initLibsodium() {
    await sodium.ready;
}

///
/// Get Anonymous Message Metadata and Content
///

async function getOneAnonymousMessageMetadata(password: string, message_id: string) {

    const { clientLoginState, startLoginRequest } = opaque.client.startLogin({
        password,
    });

    const responseOpaque = await postAnonymousMessageLoginStartAPI(message_id, startLoginRequest);

    const loginResponse = responseOpaque.result;

    const loginResult = opaque.client.finishLogin({
        clientLoginState,
        loginResponse,
        password,
    });

    if (!loginResult) {
        throw new Error(errors.errorLoginFailed);
    }

    const { exportKey, serverStaticPublicKey, finishLoginRequest, sessionKey } = loginResult;

    // Finish the login process
    const responseOpaqueFinish = await postAnonymousMessageLoginEndAPI(message_id, finishLoginRequest);

    // Decode export key
    const exportKeyMetadataDecoded = Base64.toUint8Array(exportKey).slice(0, 32);

    // Get the message metadata
    const result2 = await getAnonymousMessageMetadataAPI(message_id);
    let { id, cfilename, nonce_filename, file_id, creation_time, lifetime, max_downloads, number_downloads, file_size, chunk_size, mac } = result2.message;

    await initLibsodium();

    // Get the Encoded fileds of the message
    cfilename = Base64.toUint8Array(cfilename);
    nonce_filename = Base64.toUint8Array(nonce_filename);

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
        const filenameBytes = sodium.crypto_aead_aegis256_decrypt(null, cfilename, new TextEncoder().encode(JSON.stringify(auth_data)), nonce_filename, exportKeyMetadataDecoded);
        filename = new TextDecoder().decode(filenameBytes);
    } catch (e) {
        throw new Error(errors.errorFailureMACVerification);
    }

    return {
        success: true,
        exportKey,
        message: "Message metadata retrieved successfully!",
        messageData: {
            id, cfilename, filename, nonce_filename, message_id, file_id, creation_time, lifetime, max_downloads, number_downloads, file_size, chunk_size
        }
    };
}

///
/// Get Anonymous Message Content
///

async function getOneAnonymousMessage(exportKey: string, message: any, onChunk: (chunk: Uint8Array, filename: string) => Promise<void>, onProgress?: (percent: number) => void) {

    await initLibsodium();

    const message_id = message.id;
    const repsonse = await getAnonymousMessageAPI(message_id);
    const downloadUrl = repsonse.download_url;

    // Get the key for the file decryption
    const exportKeyFileDecoded = Base64.toUint8Array(exportKey).slice(32, 64);

    const decryptChunk = (chunk: Uint8Array) => {
        const nonce_chunk = chunk.slice(0, sodium.crypto_aead_aegis256_NPUBBYTES);
        const ciphertext_chunk = chunk.slice(sodium.crypto_aead_aegis256_NPUBBYTES);

        try {
            const decryptedChunk = sodium.crypto_aead_aegis256_decrypt(null, ciphertext_chunk, null, nonce_chunk, exportKeyFileDecoded);
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

    return message;
}

///
/// Send Anonymous Message
///

async function sendMessageAnonymous(password: string, fileName: string, file: File, lifetimeDays: number, maxDownloads: number, onProgress?: (percent: number) => void) {

    await initLibsodium();

    // Create key from OPAQUE
    const { clientRegistrationState, registrationRequest } = opaque.client.startRegistration({ password });

    const response = await sendAnonymousMessageStartAPI(registrationRequest);

    const registrationResponse = response.result;
    const id = response.id;
    const chunkSize = response.chunk_size

    if (!chunkSize || chunkSize <= 0) {
        throw new Error(errors.errorAPIRequestFailed);
    }

    const { exportKey, serverStaticPublicKey, registrationRecord } = opaque.client.finishRegistration({
        clientRegistrationState,
        registrationResponse,
        password,
    });

    if (!exportKey || exportKey.length < 64) {
        throw new Error(errors.errorKeyDerivationFailed);
    }

    // Decode the export key
    const exportKeyMetadataDecoded = Base64.toUint8Array(exportKey).slice(0, 32); // Take only first 32 bytes for the filename and auth data
    const exportKeyFileDecoded = Base64.toUint8Array(exportKey).slice(32, 64); // Take last 32 bytes for MAC key for the file encryption

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

    // Authenticate the auth data and encrypt the filename
    const nonce_filename = sodium.randombytes_buf(sodium.crypto_aead_aegis256_NPUBBYTES);
    const cfilename = sodium.crypto_aead_aegis256_encrypt(new TextEncoder().encode(fileName), new TextEncoder().encode(JSON.stringify(auth_data)), null, nonce_filename, exportKeyMetadataDecoded);

    const cfilename_b64 = Base64.fromUint8Array(cfilename, true);
    const nonce_filename_b64 = Base64.fromUint8Array(nonce_filename, true);

    // Send the initial request to get an upload ID
    const response2 = await sendAnonymousMessageAPI(id, registrationRecord, cfilename_b64, nonce_filename_b64, maxDownloads, lifetimeDays, timestamp, totalLength);
    const uploadUrls = response2.upload_urls;
    const transferId = response2.transfer_id;
    const upload_id = response2.upload_id;
    const message_file_id = response2.message_file_id;

    if (uploadUrls.length !== Math.ceil(file.size / chunkSize)) {
        throw new Error(errors.errorAPIRequestFailed);
    }

    let ETags: string[] = [];

    for (let offset = 0; offset < file.size; offset += chunkSize) {

        // Get the chunk from the file
        const slice = file.slice(offset, offset + chunkSize);
        const buf = new Uint8Array(await slice.arrayBuffer());

        // Encrypt the chunk
        const nonce_chunk = sodium.randombytes_buf(sodium.crypto_aead_aegis256_NPUBBYTES);
        const encryptedChunk = sodium.crypto_aead_aegis256_encrypt(buf, null, null, nonce_chunk, exportKeyFileDecoded);

        // Add nonce at the beginning of the chunk
        const encryptedChunkWithNonce = new Uint8Array(nonce_chunk.length + encryptedChunk.length);
        encryptedChunkWithNonce.set(nonce_chunk, 0);
        encryptedChunkWithNonce.set(encryptedChunk, nonce_chunk.length);

        // Upload the chunk to S3
        const chunkUploadResp = await uploadFileToS3(uploadUrls[offset / chunkSize], encryptedChunkWithNonce, void 0);
        ETags.push(chunkUploadResp.ETag);

        // Update progress
        onProgress?.(Math.min(((offset + chunkSize) / totalLength) * 100, 100)); // Avoid going over 100% if the last chunk is smaller than chunkSize
    }

    // Finalize the upload
    const response3 = await finishUploadFileToS3Anonymous(message_file_id, upload_id, ETags);

    return {
        success: true,
        message: "Message sent successfully!",
        link: `${frontendUrl}/anonymous-transfer/${transferId}`,
    };
}

export { getOneAnonymousMessageMetadata, getOneAnonymousMessage, sendMessageAnonymous };