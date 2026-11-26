import { apiUrl, MAX_NETWORK_RETRIES, NETWORK_RETRY_DELAY, DOWNLOAD_CONCURRENCY } from "./config";
import { apiFetch } from "./api";
import i18n from "../i18n";
import { pathSegment } from "./utils";


async function postLinkMessageLoginStartAPI(id: string, client_login_start: string) {
    const response = await apiFetch(`${apiUrl}/link/message/${pathSegment(id)}/login/start`, {
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
    const response = await apiFetch(`${apiUrl}/link/message/${pathSegment(id)}/login/end`, {
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

    const response = await apiFetch(`${apiUrl}/link/message/${pathSegment(file_id)}/metadata`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    return (await response.json());
}

async function getLinkMessageAPI(id: string) {

    const response = await apiFetch(`${apiUrl}/link/message/${pathSegment(id)}`, {
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

async function sendLinkMessageAPI(id: string, client_registration_finish: string, c_enc_key: string, nonce_enc_key: string, c_mac_key: string, nonce_mac_key: string, cfilename: string, nonce_filename: string, max_downloads: number, lifetime: number, creation_time: any, file_size: number) {

    const response = await apiFetch(`${apiUrl}/link/message`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            id,
            client_registration_finish,
            c_enc_key,
            nonce_enc_key,
            c_mac_key,
            nonce_mac_key,
            cfilename,
            nonce_filename,
            max_downloads,
            lifetime,
            creation_time,
            file_size,
        }),
    },
        {
            507: new Error(i18n.t("errors:errorMaxLinkTransfersReached")),
            429: new Error(i18n.t("errors:errorInsufficientRessources")),
        },
    );

    return (await response.json());
}

async function updateLinkMessageAPI(id: string, auth_key: string, cfilename: string, nonce_filename: string, max_downloads: number, lifetime: number, mac: string, sender_key_id?: string, signature_metadata?: string, signature?: string) {

    const response = await apiFetch(`${apiUrl}/link/message/${pathSegment(id)}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            auth_key,
            cfilename,
            nonce_filename,
            max_downloads,
            lifetime,
            mac,
            sender_key_id,
            signature_metadata,
            signature,
        }),
    }, {}, { requiresSession: true });

    return response.status;
}

async function deleteLinkMessageAPI(id: string, auth_key: string) {

    const response = await apiFetch(`${apiUrl}/link/message/${pathSegment(id)}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            auth_key,
        }),
    }, {}, { requiresSession: true });

    return response.status;
}


async function updatePasswordLinkMessageStartAPI(id: string, client_registration_start: string) {

    const response = await apiFetch(`${apiUrl}/link/message/${pathSegment(id)}/password/start`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            client_registration_start,
        }),
    }, {}, { requiresSession: true });

    return (await response.json());
}

async function updatePasswordLinkMessageEndAPI(id: string, client_registration_finish: string, auth_key: string, c_enc_key: string, nonce_enc_key: string, c_mac_key: string, nonce_mac_key: string) {

    const response = await apiFetch(`${apiUrl}/link/message/${pathSegment(id)}/password/end`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            auth_key,
            client_registration_finish,
            c_enc_key,
            nonce_enc_key,
            c_mac_key,
            nonce_mac_key,
        }),
    }, {}, { requiresSession: true });

    return (await response.json());
}

//
// Upload and Download to/from S3
//

async function finishUploadFileToS3Link(id: string, file_id: string, upload_id: string, etags: string[], hash_file: string, mac: string, is_signed: boolean, receiver_email?: string, sender_key_id?: string, signature_metadata?: string, signature?: string) {

    const response = await apiFetch(`${apiUrl}/link/message/${pathSegment(id)}/uploadfinish/${pathSegment(file_id)}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            upload_id,
            etags,
            hash_file,
            mac,
            receiver_email,
            is_signed,
            sender_key_id,
            signature_metadata,
            signature,
        }),
    });

    return (await response.json());
}

//
// Upload and Download to/from S3
//

// Wait between two network retries, returning early if the transfer is aborted
function retryDelay(signal?: AbortSignal) {
    return new Promise<void>(resolve => {
        if (signal?.aborted) return resolve();
        const timer = setTimeout(done, NETWORK_RETRY_DELAY);
        function done() {
            clearTimeout(timer);
            signal?.removeEventListener("abort", done);
            resolve();
        }
        signal?.addEventListener("abort", done, { once: true });
    });
}

async function uploadFileToS3(url: string, cfile: Uint8Array<ArrayBuffer>, onProgress?: (percent: number) => void, signal?: AbortSignal) {
    // Wrap the encrypted chunk in a Blob (no copy) so it can be re-sent on retry
    const blob = new Blob([cfile]);

    let response: Response | undefined;
    for (let attempt = 1; attempt <= MAX_NETWORK_RETRIES; attempt++) {
        try {
            response = await fetch(url, {
                method: "PUT",
                body: blob, // send the encrypted file
                signal,
            });

            if (!response.ok) {
                throw new Error(i18n.t("errors:errorAPIRequestFailed"));
            }

            break; // Sucess
        } catch (error) {
            // Do not retry when the whole transfer was cancelled (e.g. another part failed)
            if (signal?.aborted || attempt === MAX_NETWORK_RETRIES) {
                throw error;
            }

            console.warn(`Upload attempt ${attempt}/${MAX_NETWORK_RETRIES} failed. Retrying in ${NETWORK_RETRY_DELAY / 1000} seconds...`);
            await retryDelay(signal);
        }
    }

    // Set the progress to 100% after successful upload
    onProgress?.(100);

    return { ETag: response!.headers.get("ETag") || "" };
}

// Download the byte range [start, end] (inclusive) of the object, with retries
async function downloadRangeFromS3(url: string, start: number, end: number, signal: AbortSignal) {

    const expectedLength = end - start + 1;

    for (let attempt = 1; ; attempt++) {
        try {
            const response = await fetch(url, {
                headers: { Range: `bytes=${start}-${end}` },
                signal,
            });

            // 206 for a partial response; 200 is only acceptable if the range starts at 0
            // (the server ignored the Range header), the length check below catches the rest.
            if (response.status !== 206 && !(response.status === 200 && start === 0)) {
                throw new Error(i18n.t("errors:errorAPIRequestFailed"));
            }

            const data = new Uint8Array(await response.arrayBuffer());
            if (data.length !== expectedLength) {
                throw new Error(i18n.t("errors:errorAPIRequestFailed"));
            }

            return data;
        } catch (error) {
            if (signal.aborted || attempt >= MAX_NETWORK_RETRIES) {
                throw error;
            }

            console.warn(`Download of bytes ${start}-${end} failed, retry ${attempt}/${MAX_NETWORK_RETRIES}. Retrying in ${NETWORK_RETRY_DELAY / 1000} seconds...`);
            await retryDelay(signal);
        }
    }
}

// Download file from S3 in parallel chunks and decrypting each chunk
async function downloadFileFromS3(fileSize: number, chunkSize: number, tagSize: number, decrypt: (chunk: Uint8Array) => Promise<number>, url: string, onProgress?: (percent: number) => void) {

    if (!Number.isSafeInteger(fileSize) || fileSize < 0 || !Number.isSafeInteger(chunkSize) || chunkSize <= 0) {
        throw new Error(i18n.t("errors:errorAPIRequestFailed"));
    }

    const chunkSizeWithTag = chunkSize + tagSize;
    const totalChunks = Math.ceil(fileSize / chunkSize);

    // Byte range of the i-th encrypted chunk (every chunk is full except possibly the last one)
    const chunkRange = (index: number) => {
        const plainLength = Math.min(chunkSize, fileSize - index * chunkSize);
        const start = index * chunkSizeWithTag;
        return { start, end: start + plainLength + tagSize - 1, plainLength };
    };

    const controller = new AbortController();
    const pending = new Map<number, Promise<Uint8Array>>();
    let scheduled = 0;

    // Start downloads until `limit` (exclusive) chunks have been requested
    const schedule = (limit: number) => {
        while (scheduled < Math.min(limit, totalChunks)) {
            const { start, end } = chunkRange(scheduled);
            const promise = downloadRangeFromS3(url, start, end, controller.signal);
            promise.catch(() => { }); // Rejections are handled when the chunk is awaited
            pending.set(scheduled, promise);
            scheduled++;
        }
    };

    let processed = 0;
    try {
        schedule(DOWNLOAD_CONCURRENCY);

        for (let index = 0; index < totalChunks; index++) {
            const chunk = await pending.get(index)!;
            pending.delete(index);

            // Keep the network busy while this chunk is being decrypted and written
            schedule(index + 1 + DOWNLOAD_CONCURRENCY);

            const ret = await decrypt(chunk);
            if (ret < 0) throw new Error(i18n.t("errors:errorFailureDecryption"));

            processed += chunkRange(index).plainLength;
            if (fileSize) onProgress?.(processed / fileSize * 100);
        }
    } finally {
        // Cancel any download still in flight (on error)
        controller.abort();
        pending.clear();
    }

    onProgress?.(100);
    return 0;
}

export { postLinkMessageLoginStartAPI, postLinkMessageLoginEndAPI, getLinkMessageMetadataAPI, getLinkMessageAPI, sendLinkMessageStartAPI, sendLinkMessageAPI, updateLinkMessageAPI, deleteLinkMessageAPI, updatePasswordLinkMessageStartAPI, updatePasswordLinkMessageEndAPI, finishUploadFileToS3Link, uploadFileToS3, downloadFileFromS3 };