import * as opaque from "@serenity-kit/opaque";
import sodium from "libsodium-wrappers-sumo";
import { Base64 } from 'js-base64';

import { registerStartAPI, registerEndAPI, registerUpdateAPI, loginStartAPI, loginEndAPI, logoutAPI, getPublicKeyEncAPI, getPublicKeySignAPI, getMessagesAPI, sendMessageAPI } from "./api";
import { ConstructionOutlined } from "@mui/icons-material";

async function initLibsodium() {
    await sodium.ready;
}

function calculateMac(username: string, key: any) {

    const usernameBytes = new TextEncoder().encode(username);

    return sodium.crypto_auth(usernameBytes, key);
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
    const KeyPairSign = sodium.crypto_box_keypair();
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

    const result2 = await registerEndAPI(username, registrationRecord, cpriv_enc_b64, nonce_enc_b64, PublicKeyEnc_b64, cpriv_sign_b64, nonce_sign_b64, PublicKeySign_b64);

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

    // return {exportKeyDecoded, sessionKeyDecoded, PrivateKeyEnc, PublicKeyEnc, PrivateKeySign, PublicKeySign};
    sessionStorage.setItem("username", username);
    sessionStorage.setItem("exportKey", exportKey);
    sessionStorage.setItem("sessionKey", sessionKey);
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
    const sessionKey = sessionStorage.getItem("sessionKey");

    const sessionKeyDecoded = Base64.toUint8Array(sessionKey!).slice(0, 32); // Take only first 32 bytes

    const mac = calculateMac(username, sessionKeyDecoded);

    const response = await logoutAPI(username, Base64.fromUint8Array(mac, true));

    sessionStorage.clear();

    if (response === 200) {
        window.location.href = "/";
    } else {
        throw new Error("Logout failed.");
    }
}

async function sendMessage(sender: string, receiver: string, fileName: string, file: File, lifetimeDays: number, maxDownloads: number) {

    await initLibsodium();

    const username = sessionStorage.getItem("username");
    const sessionKey = sessionStorage.getItem("sessionKey");
    const exportKey = sessionStorage.getItem("exportKey");

    const PrivateKeySign = sessionStorage.getItem("PrivateKeySign");

    const sessionKeyDecoded = Base64.toUint8Array(sessionKey!).slice(0, 32); // Take only first 32 bytes
    const exportKeyDecoded = Base64.toUint8Array(exportKey!).slice(0, 32); // Take only first 32 bytes

    const PrivateKeySignDecoded = Base64.toUint8Array(PrivateKeySign!);

    const mac = calculateMac(username, sessionKeyDecoded);
}

async function getMessages() {

}

export { register, login, logout, sendMessage, getMessages };