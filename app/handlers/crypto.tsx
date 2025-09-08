import * as opaque from "@serenity-kit/opaque";
import sodium from "libsodium-wrappers-sumo";
import { Base64 } from 'js-base64';

import { registerStartAPI, registerEndAPI, registerUpdateAPI, loginStartAPI, loginEndAPI, logoutAPI, getPublicKeyEncAPI, getPublicKeySignAPI, getMessagesAPI, sendMessageAPI } from "./api";

async function register(username: string, email: string, password: string) {
    console.log("Registering user:", username, email);

    const { clientRegistrationState, registrationRequest } = opaque.client.startRegistration({ password });

    const response = await registerStartAPI(username, registrationRequest);

    console.log("Return code:", response.status);
    console.log("Response from /register/start:", response);

    const registrationResponse = response.result;

    const { exportKey, registrationRecord } = opaque.client.finishRegistration({
        clientRegistrationState,
        registrationResponse,
        password,
    });

    // Decode it from base64Url
    const exportKeyDecoded = Base64.toUint8Array(exportKey).slice(0, 32); // Take only first 32 bytes
    console.log("Export key decoded:", exportKeyDecoded);

    // Init libsodium TODO change place
    await sodium.ready;

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

    const result2 = await registerEndAPI(username, registrationRecord, cpriv_enc, nonce_enc, PublicKeyEnc, cpriv_sign, nonce_sign, PublicKeySign);

}

async function login(email: string, password: string) {
}

async function logout() {
}

async function sendMessage(receiver: string, fileName: string, file: File, lifetimeDays: number, maxDownloads: number) {
}

async function getMessages() {

}

export { register, login, logout, sendMessage, getMessages };