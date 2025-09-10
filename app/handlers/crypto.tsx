import * as opaque from "@serenity-kit/opaque";
import sodium from "libsodium-wrappers-sumo";
import { Base64 } from 'js-base64';

import { registerStartAPI, registerEndAPI, registerUpdateAPI, loginStartAPI, loginEndAPI, logoutAPI, getPublicKeyEncAPI, getPublicKeySignAPI, getMessagesAPI, sendMessageAPI } from "./api";
import { ConstructionOutlined } from "@mui/icons-material";

async function initLibsodium() {
    await sodium.ready;
}

function getMac() {

    // const username = sessionStorage.getItem("username");
    // const sessionKeyDecoded = getItemFromSessionStorage("sessionKey").slice(0, 32);

    // const usernameBytes = new TextEncoder().encode(username!);

    // return sodium.crypto_auth(usernameBytes, sessionKeyDecoded);

    const mac = sessionStorage.getItem("mac");
    if (!mac) {
        throw new Error("MAC not found in session storage");
    }
    const macArray = mac.split(",").map(num => parseInt(num));
    return new Uint8Array(macArray);
}

function getItemFromSessionStorage(key: string): Uint8Array {
    const item = sessionStorage.getItem(key);
    if (!item) {
        throw new Error(`Item ${key} not found in session storage`);
    }
    const itemArray = item.split(",").map(num => parseInt(num));
    return new Uint8Array(itemArray);
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
    sessionStorage.setItem("exportKey", exportKeyDecoded);
    sessionStorage.setItem("sessionKey", sessionKeyDecoded);
    sessionStorage.setItem("mac", mac);
    sessionStorage.setItem("PrivateKeyEnc", PrivateKeyEnc);
    sessionStorage.setItem("PublicKeyEnc", PublicKeyEnc);
    sessionStorage.setItem("PrivateKeySign", PrivateKeySign);
    sessionStorage.setItem("PublicKeySign", PublicKeySign);

    return {
        success: true,
        message: "Login successful!",
    };
}

async function logout() {

    await initLibsodium();

    const username = sessionStorage.getItem("username");

    const mac = getMac();

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

    const mac = getMac();

    const response = await getMessagesAPI(username!, Base64.fromUint8Array(mac, true));

    // For each message:
    for (let msg of response.messages) {

        // Get the public key sign of the sender to check signature
        const responsePubKey = await getPublicKeySignAPI(username!, Base64.fromUint8Array(mac, true), msg.sender);
        const PublicKeySignSender = Base64.toUint8Array(responsePubKey.pub_sign);

        // Get the Encoded fileds of the message
        msg.signature = Base64.toUint8Array(msg.signature);
        msg.filename = Base64.toUint8Array(msg.filename);
        msg.nonce_filename = Base64.toUint8Array(msg.nonce_filename);
        msg.message = Base64.toUint8Array(msg.message);
        msg.nonce_message = Base64.toUint8Array(msg.nonce_message);

        // Check the signature
        const payload = msg.filename + msg.nonce_filename + msg.message + msg.nonce_message + msg.sender + msg.receiver + msg.max_downloads.toString() + msg.lifetime.toString() + msg.creation_time.toString();

        const isValid = sodium.crypto_sign_verify_detached(msg.signature, new TextEncoder().encode(payload), PublicKeySignSender);

        msg.signatureValid = isValid;
        if (!isValid) {
            console.error("Invalid signature for message from", msg.sender);
            continue; // Skip this message
        }

        // Get the public key enc of the sender to decrypt the filename and file
        const responsePubKeyEnc = await getPublicKeyEncAPI(username!, Base64.fromUint8Array(mac, true), msg.sender);
        const PublicKeyEncSender = Base64.toUint8Array(responsePubKeyEnc.pub_enc);

        // Decrypt the filename
        const filenameBytes = sodium.crypto_box_open_easy(msg.filename, msg.nonce_filename, PublicKeyEncSender, PrivateKeyEncDecoded);
        const filename = new TextDecoder().decode(filenameBytes);

        msg.filename = filename;

        console.log("Decrypted filename:", filename);

        // Decrypt the file
        const fileBytes = sodium.crypto_box_open_easy(msg.message, msg.nonce_message, PublicKeyEncSender, PrivateKeyEncDecoded);

        msg.message = fileBytes;
    }


    return response.messages;
}

async function sendMessage(receiver: string, fileName: string, file: File, lifetimeDays: number, maxDownloads: number) {

    await initLibsodium();

    const username = sessionStorage.getItem("username");

    const PrivateKeyEncDecoded = getItemFromSessionStorage("PrivateKeyEnc");
    const PrivateKeySignDecoded = getItemFromSessionStorage("PrivateKeySign");

    const mac = getMac();

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

    const cfile_b64 = Base64.fromUint8Array(cfile, true);
    const nonce_file_b64 = Base64.fromUint8Array(nonce_file, true);

    // Get the current timestamp
    const timestamp = new Date().toISOString();

    // Sign the message
    const payload = cfilename + nonce_filename + cfile + nonce_file + username + receiver + maxDownloads.toString() + lifetimeDays.toString() + timestamp.toString();

    const signature = sodium.crypto_sign_detached(new TextEncoder().encode(payload), PrivateKeySignDecoded);

    // Send the message
    const response = await sendMessageAPI(Base64.fromUint8Array(mac, true), username!, receiver, cfilename_b64, nonce_filename_b64, cfile_b64, nonce_file_b64, maxDownloads, lifetimeDays, timestamp, Base64.fromUint8Array(signature, true));

    return {
        success: true,
        message: "Message sent successfully!",
    };
}

export { register, login, logout, sendMessage, getMessages };