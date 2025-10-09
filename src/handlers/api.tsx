import * as opaque from "@serenity-kit/opaque";

import { apiUrl } from "./config";
import sodium from "libsodium-wrappers-sumo";

import { chunkSize } from "./config";

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

async function registerEndAPI(username: string, client_registration_finish: string, cpriv_enc: string, nonce_priv_enc: string, pub_enc: string, cpriv_sign: string, nonce_priv_sign: string, pub_sign: string) {

    const response = await fetch(`${apiUrl}/register/end`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username,
            client_registration_finish,
            cpriv_enc,
            nonce_priv_enc,
            pub_enc,
            cpriv_sign,
            nonce_priv_sign,
            pub_sign,
        }),
    });

    if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    return response.status;
}

async function registerUpdateAPI() {
    // TODO
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

async function logoutAPI(username: string, mac: string) {

    const response = await fetch(`${apiUrl}/logout`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username,
            mac,
        }),
    });

    if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    return response.status;
}

async function getPublicKeyEncAPI(username: string, mac: string, user_pub_key: string) {

    const response = await fetch(`${apiUrl}/pubkey/enc`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username,
            mac,
            user_pub_key,
        }),
    });

    if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    return (await response.json());
}

async function getPublicKeySignAPI(username: string, mac: string, user_pub_key: string) {

    const response = await fetch(`${apiUrl}/pubkey/sign`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username,
            mac,
            user_pub_key,
        }),
    });

    if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    return (await response.json());
}

async function getMessagesAPI(username: string, mac: string) {

    const response = await fetch(`${apiUrl}/messages`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username,
            mac,
        }),
    });

    if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    return (await response.json());
}

async function getOneMessageAPI(username: string, mac: string, message_id: string, onProgress?: (percent: number) => void) {

    const response = await fetch(`${apiUrl}/message/${message_id}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username,
            mac,
        }),
    });

    if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    // return response.blob();

    // If no progress tracking requested, just return the blob as before
    if (!onProgress || !response.body) {
        return response.blob();
    }

    // --- Stream the response ---
    const contentLength = Number(response.headers.get("Content-Length") || 0);
    const reader = response.body.getReader();
    let received = 0;
    const chunks: Uint8Array[] = [];

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
            chunks.push(value); // value is Uint8Array
            received += value.length;
            if (contentLength) onProgress?.((received / contentLength) * 100);
        }
    }

    return new Blob(chunks as BlobPart[], { type: "application/octet-stream" });
}

async function sendMessageAPI(mac: string, sender: string, receiver: string, filename: string, nonce_filename: string, message: Uint8Array, nonce_message: string, max_downloads: number, lifetime: number, creation_time: any, signature: string, onProgress?: (percent: number) => void) {

    return new Promise((resolve, reject) => {
        const form = new FormData();
        form.append("mac", mac);
        form.append("sender", sender);
        form.append("receiver", receiver);
        form.append("filename", filename);
        form.append("nonce_filename", nonce_filename);
        form.append("nonce_message", nonce_message);
        form.append("max_downloads", String(max_downloads));
        form.append("lifetime", String(lifetime));
        form.append("creation_time", creation_time);
        form.append("signature", signature);

        const blob = new Blob([new Uint8Array(message)], { type: "application/octet-stream" });
        form.append("message", blob, "encrypted.bin");

        const xhr = new XMLHttpRequest();
        xhr.open("POST", `${apiUrl}/message`);

        // Listen to progress events
        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable && onProgress) {
                const percent = (event.loaded / event.total) * 100;
                onProgress(percent);
            }
        };

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(xhr.status);
            } else {
                reject(new Error(`Error: ${xhr.status} ${xhr.statusText}`));
            }
        };

        xhr.onerror = () => reject(new Error("Network error"));
        xhr.send(form);
    });
}

async function getAnonymousMessageMetadataStartAPI(id: string, client_registration_start: string) {
    const response = await fetch(`${apiUrl}/anonymous/message/${id}/start`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            client_registration_start,
        }),
    });

    if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    return (await response.json());
}

async function getAnonymousMessageMetadataAPI(message_id: string, client_login_finish_result: string,) {

    const response = await fetch(`${apiUrl}/anonymous/message/${message_id}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            client_login_finish_result,
        }),
    });

    if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    return (await response.json());
}

async function getAnonymousMessageAPI(decrypt: (chunk: Uint8Array) => Promise<number>, mac: string, message_id: string, onProgress?: (percent: number) => void) {

    const response = await fetch(`${apiUrl}/anonymous/message/${message_id}/content`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            mac,
        }),
    });

    if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    // return response.blob();

    // If no progress tracking requested, just return the blob as before
    if (!onProgress || !response.body) {
        return response.blob();
    }

    // --- Stream the response ---
    const contentLength = Number(response.headers.get("Content-Length") || 0);
    const reader = response.body.getReader();
    let received = 0;

    let chunk = new Uint8Array(0);

    const chunkSizeWithTag = chunkSize + sodium.crypto_secretstream_xchacha20poly1305_ABYTES;

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
                if (ret < 0) throw new Error("Decryption of chunk failed");

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
        if (ret < 0) throw new Error("Decryption of final chunk failed");
    }

    return 0; // Success
}

async function sendAnonymousMessageStartAPI(client_registration_start: string) {

    const response = await fetch(`${apiUrl}/anonymous/message/start`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            client_registration_start,
        }),
    });

    if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    return (await response.json());
}

async function sendAnonymousMessageAPI(id: string, client_registration_finish: string, filename: string, nonce_filename: string, header: string, max_downloads: number, lifetime: number, creation_time: any) {

    const response = await fetch(`${apiUrl}/anonymous/message`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            id,
            client_registration_finish,
            filename,
            nonce_filename,
            header,
            max_downloads,
            lifetime,
            creation_time,
        }),
    });

    if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    return (await response.json());
}

async function sendAnonymousChunkAPI(id: string, encryptedChunk: Uint8Array, index: string, maxChunk: string) {

    const chunk = encryptedChunk instanceof Uint8Array ? encryptedChunk : new Uint8Array(encryptedChunk);

    const response = await fetch(`${apiUrl}/anonymous/message/chunk`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/octet-stream",
            "X-Upload-ID": id,
            "X-Chunk-Index": index,
            "X-Total-Chunks": maxChunk,
        },
        body: new Blob([chunk as any]),
    });

    if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    return response.status;
}

export { registerStartAPI, registerEndAPI, registerUpdateAPI, loginStartAPI, loginEndAPI, logoutAPI, getPublicKeyEncAPI, getPublicKeySignAPI, getMessagesAPI, getOneMessageAPI, sendMessageAPI, getAnonymousMessageMetadataStartAPI, getAnonymousMessageMetadataAPI, getAnonymousMessageAPI, sendAnonymousMessageStartAPI, sendAnonymousMessageAPI, sendAnonymousChunkAPI };