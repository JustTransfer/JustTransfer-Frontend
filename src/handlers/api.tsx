import * as opaque from "@serenity-kit/opaque";

import { apiUrl } from "./config";
import sodium from "libsodium-wrappers-sumo";

import * as errors from "../messages/errors";
import * as strings from "../messages/strings";

async function registerStartAPI(username: string, client_registration_start: string) {

    const response = await fetch(`${apiUrl}/register/start`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username,
            client_registration_start,
        }),
    });

    if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    return (await response.json());
}

async function registerEndAPI(username: string, email: string, client_registration_finish: string, cpriv_enc: string, nonce_priv_enc: string, pub_enc: string, cpriv_sign: string, nonce_priv_sign: string, pub_sign: string) {

    const response = await fetch(`${apiUrl}/register/end`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username,
            email,
            client_registration_finish,
            cpriv_enc,
            nonce_priv_enc,
            pub_enc,
            cpriv_sign,
            nonce_priv_sign,
            pub_sign,
        }),
    });

    if (response.status === 409) {
        throw new Error(errors.errorUsernameEmailTaken);
    } else if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    return (await response.json());
}

type KeyPairsEncodedUpdate = {
    id: string;

    enc_public_key: string;
    enc_nonce_private_key: string;
    enc_cipher_private_key: string;

    sign_public_key: string;
    sign_nonce_private_key: string;
    sign_cipher_private_key: string;
}

async function registerUpdateAPI(client_registration_finish: string, keys: KeyPairsEncodedUpdate[]) {
    const response = await fetch(`${apiUrl}/register/update`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            client_registration_finish,
            keys,
        }),
    });

    if (response.status === 401) {
        throw new Error(errors.errorChangePassword);
    } else if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    return (await response.json());

}

type NewKeyPairsEncoded = {
    enc_public_key: string;
    enc_nonce_private_key: string;
    enc_cipher_private_key: string;

    sign_public_key: string;
    sign_nonce_private_key: string;
    sign_cipher_private_key: string;
}

async function putNewKeyAPI(key: NewKeyPairsEncoded) {

    const response = await fetch(`${apiUrl}/user/addkey`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            key,
        }),
    });

    if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    return (await response.json());
}

async function loginStartAPI(username: string, client_registration_start: string) {
    const response = await fetch(`${apiUrl}/login/start`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username,
            client_registration_start,
        }),
    });

    if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    return (await response.json());
}

async function loginEndAPI(username: string, client_login_finish_result: string) {

    const response = await fetch(`${apiUrl}/login/end`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username,
            client_login_finish_result,
        }),
    });

    if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    return (await response.json());
}

async function logoutAPI() {

    const response = await fetch(`${apiUrl}/logout`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    return response.status;
}

async function getAccountInfoAPI() {

    const response = await fetch(`${apiUrl}/user`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    return (await response.json());
}

async function deleteAccountAPI(username: string) {

    const response = await fetch(`${apiUrl}/user/${username}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    return response.status;
}

async function getPublicKeyAPI(pub_key_id: string) {

    const response = await fetch(`${apiUrl}/pubkey/${pub_key_id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (response.status === 404) {
        throw new Error(errors.errorPublicKeyNotFound);
    } else if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    return (await response.json());
}

async function getPublicKeyUsernameAPI(username: string) {

    const response = await fetch(`${apiUrl}/user/${username}/pubkey`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (response.status === 404) {
        throw new Error(errors.errorUserNotFound);
    } else if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    return (await response.json());
}

async function getMessagesAPI() {

    const response = await fetch(`${apiUrl}/messages`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    return (await response.json());
}

async function getSentMessagesAPI() {

    const response = await fetch(`${apiUrl}/messages/sent`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    return (await response.json());
}

async function getOneMessageAPI(file_id: string) {

    const response = await fetch(`${apiUrl}/message/${file_id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    return (await response.json());
}

async function sendMessageAPI(sender_key_id: string, receiver_key_id: string, cfilename: string, nonce_filename: string, nonce_message: string, max_downloads: number, lifetime: number, creation_time: any, file_size: number) {


    const response = await fetch(`${apiUrl}/message`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            sender_key_id,
            receiver_key_id,
            cfilename,
            nonce_filename,
            nonce_message,
            max_downloads,
            lifetime,
            creation_time,
            file_size,
        }),
    });

    if (response.status === 403) {
        throw new Error(errors.errorInsufficientRessources);
    } else if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    return (await response.json());
}

async function deleteMessageAPI(message_id: string) {

    const response = await fetch(`${apiUrl}/message/${message_id}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    return response.status;
}

//
// Upload and Download to/from S3
//

async function uploadFileToS3(url: string, cfile: Uint8Array, onProgress?: (percent: number) => void) {
    // Convert Uint8Array to Blob
    const blob = new Blob([new Uint8Array(cfile)]);

    const response = await fetch(url, {
        method: "PUT",
        body: blob, // send the encrypted file
    });

    if (!response.ok) {
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
    }

    // Set the progress to 100% after successful upload
    onProgress?.(100);

    return { ETag: response.headers.get("ETag") || "" };
}

async function finishUploadFileToS3(file_id: string, upload_id: string, etags: string[], signature: string) {

    const response = await fetch(`${apiUrl}/message/uploadfinish/${file_id}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            upload_id,
            etags,
            signature,
        }),
    });

    if (!response.ok) {
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
    }

    return response.status;
}

async function downloadFileFromS3(chunkSize: number, tagSize: number, decrypt: (chunk: Uint8Array) => Promise<number>, url: string, onProgress?: (percent: number) => void) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Download failed: ${response.status} ${response.statusText}`);
    }

    // If no progress tracking requested, just return the blob as before
    if (!onProgress || !response.body) {
        return response.blob();
    }

    // --- Stream the response ---
    const contentLength = Number(response.headers.get("Content-Length") || 0);
    const reader = response.body.getReader();
    let received = 0;

    let chunk = new Uint8Array(0);

    const chunkSizeWithTag = chunkSize + tagSize;

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
            // Append new data to the existing chunk without using spread (avoids downlevelIteration requirement)
            if (chunk.length === 0) {
                chunk = value;
            } else {
                const concatenated = new Uint8Array(chunk.length + value.length);
                concatenated.set(chunk, 0);
                concatenated.set(value, chunk.length);
                chunk = concatenated;
            }

            if (chunk.length < chunkSizeWithTag) {
                continue; // Wait for more data
            }

            // Process full chunks
            let offset = 0;
            while (offset + chunkSizeWithTag <= chunk.length) {
                const fullChunk = chunk.slice(offset, offset + chunkSizeWithTag);
                const ret = await decrypt(fullChunk);
                if (ret < 0) throw new Error(errors.errorFailureDecryption);

                received += fullChunk.length;
                offset += chunkSizeWithTag;

                if (contentLength) onProgress?.((received / contentLength) * 100);
            }

            // Keep any remaining bytes for the next iteration
            chunk = chunk.slice(offset);
        }
    }

    // Process any remaining bytes as the final chunk
    if (chunk.length > 0) {
        const ret = await decrypt(chunk);
        if (ret < 0) throw new Error(errors.errorFailureDecryption);
    }

    return 0; // Success
}

export { registerStartAPI, registerEndAPI, registerUpdateAPI, putNewKeyAPI, loginStartAPI, loginEndAPI, logoutAPI, getAccountInfoAPI, deleteAccountAPI, getPublicKeyAPI, getPublicKeyUsernameAPI, getMessagesAPI, getSentMessagesAPI, getOneMessageAPI, sendMessageAPI, deleteMessageAPI, uploadFileToS3, finishUploadFileToS3, downloadFileFromS3 };