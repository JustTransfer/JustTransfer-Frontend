import { Base64 } from "js-base64";
import { getPublicKeyEncAPI, getPublicKeySignAPI } from "./api";

const memoryCacheEnc: Record<string, Uint8Array> = {};

export async function getCachedPublicKeyEnc(userId: string): Promise<Uint8Array> {

    if (memoryCacheEnc[userId]) return memoryCacheEnc[userId];

    // Get the public key from the server and cache it
    const result = await getPublicKeyEncAPI(userId);
    const publicKeyEnc = result.pub_enc;
    const publicKeyEncBytes = Base64.toUint8Array(publicKeyEnc);
    memoryCacheEnc[userId] = publicKeyEncBytes;

    return publicKeyEncBytes;
}

const memoryCacheSign: Record<string, Uint8Array> = {};

export async function getCachedPublicKeySign(userId: string): Promise<Uint8Array> {

    if (memoryCacheSign[userId]) return memoryCacheSign[userId];

    // Get the public key from the server and cache it
    const result = await getPublicKeySignAPI(userId);
    const publicKeySign = result.pub_sign;
    const publicKeySignBytes = Base64.toUint8Array(publicKeySign);
    memoryCacheSign[userId] = publicKeySignBytes;

    return publicKeySignBytes;
}