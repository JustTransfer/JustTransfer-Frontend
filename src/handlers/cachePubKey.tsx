/*import { Base64 } from "js-base64";
import { getPublicKeyAPI, getPublicKeyEmailAPI } from "./api";

type PublicKeyPair = {
    email: string;
    enc_public_key: Uint8Array;
    sign_public_key: Uint8Array;
}

// Memory cache for public keys (Uuid, )
const memoryCache: Record<string, PublicKeyPair> = {};

export async function getKeyIdByEmail(email: string): Promise<string> {

    const response = await getPublicKeyEmailAPI(email);

    // Cache the public key in memory for future use
    const publicKeyEncBytes = Base64.toUint8Array(response.pub_enc);
    const publicKeySignBytes = Base64.toUint8Array(response.pub_sign);

    memoryCache[response.key_id] = {
        email: email,
        enc_public_key: publicKeyEncBytes,
        sign_public_key: publicKeySignBytes,
    };

    return response.key_id;
}

export async function getCachedPublicKeyEnc(keyId: string): Promise<{ email: string; publicKeyEnc: Uint8Array }> {

    if (memoryCache[keyId]) {
        return {
            email: memoryCache[keyId].email,
            publicKeyEnc: memoryCache[keyId].enc_public_key,
        };
    }

    // Get the public key from the server and cache it
    const result = await getPublicKeyAPI(keyId);
    const email = result.email;
    const publicKeyEnc = result.pub_enc;
    const publicKeySign = result.pub_sign;

    const publicKeyEncBytes = Base64.toUint8Array(publicKeyEnc);
    const publicKeySignBytes = Base64.toUint8Array(publicKeySign);

    memoryCache[keyId] = {
        email: email,
        enc_public_key: publicKeyEncBytes,
        sign_public_key: publicKeySignBytes,
    };

    return {
        email,
        publicKeyEnc: publicKeyEncBytes,
    };
}

export async function getCachedPublicKeySign(keyId: string): Promise<{ email: string; publicKeySign: Uint8Array }> {

    if (memoryCache[keyId]) {
        return {
            email: memoryCache[keyId].email,
            publicKeySign: memoryCache[keyId].sign_public_key,
        };
    }

    // Get the public key from the server and cache it
    const result = await getPublicKeyAPI(keyId);
    const email = result.email;
    const publicKeyEnc = result.pub_enc;
    const publicKeySign = result.pub_sign;

    const publicKeyEncBytes = Base64.toUint8Array(publicKeyEnc);
    const publicKeySignBytes = Base64.toUint8Array(publicKeySign);

    memoryCache[keyId] = {
        email: email,
        enc_public_key: publicKeyEncBytes,
        sign_public_key: publicKeySignBytes,
    };

    return {
        email,
        publicKeySign: publicKeySignBytes,
    };
}*/