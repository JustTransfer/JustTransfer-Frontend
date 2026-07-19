import { apiUrl } from "./config";
import { apiFetch } from "./api";
import * as errors from "../messages/errors";


async function postAnonymousMessageLoginStartAPI(id: string, client_login_start: string) {
    const response = await apiFetch(`${apiUrl}/anonymous/message/${id}/login/start`, {
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

async function postAnonymousMessageLoginEndAPI(id: string, client_login_finish_result: string) {
    const response = await apiFetch(`${apiUrl}/anonymous/message/${id}/login/end`, {
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

async function getAnonymousMessageMetadataAPI(file_id: string) {

    const response = await apiFetch(`${apiUrl}/anonymous/message/${file_id}/metadata`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    return (await response.json());
}

async function getAnonymousMessageAPI(id: string) {

    const response = await apiFetch(`${apiUrl}/anonymous/message/${id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    return (await response.json());
}

async function sendAnonymousMessageStartAPI(client_registration_start: string) {

    const response = await apiFetch(`${apiUrl}/anonymous/message/start`, {
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

async function sendAnonymousMessageAPI(id: string, client_registration_finish: string, cfilename: string, nonce_filename: string, max_downloads: number, lifetime: number, creation_time: any, file_size: number) {

    const response = await apiFetch(`${apiUrl}/anonymous/message`, {
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
            507: new Error(errors.errorMaxAnonymousTransfersReached),
        },
    );

    return (await response.json());
}

//
// Upload and Download to/from S3
//

async function finishUploadFileToS3Anonymous(file_id: string, upload_id: string, etags: string[], mac: string) {

    const response = await apiFetch(`${apiUrl}/anonymous/message/uploadfinish/${file_id}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            upload_id,
            etags,
            mac,
        }),
    });

    return response.status;
}

export { postAnonymousMessageLoginStartAPI, postAnonymousMessageLoginEndAPI, getAnonymousMessageMetadataAPI, getAnonymousMessageAPI, sendAnonymousMessageStartAPI, sendAnonymousMessageAPI, finishUploadFileToS3Anonymous };