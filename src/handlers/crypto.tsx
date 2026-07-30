import { Base64 } from 'js-base64';

import { getSodium, getOpaque } from "./utils";

import { registerStartAPI, registerEndAPI, registerUpdateAPI, endPasswordResetAPI, putNewKeyAPI, loginStartAPI, loginEndAPI, logoutAPI, getSavedTransfersAPI, addSavedTransferAPI } from "./api";

import * as errors from "../messages/errors";

async function generateAndEncryptKeys(exportKeyDecoded: Uint8Array) {

    const sodium = await getSodium();

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

async function decryptKeys(keys: any[], exportKeyDecoded: Uint8Array) {

    const sodium = await getSodium();

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

async function encryptkeys(keys: any[], exportKeyDecoded: Uint8Array) {

    const sodium = await getSodium();

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

async function register(email: string, password: string) {

    const opaque = await getOpaque();
    const { clientRegistrationState, registrationRequest } = opaque.client.startRegistration({ password });

    const response = await registerStartAPI(email, registrationRequest);

    const registrationResponse = response.result;

    const { exportKey, serverStaticPublicKey: _serverStaticPublicKey, registrationRecord } = opaque.client.finishRegistration({
        clientRegistrationState,
        registrationResponse,
        password,
    });

    // Decode it from base64Url
    const exportKeyDecoded = Base64.toUint8Array(exportKey).slice(0, 32); // Take only first 32 bytes

    // Generate encryption key pair and encrypt private keys with the export key
    const keys = await generateAndEncryptKeys(exportKeyDecoded);

    await registerEndAPI(email, registrationRecord, keys.enc_cipher_private_key, keys.enc_nonce_private_key, keys.enc_public_key, keys.sign_cipher_private_key, keys.sign_nonce_private_key, keys.sign_public_key);


    // Return success
    return {
        success: true,
        message: "Register successful!",
        exportKey: Base64.fromUint8Array(exportKeyDecoded, true),
    };
}

async function changePassword(email: string, password: string, newPassword: string, keys: any[]) {

    // Login to verify password and refresh session
    const response = await loginProcess(email, password);

    if (!response.success) {
        throw Error(errors.errorWrongPassword);
    }

    const opaque = await getOpaque();
    const { clientRegistrationState, registrationRequest } = opaque.client.startRegistration({ password: newPassword });

    const response2 = await registerStartAPI(email, registrationRequest);

    const registrationResponse = response2.result;

    const { exportKey, serverStaticPublicKey: _serverStaticPublicKey, registrationRecord } = opaque.client.finishRegistration({
        clientRegistrationState,
        registrationResponse,
        password: newPassword,
    });

    // Decode it from base64Url
    const exportKeyDecoded = Base64.toUint8Array(exportKey).slice(0, 32); // Take only first 32 bytes

    // Encrypt the keys with the new export key
    const encryptedKeys = await encryptkeys(keys, exportKeyDecoded);

    const response3 = await registerUpdateAPI(registrationRecord, encryptedKeys);

    // Decrypt the keys with the new export key
    const decryptedKeys = await decryptKeys(response3.keys, exportKeyDecoded);

    // Return success
    return {
        success: true,
        message: "Password change successful!",
        exportKey: Base64.fromUint8Array(exportKeyDecoded, true),
        keys: decryptedKeys,
    };
}

async function resetPassword(email: string, password: string, token: string) {

    const opaque = await getOpaque();
    const { clientRegistrationState, registrationRequest } = opaque.client.startRegistration({ password: password });

    const response2 = await registerStartAPI(email, registrationRequest);

    const registrationResponse = response2.result;

    const { exportKey, serverStaticPublicKey: _serverStaticPublicKey, registrationRecord } = opaque.client.finishRegistration({
        clientRegistrationState,
        registrationResponse,
        password: password,
    });

    // Decode it from base64Url
    const exportKeyDecoded = Base64.toUint8Array(exportKey).slice(0, 32); // Take only first 32 bytes

    // Generate new keys
    const encryptedKeys = await generateAndEncryptKeys(exportKeyDecoded);

    await endPasswordResetAPI(
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

async function generateNewKeys(email: string, password: string, exportKey: string) {

    // Login to verify password and refresh session
    const response = await loginProcess(email, password);
    if (!response.success) {
        throw Error(errors.errorWrongPassword);
    }

    // Decode export key from base64
    const exportKeyDecoded = Base64.toUint8Array(exportKey).slice(0, 32); // Take only first 32 bytes

    // Generate encryption key pair and encrypt private keys with the export key
    const newKey = await generateAndEncryptKeys(exportKeyDecoded);

    const result = await putNewKeyAPI(newKey.enc_public_key, newKey.enc_nonce_private_key, newKey.enc_cipher_private_key, newKey.sign_public_key, newKey.sign_nonce_private_key, newKey.sign_cipher_private_key);

    // Decrypt the keys with the export key
    const decryptedKeys = await decryptKeys(result.keys, exportKeyDecoded);

    return {
        success: true,
        message: "New keys generated successfully!",
        keys: decryptedKeys, // Return all keys including the new one
    };
}

async function loginProcess(email: string, password: string) {

    const opaque = await getOpaque();
    const { clientLoginState, startLoginRequest } = opaque.client.startLogin({
        password,
    });

    const response = await loginStartAPI(email, startLoginRequest);

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

    const { exportKey, serverStaticPublicKey: _serverStaticPublicKey, finishLoginRequest, sessionKey: _sessionKey } = loginResult;

    const result2 = await loginEndAPI(email, finishLoginRequest);

    // Decode it from base64Url
    const exportKeyDecoded = Base64.toUint8Array(exportKey).slice(0, 32); // Take only first 32 bytes

    let { keys, role } = result2;

    const decryptedKeys = await decryptKeys(keys, exportKeyDecoded);

    return {
        success: true,
        message: "Log in successful!",
        email,
        role,
        exportKey: Base64.fromUint8Array(exportKeyDecoded, true),
        keys: decryptedKeys,
    };
}

async function logoutProcess() {
    await logoutAPI();
}

async function getSavedTransfers(exportKey: string) {

    const sodium = await getSodium();

    const exportKeyDecoded = Base64.toUint8Array(exportKey);

    const response = await getSavedTransfersAPI();

    console.log("Saved transfers response:", response);
    console.log("test: ", response.saved_transfers);

    for (let transfer of response.saved_transfers) {
        // Convert the keys from base64 to Uint8Array
        const nonce_transfer_id = Base64.toUint8Array(transfer.nonce_transfer_id);
        const enc_transfer_id = Base64.toUint8Array(transfer.enc_transfer_id);
        const nonce_password = Base64.toUint8Array(transfer.nonce_password);
        const enc_password = Base64.toUint8Array(transfer.enc_password);

        // Decrypt transfer_id and password
        const transfer_id = sodium.crypto_aead_aegis256_decrypt(null, enc_transfer_id, null, nonce_transfer_id, exportKeyDecoded);
        const transfer_password = sodium.crypto_aead_aegis256_decrypt(null, enc_password, null, nonce_password, exportKeyDecoded);

        // Store decrypted values back in the transfer object
        transfer.transfer_id = transfer_id;
        transfer.transfer_password = transfer_password;
    }

    return response.saved_transfers;
}

async function addSavedTransfer(transfer_id: string, transfer_password: string, exportKey: string) {

    const sodium = await getSodium();

    const exportKeyDecoded = Base64.toUint8Array(exportKey);

    // Encrypt the transfer_id
    const nonce_transfer_id = sodium.randombytes_buf(sodium.crypto_aead_aegis256_NPUBBYTES);
    const enc_transfer_id = sodium.crypto_aead_aegis256_encrypt(transfer_id, null, null, nonce_transfer_id, exportKeyDecoded);

    // Encrypt the transfer_password
    const nonce_password = sodium.randombytes_buf(sodium.crypto_aead_aegis256_NPUBBYTES);
    const enc_password = sodium.crypto_aead_aegis256_encrypt(transfer_password, null, null, nonce_password, exportKeyDecoded);

    const response = await addSavedTransferAPI(
        Base64.fromUint8Array(nonce_transfer_id, true),
        Base64.fromUint8Array(enc_transfer_id, true),
        Base64.fromUint8Array(nonce_password, true),
        Base64.fromUint8Array(enc_password, true)
    );

    return response;
}

export { register, changePassword, generateNewKeys, resetPassword, loginProcess, logoutProcess, getSavedTransfers, addSavedTransfer };