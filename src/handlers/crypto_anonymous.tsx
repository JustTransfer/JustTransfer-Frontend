import * as opaque from "@serenity-kit/opaque";
import sodium from "libsodium-wrappers-sumo";
import { Base64 } from 'js-base64';

import { frontendUrl } from "./config";

import { getAnonymousMessageMetadataStartAPI, getAnonymousMessageMetadataAPI, getAnonymousMessageAPI, sendAnonymousMessageStartAPI, sendAnonymousMessageAPI, uploadFileToS3, finishUploadFileToS3Anonymous, downloadFileFromS3 } from "./api";
import { getItemFromSessionStorage } from "./utils";
import { msgFailureMACVerification } from "./config";
import { NamedTupleMember } from "typescript";

async function initLibsodium() {
    await sodium.ready;
}

interface AnonymousMessageMacPayload {
    cfilename: Uint8Array;
    nonce_filename: Uint8Array;

    file_id: string;
    header: Uint8Array;

    max_downloads: number;
    lifetime: number;
    creation_time: string;

    file_size: number;
    chunk_size: number;

    first_chunk: Uint8Array;
}

const enc = new TextEncoder();

export function buildAnonymousMessageMacPayload(payload: AnonymousMessageMacPayload): Uint8Array {
    return enc.encode(JSON.stringify(payload));
}


///
/// Get Anonymous Message Metadata and Content
///

async function getOneAnonymousMessageMetadata(password: string, message_id: string) {

    const { clientLoginState, startLoginRequest } = opaque.client.startLogin({
        password,
    });

    const responseOpaque = await getAnonymousMessageMetadataStartAPI(message_id, startLoginRequest);

    const loginResponse = responseOpaque.result;

    const loginResult = opaque.client.finishLogin({
        clientLoginState,
        loginResponse,
        password,
    });

    if (!loginResult) {
        throw new Error("Login failed. Please check your credentials.");
    }

    const { exportKey, serverStaticPublicKey, finishLoginRequest, sessionKey } = loginResult;

    // Calculate MAC
    const sessionKeyDecoded = Base64.toUint8Array(sessionKey).slice(0, 32); // Take only first 32 bytes
    //const mac = sodium.crypto_auth(message_id, sessionKeyDecoded)

    // Save keys in session storage with message id
    sessionStorage.setItem(`exportKey_${message_id}`, exportKey);
    sessionStorage.setItem(`sessionKey_${message_id}`, sessionKey);
    //sessionStorage.setItem(`mac_${message_id}`, Base64.fromUint8Array(mac));

    const result2 = await getAnonymousMessageMetadataAPI(message_id, finishLoginRequest);

    let { id, cfilename, nonce_filename, file_id, header, creation_time, lifetime, max_downloads, number_downloads, file_size, chunk_size, mac } = result2.message;

    await initLibsodium();

    // Get the Encoded fileds of the message
    cfilename = Base64.toUint8Array(cfilename);
    nonce_filename = Base64.toUint8Array(nonce_filename);
    header = Base64.toUint8Array(header);
    mac = Base64.toUint8Array(mac);

    // Decrypt the filename to display it in the inbox
    const filenameBytes = sodium.crypto_secretbox_open_easy(cfilename, nonce_filename, Base64.toUint8Array(exportKey).slice(0, 32));
    const filename = new TextDecoder().decode(filenameBytes);

    return {
        success: true,
        message: "Message metadata retrieved successfully!",
        messageData: {
            id, cfilename, filename, nonce_filename, message_id, file_id, header, creation_time, lifetime, max_downloads, number_downloads, file_size, chunk_size, mac
        }
    };
}

///
/// Get Anonymous Message Content
///

async function getOneAnonymousMessage(message: any, onChunk: (chunk: Uint8Array, filename: string) => Promise<void>, onProgress?: (percent: number) => void) {

    await initLibsodium();

    const message_id = message.id;

    const exportKey = sessionStorage.getItem(`exportKey_${message_id}`);
    const sessionKey = sessionStorage.getItem(`sessionKey_${message_id}`);
    //const mac = getItemFromSessionStorage(`mac_${message_id}`);

    if (!exportKey || !sessionKey /*|| !mac*/) {
        throw new Error("Missing keys in session storage. Please retrieve the message metadata first.");
    }

    const repsonse = await getAnonymousMessageAPI(message_id);
    const downloadUrl = repsonse.download_url;

    // Construct the MAC data
    const data_mac = {
        cfilename: message.cfilename,
        nonce_filename: message.nonce_filename,
        file_id: message.file_id,
        header: message.header,
        max_downloads: message.max_downloads,
        lifetime: message.lifetime,
        creation_time: message.creation_time,
        file_size: message.file_size,
        chunk_size: message.chunk_size,
        first_chunk: new Uint8Array(),
    };

    // Get the message content
    const exportKeyDecoded = Base64.toUint8Array(exportKey).slice(0, 32); // Take only first 32 bytes
    const state = sodium.crypto_secretstream_xchacha20poly1305_init_pull(message.header, exportKeyDecoded);

    const decryptChunk = (chunk: Uint8Array) => {

        // Check if it's the first chunk to add it to MAC data
        if (data_mac.first_chunk.length === 0) {
            data_mac.first_chunk = new Uint8Array(chunk);
        }

        const { message: decryptedChunk, tag } = sodium.crypto_secretstream_xchacha20poly1305_pull(state, chunk, null, null);
        return { decryptedChunk, tag };
    };

    const tagSize = sodium.crypto_secretstream_xchacha20poly1305_ABYTES;
    await downloadFileFromS3(message.chunk_size, tagSize, async (chunk: any) => {
        const { decryptedChunk, tag } = decryptChunk(chunk);
        if (decryptedChunk) {
            await onChunk(decryptedChunk, message.filename); // send chunk progressively
        }
        return tag;
    }, downloadUrl, onProgress);

    // Verify MAC
    const valid = sodium.crypto_auth_verify(message.mac, JSON.stringify(data_mac), exportKeyDecoded);

    if (!valid) {
        throw new Error(msgFailureMACVerification);
    }

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
        throw new Error("Invalid chunk size received from server");
    }

    const { exportKey, serverStaticPublicKey, registrationRecord } = opaque.client.finishRegistration({
        clientRegistrationState,
        registrationResponse,
        password,
    });

    // Decode it from base64Url
    const exportKeyDecoded = Base64.toUint8Array(exportKey).slice(0, 32); // Take only first 32 bytes

    // Encrypt the filename
    const nonce_filename = sodium.randombytes_buf(sodium.crypto_box_NONCEBYTES);
    const cfilename = sodium.crypto_secretbox_easy(new TextEncoder().encode(fileName), nonce_filename, exportKeyDecoded); // TODO check Key usage !!!

    const cfilename_b64 = Base64.fromUint8Array(cfilename, true);
    const nonce_filename_b64 = Base64.fromUint8Array(nonce_filename, true);

    // Get the current timestamp
    const timestamp = new Date().toISOString();

    // Encrypt the file in chunks
    const { state, header } = sodium.crypto_secretstream_xchacha20poly1305_init_push(exportKeyDecoded); // TODO check Key usage !!!
    const header_b64 = Base64.fromUint8Array(header, true);
    const totalLength = file.size;
    //const totalLengthWithTags = totalLength + Math.ceil(totalLength / chunkSize) * sodium.crypto_secretstream_xchacha20poly1305_ABYTES;

    // Send the initial request to get an upload ID
    const response2 = await sendAnonymousMessageAPI(id, registrationRecord, cfilename_b64, nonce_filename_b64, header_b64, maxDownloads, lifetimeDays, timestamp, totalLength);
    const uploadUrls = response2.upload_urls;
    const transferId = response2.transfer_id;
    const upload_id = response2.upload_id;
    const message_file_id = response2.message_file_id;

    let data_mac = {
        cfilename: cfilename,
        nonce_filename: nonce_filename,
        file_id: message_file_id,
        header: header,
        max_downloads: maxDownloads,
        lifetime: lifetimeDays,
        creation_time: timestamp,
        file_size: file.size,
        chunk_size: chunkSize,
        first_chunk: new Uint8Array(),
    };

    if (uploadUrls.length !== Math.ceil(file.size / chunkSize)) {
        throw new Error("Number of upload URLs does not match number of chunks");
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

        // Add first chunk to mac data
        if (offset === 0) {
            data_mac.first_chunk = new Uint8Array(encryptedChunk);
        }

        // Upload the chunk to S3
        const chunkUploadResp = await uploadFileToS3(uploadUrls[offset / chunkSize], encryptedChunk, void 0);
        ETags.push(chunkUploadResp.ETag);

        // Update progress
        onProgress?.(Math.min(((offset + chunkSize) / totalLength) * 100, 100)); // Avoid going over 100% if the last chunk is smaller than chunkSize
    }

    // Calculate MAC
    const mac = sodium.crypto_auth(JSON.stringify(data_mac), exportKeyDecoded); // TODO check Key usage !!!

    // Finalize the upload
    const response3 = await finishUploadFileToS3Anonymous(message_file_id, upload_id, ETags, Base64.fromUint8Array(mac, true));

    return {
        success: true,
        message: "Message sent successfully!",
        link: `${frontendUrl}/anonymous-transfer/${transferId}`,
    };
}

export { getOneAnonymousMessageMetadata, getOneAnonymousMessage, sendMessageAnonymous };