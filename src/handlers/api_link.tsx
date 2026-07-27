import { apiUrl, MAX_NETWORK_RETRIES, NETWORK_RETRY_DELAY } from "./config";
import { apiFetch } from "./api";
import * as errors from "../messages/errors";


async function postLinkMessageLoginStartAPI(id: string, client_login_start: string) {
    const response = await apiFetch(`${apiUrl}/link/message/${id}/login/start`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            client_login_start,
        }),
    });

    return (await response.json());
}

async function postLinkMessageLoginEndAPI(id: string, client_login_finish_result: string) {
    const response = await apiFetch(`${apiUrl}/link/message/${id}/login/end`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            client_login_finish_result,
        }),
    });

    return (await response.json());
}

async function getLinkMessageMetadataAPI(file_id: string) {

    const response = await apiFetch(`${apiUrl}/link/message/${file_id}/metadata`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    return (await response.json());
}

async function getLinkMessageAPI(id: string) {

    const response = await apiFetch(`${apiUrl}/link/message/${id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    return (await response.json());
}

async function sendLinkMessageStartAPI(client_registration_start: string) {

    const response = await apiFetch(`${apiUrl}/link/message/start`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            client_registration_start,
        }),
    });

    return (await response.json());
}

async function sendLinkMessageAPI(id: string, client_registration_finish: string, cfilename: string, nonce_filename: string, max_downloads: number, lifetime: number, creation_time: any, file_size: number) {

    const response = await apiFetch(`${apiUrl}/link/message`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            id,
            client_registration_finish,
            cfilename,
            nonce_filename,
            max_downloads,
            lifetime,
            creation_time,
            file_size,
        }),
    },
        {
            507: new Error(errors.errorMaxLinkTransfersReached),
        },
    );

    return (await response.json());
}

//
// Upload and Download to/from S3
//

async function finishUploadFileToS3Link(file_id: string, upload_id: string, etags: string[], mac: string, receiver_email?: string) {

    const response = await apiFetch(`${apiUrl}/link/message/uploadfinish/${file_id}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            upload_id,
            etags,
            mac,
            receiver_email,
        }),
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

export { postLinkMessageLoginStartAPI, postLinkMessageLoginEndAPI, getLinkMessageMetadataAPI, getLinkMessageAPI, sendLinkMessageStartAPI, sendLinkMessageAPI, finishUploadFileToS3Link, uploadFileToS3, finishUploadFileToS3, downloadFileFromS3 };