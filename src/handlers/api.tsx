import { apiUrl, MAX_NETWORK_RETRIES, NETWORK_RETRY_DELAY } from "./config";
import * as errors from "../messages/errors";

async function apiFetch(input: RequestInfo, init?: RequestInit, specificErrors: Record<number, Error> = {}) {
    const response = await fetch(input, init);

    if (specificErrors[response.status]) {
        throw specificErrors[response.status];
    }

    if (response.status === 429) {
        throw new Error(errors.errorTooManyRequests);
    }

    if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    return response;
}

async function registerStartAPI(username: string, client_registration_start: string) {

    const response = await apiFetch(`${apiUrl}/register/start`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username,
            client_registration_start,
        }),
    });

    return (await response.json());
}

async function registerEndAPI(username: string, email: string, client_registration_finish: string, cpriv_enc: string, nonce_priv_enc: string, pub_enc: string, cpriv_sign: string, nonce_priv_sign: string, pub_sign: string) {

    const response = await apiFetch(`${apiUrl}/register/end`, {
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
    },
        {
            409: new Error(errors.errorUsernameEmailTaken),
            507: new Error(errors.errorMaxUserAccountsReached),
        },
    );

    return response.status;
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
    const response = await apiFetch(`${apiUrl}/register/update`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            client_registration_finish,
            keys,
        }),
    },
        {
            401: new Error(errors.errorChangePassword),
        },
    );

    return (await response.json());

}

async function putNewKeyAPI(enc_public_key: string, enc_nonce_private_key: string, enc_cipher_private_key: string, sign_public_key: string, sign_nonce_private_key: string, sign_cipher_private_key: string) {

    const response = await apiFetch(`${apiUrl}/user/addkey`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            enc_public_key,
            enc_nonce_private_key,
            enc_cipher_private_key,
            sign_public_key,
            sign_nonce_private_key,
            sign_cipher_private_key,
        }),
    });

    return (await response.json());
}

async function loginStartAPI(username: string, client_registration_start: string) {
    const response = await apiFetch(`${apiUrl}/login/start`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username,
            client_registration_start,
        }),
    });

    return (await response.json());
}

async function loginEndAPI(username: string, client_login_finish_result: string) {

    const response = await apiFetch(`${apiUrl}/login/end`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username,
            client_login_finish_result,
        }),
    },
        {
            403: new Error(errors.errorMailNotVerified),
        }
    );

    return (await response.json());
}

async function logoutAPI() {

    const response = await apiFetch(`${apiUrl}/logout`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
    });

    return response.status;
}

async function verifyEmailAPI(token: string) {

    const response = await apiFetch(`${apiUrl}/verify-email/${token}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
    });

    return response.status;
}

async function requestResetPasswordAPI(email: string) {

    const response = await apiFetch(`${apiUrl}/reset-password/request`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email,
        }),
    });

    return response.status;
}

async function endPasswordResetAPI(token: string, client_registration_finish: string, cpriv_enc: string, nonce_priv_enc: string, pub_enc: string, cpriv_sign: string, nonce_priv_sign: string, pub_sign: string) {

    const response = await apiFetch(`${apiUrl}/reset-password/end/${token}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            client_registration_finish,
            cpriv_enc,
            nonce_priv_enc,
            pub_enc,
            cpriv_sign,
            nonce_priv_sign,
            pub_sign,
        }),
    });

    return response.status;
}

async function getAccountInfoAPI() {

    const response = await apiFetch(`${apiUrl}/user`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    return (await response.json());
}

async function deleteAccountAPI(username: string) {

    const response = await apiFetch(`${apiUrl}/user/${username}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
    });

    return response.status;
}

async function getPublicKeyAPI(pub_key_id: string) {

    const response = await apiFetch(`${apiUrl}/pubkey/${pub_key_id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    },
        {
            404: new Error(errors.errorPublicKeyNotFound),
        }
    );

    return (await response.json());
}

async function getPublicKeyUsernameAPI(username: string) {

    const response = await apiFetch(`${apiUrl}/user/${username}/pubkey`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    },
        {
            404: new Error(errors.errorUserNotFound),
        }
    );

    return (await response.json());
}

async function getMessagesAPI() {

    const response = await apiFetch(`${apiUrl}/messages`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    return (await response.json());
}

async function getSentMessagesAPI() {

    const response = await apiFetch(`${apiUrl}/messages/sent`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    return (await response.json());
}

async function getOneMessageAPI(file_id: string) {

    const response = await apiFetch(`${apiUrl}/message/${file_id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    return (await response.json());
}

async function sendMessageAPI(sender_key_id: string, receiver_key_id: string, kem_ciphertext_filename: string, cfilename: string, nonce_filename: string, kem_ciphertext_file: string, max_downloads: number, lifetime: number, creation_time: any, file_size: number) {

    const response = await apiFetch(`${apiUrl}/message`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            sender_key_id,
            receiver_key_id,
            kem_ciphertext_filename,
            cfilename,
            nonce_filename,
            kem_ciphertext_file,
            max_downloads,
            lifetime,
            creation_time,
            file_size,
        }),
    },
        {
            403: new Error(errors.errorInsufficientRessources),
        }
    );

    return (await response.json());
}

async function deleteMessageAPI(message_id: string) {

    const response = await apiFetch(`${apiUrl}/message/${message_id}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
    });

    return response.status;
}

//
// Upload and Download to/from S3
//

async function uploadFileToS3(url: string, cfile: Uint8Array, onProgress?: (percent: number) => void) {
    // Convert Uint8Array to Blob
    const blob = new Blob([new Uint8Array(cfile)]);

    let response: Response | undefined;
    for (let attempt = 1; attempt <= MAX_NETWORK_RETRIES; attempt++) {
        try {
            response = await fetch(url, {
                method: "PUT",
                body: blob, // send the encrypted file
            });

            if (!response.ok) {
                throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
            }

            break; // Sucess
        } catch (error) {
            if (attempt === MAX_NETWORK_RETRIES) {
                throw error;
            }

            console.warn(`Upload attempt ${attempt}/${MAX_NETWORK_RETRIES} failed. Retrying in ${NETWORK_RETRY_DELAY / 1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, NETWORK_RETRY_DELAY));
        }
    }

    // Set the progress to 100% after successful upload
    onProgress?.(100);

    return { ETag: response!.headers.get("ETag") || "" };
}

async function finishUploadFileToS3(file_id: string, upload_id: string, etags: string[], signature_metadata: string, signature: string) {

    const response = await apiFetch(`${apiUrl}/message/uploadfinish/${file_id}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            upload_id,
            etags,
            signature_metadata,
            signature,
        }),
    });

    return response.status;
}

async function downloadFileFromS3(chunkSize: number, tagSize: number, decrypt: (chunk: Uint8Array) => Promise<number>, url: string, onProgress?: (percent: number) => void) {

    const chunkSizeWithTag = chunkSize + tagSize;
    let received = 0;
    let contentLength = 0;
    let chunk = new Uint8Array(0);

    for (let attempt = 0; attempt < MAX_NETWORK_RETRIES;) {

        let response: Response;
        try {
            response = await fetch(url, {
                headers: received > 0 || chunk.length > 0
                    ? { Range: `bytes=${received + chunk.length}-` }
                    : undefined
            });

            if (!response.ok && response.status !== 206) throw new Error(`Download failed: ${response.status} ${response.statusText}`);
            if (!response.body) throw new Error("Response body is empty.");

            if (contentLength === 0) {
                if (received === 0) {
                    contentLength = Number(response.headers.get("Content-Length") || 0);
                } else {
                    contentLength = received + Number(response.headers.get("Content-Length") || 0);
                }
            }

            const reader = response.body.getReader();

            while (true) {
                const { done, value } = await reader.read();

                if (done) break;
                if (!value) continue;

                if (chunk.length === 0) {
                    chunk = value;
                } else {
                    const tmp = new Uint8Array(chunk.length + value.length);
                    tmp.set(chunk);
                    tmp.set(value, chunk.length);
                    chunk = tmp;
                }

                // Process full chunks
                let offset = 0;
                while (offset + chunkSizeWithTag <= chunk.length) {

                    const fullChunk = chunk.slice(
                        offset,
                        offset + chunkSizeWithTag
                    );

                    const ret = await decrypt(fullChunk);
                    if (ret < 0) throw new Error(errors.errorFailureDecryption);

                    offset += chunkSizeWithTag;
                    received += chunkSizeWithTag;

                    if (contentLength) onProgress?.(received / contentLength * 100);
                }

                // Keep any remaining bytes for the next iteration
                chunk = chunk.slice(offset);
            }

            // Download finished
            break;

        } catch (err) {

            // If the error is a decryption failure, we should not retry, as it indicates a problem with the data or keys.
            if (err instanceof Error && err.message === errors.errorFailureDecryption) {
                throw err;
            }

            attempt++;
            if (attempt >= MAX_NETWORK_RETRIES) throw err;

            console.warn(`Download interrupted, retry ${attempt}/${MAX_NETWORK_RETRIES}. Retrying in ${NETWORK_RETRY_DELAY / 1000} seconds...`);
            await new Promise(r => setTimeout(r, NETWORK_RETRY_DELAY));
        }
    }

    // Process any remaining bytes as the final chunk
    if (chunk.length > 0) {
        const ret = await decrypt(chunk);
        if (ret < 0) throw new Error(errors.errorFailureDecryption);
    }

    onProgress?.(100);
    return 0;
}

export { apiFetch, registerStartAPI, registerEndAPI, registerUpdateAPI, putNewKeyAPI, loginStartAPI, loginEndAPI, logoutAPI, verifyEmailAPI, requestResetPasswordAPI, endPasswordResetAPI, getAccountInfoAPI, deleteAccountAPI, getPublicKeyAPI, getPublicKeyUsernameAPI, getMessagesAPI, getSentMessagesAPI, getOneMessageAPI, sendMessageAPI, deleteMessageAPI, uploadFileToS3, finishUploadFileToS3, downloadFileFromS3 };