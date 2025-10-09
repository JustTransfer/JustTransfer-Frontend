import * as opaque from "@serenity-kit/opaque";
import sodium, { sodium_version_string } from "libsodium-wrappers-sumo";
import { Base64 } from 'js-base64';
import { ConstructionOutlined } from "@mui/icons-material";

import { frontendUrl, chunkSize } from "./config";

import { registerStartAPI, registerEndAPI, registerUpdateAPI, loginStartAPI, loginEndAPI, logoutAPI, getPublicKeyEncAPI, getPublicKeySignAPI, getMessagesAPI, getOneMessageAPI, sendMessageAPI, getAnonymousMessageMetadataStartAPI, getAnonymousMessageMetadataAPI, getAnonymousMessageAPI, sendAnonymousMessageStartAPI, sendAnonymousMessageAPI, sendAnonymousChunkAPI } from "./api";
import { convertCompilerOptionsFromJson } from "typescript";

async function initLibsodium() {
    await sodium.ready;
}

function getItemFromSessionStorage(key: string): Uint8Array {
    const item = sessionStorage.getItem(key);
    if (!item) {
        throw new Error(`Item ${key} not found in session storage`);
    }

    return Base64.toUint8Array(item);
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
        message: "Account created successfully!",
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
    const sessionKeyDecoded = Base64.toUint8Array(sessionKey).slice(0, 32); // Take only first 32 bytes

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

    // Calculate MAC
    const mac = sodium.crypto_auth(username, sessionKeyDecoded)

    sessionStorage.setItem("username", username);
    sessionStorage.setItem("exportKey", Base64.fromUint8Array(exportKeyDecoded));
    sessionStorage.setItem("sessionKey", Base64.fromUint8Array(sessionKeyDecoded));
    sessionStorage.setItem("mac", Base64.fromUint8Array(mac));
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
    const mac = getItemFromSessionStorage("mac");

    try {
        let response = await logoutAPI(username!, Base64.fromUint8Array(mac, true));
    } catch (e) {
        console.error("Logout API call failed:", e);
    }

    sessionStorage.clear();
    window.location.href = "/";
}

async function getMessages() {

    await initLibsodium();

    const username = sessionStorage.getItem("username");

    const PrivateKeyEncDecoded = getItemFromSessionStorage("PrivateKeyEnc");
    const mac = getItemFromSessionStorage("mac");

    const response = await getMessagesAPI(username!, Base64.fromUint8Array(mac, true));

    // For each message:
    for (let msg of response.messages) {

        // Get the Encoded fileds of the message
        msg.signature = Base64.toUint8Array(msg.signature);
        msg.filename = Base64.toUint8Array(msg.filename);
        msg.nonce_filename = Base64.toUint8Array(msg.nonce_filename);
        msg.nonce_message = Base64.toUint8Array(msg.nonce_message);

        // Get the public key enc of the sender to decrypt the filename and file
        const responsePubKeyEnc = await getPublicKeyEncAPI(username!, Base64.fromUint8Array(mac, true), msg.sender);
        const PublicKeyEncSender = Base64.toUint8Array(responsePubKeyEnc.pub_enc);

        // Decrypt the filename to display it in the inbox
        const filenameBytes = sodium.crypto_box_open_easy(msg.filename, msg.nonce_filename, PublicKeyEncSender, PrivateKeyEncDecoded);
        const filename = new TextDecoder().decode(filenameBytes);

        msg.filename_dec = filename;
    }


    return response.messages;
}

async function getOneMessage(message: any, onProgress?: (percent: number) => void) {

    await initLibsodium();

    const username = sessionStorage.getItem("username");

    const PrivateKeyEncDecoded = getItemFromSessionStorage("PrivateKeyEnc");
    const mac = getItemFromSessionStorage("mac");

    // Get the message content
    const blobFile = await getOneMessageAPI(username!, Base64.fromUint8Array(mac, true), message.message_id, onProgress);
    const arrayBuffer = await blobFile.arrayBuffer();
    message.message = new Uint8Array(arrayBuffer);

    // Get the public key sign of the sender to check signature
    const responsePubKey = await getPublicKeySignAPI(username!, Base64.fromUint8Array(mac, true), message.sender);
    const PublicKeySignSender = Base64.toUint8Array(responsePubKey.pub_sign);

    // Hash the file
    const fileHash = sodium.crypto_generichash(32, message.message);

    // Check the signature
    const payload = message.filename.toString() + message.nonce_filename.toString() + fileHash.toString() + message.nonce_message.toString() + message.sender + message.receiver + message.max_downloads.toString() + message.lifetime.toString() + message.creation_time.toString();

    message.signatureValid = sodium.crypto_sign_verify_detached(message.signature, new TextEncoder().encode(payload), PublicKeySignSender);

    if (!message.signatureValid) {
        console.error("Invalid signature for message from", message.sender);
        return message;
    }

    // Get the public key enc of the sender to decrypt the filename and file
    const responsePubKeyEnc = await getPublicKeyEncAPI(username!, Base64.fromUint8Array(mac, true), message.sender);
    const PublicKeyEncSender = Base64.toUint8Array(responsePubKeyEnc.pub_enc);

    // Decrypt the filename
    const filenameBytes = sodium.crypto_box_open_easy(message.filename, message.nonce_filename, PublicKeyEncSender, PrivateKeyEncDecoded);
    const filename = new TextDecoder().decode(filenameBytes);

    message.filename_dec = filename;

    // Decrypt the file
    const fileBytes = sodium.crypto_box_open_easy(message.message, message.nonce_message, PublicKeyEncSender, PrivateKeyEncDecoded);

    message.message = fileBytes;

    return message;
}

async function sendMessage(receiver: string, fileName: string, file: File, lifetimeDays: number, maxDownloads: number, onProgress?: (percent: number) => void) {

    await initLibsodium();

    const username = sessionStorage.getItem("username");

    const PrivateKeyEncDecoded = getItemFromSessionStorage("PrivateKeyEnc");
    const PrivateKeySignDecoded = getItemFromSessionStorage("PrivateKeySign");
    const mac = getItemFromSessionStorage("mac");

    // Get receiver's public encryption key
    const responsePubKey = await getPublicKeyEncAPI(username!, Base64.fromUint8Array(mac, true), receiver);

    const PublicKeyEncReceiver = Base64.toUint8Array(responsePubKey.pub_enc);

    // Encrypt the filename
    const nonce_filename = sodium.randombytes_buf(sodium.crypto_box_NONCEBYTES);
    const cfilename = sodium.crypto_box_easy(new TextEncoder().encode(fileName), nonce_filename, PublicKeyEncReceiver, PrivateKeyEncDecoded);

    const cfilename_b64 = Base64.fromUint8Array(cfilename, true);
    const nonce_filename_b64 = Base64.fromUint8Array(nonce_filename, true);

    // Encrypt the file
    const fileBuffer = await file.arrayBuffer();
    const fileBytes = new Uint8Array(fileBuffer);

    const nonce_file = sodium.randombytes_buf(sodium.crypto_box_NONCEBYTES);
    const cfile = sodium.crypto_box_easy(fileBytes, nonce_file, PublicKeyEncReceiver, PrivateKeyEncDecoded);

    const nonce_file_b64 = Base64.fromUint8Array(nonce_file, true);

    // Hash the file
    const fileHash = sodium.crypto_generichash(32, cfile);

    // Get the current timestamp
    const timestamp = new Date().toISOString();

    // Sign the message
    const payload = cfilename.toString() + nonce_filename.toString() + fileHash.toString() + nonce_file.toString() + username + receiver + maxDownloads.toString() + lifetimeDays.toString() + timestamp.toString();

    const signature = sodium.crypto_sign_detached(new TextEncoder().encode(payload), PrivateKeySignDecoded);

    // Send the message
    const response = await sendMessageAPI(Base64.fromUint8Array(mac, true), username!, receiver, cfilename_b64, nonce_filename_b64, cfile, nonce_file_b64, maxDownloads, lifetimeDays, timestamp, Base64.fromUint8Array(signature, true), onProgress);

    return {
        success: true,
        message: "Message sent successfully!",
    };
}

///
/// Anonymous functions
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
    const mac = sodium.crypto_auth(message_id, sessionKeyDecoded)

    // Save keys in session storage with message id
    sessionStorage.setItem(`exportKey_${message_id}`, exportKey);
    sessionStorage.setItem(`sessionKey_${message_id}`, sessionKey);
    sessionStorage.setItem(`mac_${message_id}`, Base64.fromUint8Array(mac));

    const result2 = await getAnonymousMessageMetadataAPI(message_id, finishLoginRequest);

    let { id, filename, nonce_filename, message_id_received, header, creation_time, lifetime, max_downloads, number_downloads } = result2.message;

    await initLibsodium();

    // Get the Encoded fileds of the message
    filename = Base64.toUint8Array(filename);
    nonce_filename = Base64.toUint8Array(nonce_filename);
    header = Base64.toUint8Array(header);

    // Decrypt the filename to display it in the inbox
    const filenameBytes = sodium.crypto_secretbox_open_easy(filename, nonce_filename, Base64.toUint8Array(exportKey).slice(0, 32));
    filename = new TextDecoder().decode(filenameBytes);

    return {
        success: true,
        message: "Message metadata retrieved successfully!",
        messageData: {
            id, filename, nonce_filename, message_id, header, creation_time, lifetime, max_downloads, number_downloads
        }
    };
}

async function getOneAnonymousMessage(message: any, onChunk: (chunk: Uint8Array, filename: string) => Promise<void>, onProgress?: (percent: number) => void) {

    await initLibsodium();

    const message_id = message.id;

    const exportKey = sessionStorage.getItem(`exportKey_${message_id}`);
    const sessionKey = sessionStorage.getItem(`sessionKey_${message_id}`);
    const mac = getItemFromSessionStorage(`mac_${message_id}`);

    if (!exportKey || !sessionKey || !mac) {
        throw new Error("Missing keys in session storage. Please retrieve the message metadata first.");
    }

    // Get the message content
    const state = sodium.crypto_secretstream_xchacha20poly1305_init_pull(message.header, Base64.toUint8Array(exportKey).slice(0, 32));

    const decryptChunk = (chunk: Uint8Array) => {
        const { message: decryptedChunk, tag } = sodium.crypto_secretstream_xchacha20poly1305_pull(state, chunk, null, null);
        return { decryptedChunk, tag };
    };


    await getAnonymousMessageAPI(async (chunk) => {
        const { decryptedChunk, tag } = decryptChunk(chunk);
        if (decryptedChunk) {
            await onChunk(decryptedChunk, message.filename); // send chunk progressively
        }
        return tag;
    }, Base64.fromUint8Array(mac, true), message_id, onProgress);

    return message;
}

async function sendMessageAnonymous(password: string, fileName: string, file: File, lifetimeDays: number, maxDownloads: number, onProgress?: (percent: number) => void) {

    await initLibsodium();

    // Create key from OPAQUE
    const { clientRegistrationState, registrationRequest } = opaque.client.startRegistration({ password });

    const response = await sendAnonymousMessageStartAPI(registrationRequest);

    const registrationResponse = response.result;
    const id = response.id;

    const { exportKey, serverStaticPublicKey, registrationRecord } = opaque.client.finishRegistration({
        clientRegistrationState,
        registrationResponse,
        password,
    });

    // Decode it from base64Url
    const exportKeyDecoded = Base64.toUint8Array(exportKey).slice(0, 32); // Take only first 32 bytes

    // Encrypt the filename
    const nonce_filename = sodium.randombytes_buf(sodium.crypto_box_NONCEBYTES);
    const cfilename = sodium.crypto_secretbox_easy(new TextEncoder().encode(fileName), nonce_filename, exportKeyDecoded);

    const cfilename_b64 = Base64.fromUint8Array(cfilename, true);
    const nonce_filename_b64 = Base64.fromUint8Array(nonce_filename, true);

    // Get the current timestamp
    const timestamp = new Date().toISOString();

    // Encrypt the file in chunks
    const { state, header } = sodium.crypto_secretstream_xchacha20poly1305_init_push(exportKeyDecoded);
    const header_b64 = Base64.fromUint8Array(header, true);
    const totalLength = file.size;

    // Send the initial request to get an upload ID
    const response2 = await sendAnonymousMessageAPI(id, registrationRecord, cfilename_b64, nonce_filename_b64, header_b64, maxDownloads, lifetimeDays, timestamp);
    const upload_id = response2.upload_id;

    for (let offset = 0; offset < file.size; offset += chunkSize) {
        const slice = file.slice(offset, offset + chunkSize);
        const buf = new Uint8Array(await slice.arrayBuffer());
        const isFinal = offset + chunkSize >= file.size;

        const tag = isFinal
            ? sodium.crypto_secretstream_xchacha20poly1305_TAG_FINAL
            : 0;
        const encryptedChunk = sodium.crypto_secretstream_xchacha20poly1305_push(state, buf, null, tag);

        // Upload the chunk
        const response2 = await sendAnonymousChunkAPI(upload_id, encryptedChunk, String(offset / chunkSize), String(Math.ceil(totalLength / chunkSize)));

        onProgress?.((offset + chunkSize) / totalLength * 100);
    }

    return {
        success: true,
        message: "Message sent successfully!",
        link: `${frontendUrl}/anonymous-transfer/${id}`
    };
}

export { register, login, logout, sendMessage, getMessages, getOneMessage, getOneAnonymousMessageMetadata, getOneAnonymousMessage, sendMessageAnonymous };