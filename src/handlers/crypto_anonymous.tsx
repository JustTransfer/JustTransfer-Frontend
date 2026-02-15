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
    let { id, cfilename, nonce_filename, file_id, header, creation_time, lifetime, max_downloads, number_downloads, file_size, chunk_size, mac } = result2.message;

    await initLibsodium();

    // Get the Encoded fileds of the message
    cfilename = Base64.toUint8Array(cfilename);
    nonce_filename = Base64.toUint8Array(nonce_filename);
    header = Base64.toUint8Array(header);

    // Decrypt the filename and check auth data
    const auth_data = {
        max_downloads: max_downloads,
        lifetime: lifetime,
        creation_time: creation_time,
        file_size: file_size,
        chunk_size: chunk_size,
    };

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
            id, cfilename, filename, nonce_filename, message_id, file_id, header, creation_time, lifetime, max_downloads, number_downloads, file_size, chunk_size
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

    // Get the message content
    const exportKeyFileDecoded = Base64.toUint8Array(exportKey).slice(32, 64);
    const state = sodium.crypto_secretstream_xchacha20poly1305_init_pull(message.header, exportKeyFileDecoded);

    const decryptChunk = (chunk: Uint8Array) => {
        const { message: decryptedChunk, tag: tag } = sodium.crypto_secretstream_xchacha20poly1305_pull(state, chunk);
        console.log("tag:", tag);
        return { decryptedChunk, tag };
    };

    const tagSize = sodium.crypto_secretstream_xchacha20poly1305_ABYTES;
    await downloadFileFromS3(message.chunk_size, tagSize, async (chunk: any) => {
        const { decryptedChunk, tag } = decryptChunk(chunk);
        if (decryptedChunk) {
            await onChunk(decryptedChunk, message.filename); // send chunk progressively
        }

        if (tag === undefined) {
            return -1;
        }

        return tag;
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

    // Encrypt the filename and construct the auth data
    const auth_data = {
        max_downloads: maxDownloads,
        lifetime: lifetimeDays,
        creation_time: timestamp,
        file_size: file.size,
        chunk_size: chunkSize,
    };

    const nonce_filename = sodium.randombytes_buf(sodium.crypto_aead_aegis256_NPUBBYTES);
    const cfilename = sodium.crypto_aead_aegis256_encrypt(new TextEncoder().encode(fileName), new TextEncoder().encode(JSON.stringify(auth_data)), null, nonce_filename, exportKeyMetadataDecoded);

    const cfilename_b64 = Base64.fromUint8Array(cfilename, true);
    const nonce_filename_b64 = Base64.fromUint8Array(nonce_filename, true);

    // Encrypt the file in chunks
    const { state, header } = sodium.crypto_secretstream_xchacha20poly1305_init_push(exportKeyFileDecoded);
    const header_b64 = Base64.fromUint8Array(header, true);
    const totalLength = file.size;
    //const totalLengthWithTags = totalLength + Math.ceil(totalLength / chunkSize) * sodium.crypto_secretstream_xchacha20poly1305_ABYTES;

    // Send the initial request to get an upload ID
    const response2 = await sendAnonymousMessageAPI(id, registrationRecord, cfilename_b64, nonce_filename_b64, header_b64, maxDownloads, lifetimeDays, timestamp, totalLength);
    const uploadUrls = response2.upload_urls;
    const transferId = response2.transfer_id;
    const upload_id = response2.upload_id;
    const message_file_id = response2.message_file_id;

    if (uploadUrls.length !== Math.ceil(file.size / chunkSize)) {
        throw new Error(errors.errorAPIRequestFailed);
    }

    let ETags: string[] = [];

    for (let offset = 0; offset < file.size; offset += chunkSize) {
        const slice = file.slice(offset, offset + chunkSize);
        const buf = new Uint8Array(await slice.arrayBuffer());
        const isFinal = offset + chunkSize >= file.size;

        const tag = isFinal
            ? sodium.crypto_secretstream_xchacha20poly1305_TAG_FINAL
            : 0;
        const encryptedChunk = sodium.crypto_secretstream_xchacha20poly1305_push(state, buf, null, tag);

        // Upload the chunk to S3
        const chunkUploadResp = await uploadFileToS3(uploadUrls[offset / chunkSize], encryptedChunk, void 0);
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