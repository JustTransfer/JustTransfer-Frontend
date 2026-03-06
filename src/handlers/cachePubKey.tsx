import { Base64 } from "js-base64";
import { getPublicKeyAPI, getPublicKeyUsernameAPI } from "./api";
import { Key } from "react";

type PublicKeyPair = {
    enc_public_key: Uint8Array;
    sign_public_key: Uint8Array;
}

// Memory cache for public keys (Uuid, )
const memoryCache: Record<string, PublicKeyPair> = {};

export async function getKeyIdByUsername(username: string): Promise<string> {

    const response =  await getPublicKeyUsernameAPI(username);

    // Cache the public key in memory for future use
    const publicKeyEncBytes = Base64.toUint8Array(response.pub_enc);
    const publicKeySignBytes = Base64.toUint8Array(response.pub_sign);

    memoryCache[response.key_id] = {
        enc_public_key: publicKeyEncBytes,
        sign_public_key: publicKeySignBytes,
    };

    return response.key_id;
}

export async function getCachedPublicKeyEnc(keyId: string): Promise<Uint8Array> {

    if (memoryCache[keyId]) return memoryCache[keyId].enc_public_key;

    // Get the public key from the server and cache it
    const result = await getPublicKeyAPI(keyId);
    const publicKeyEnc = result.pub_enc;
    const publicKeySign = result.pub_sign;

    const publicKeyEncBytes = Base64.toUint8Array(publicKeyEnc);
    const publicKeySignBytes = Base64.toUint8Array(publicKeySign);

    memoryCache[keyId] = {
        enc_public_key: publicKeyEncBytes,
        sign_public_key: publicKeySignBytes,
    };

    return publicKeyEncBytes;
}

export async function getCachedPublicKeySign(keyId: string): Promise<Uint8Array> {

    if (memoryCache[keyId]) return memoryCache[keyId].sign_public_key;

    // Get the public key from the server and cache it
    const result = await getPublicKeyAPI(keyId);
    const publicKeyEnc = result.pub_enc;
    const publicKeySign = result.pub_sign;

    const publicKeyEncBytes = Base64.toUint8Array(publicKeyEnc);
    const publicKeySignBytes = Base64.toUint8Array(publicKeySign);

    memoryCache[keyId] = {
        enc_public_key: publicKeyEncBytes,
        sign_public_key: publicKeySignBytes,
    };

    return publicKeySignBytes;
}