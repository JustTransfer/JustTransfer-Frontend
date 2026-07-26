import { apiUrl } from "./config";
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

async function finishUploadFileToS3Link(file_id: string, upload_id: string, etags: string[], mac: string) {

    const response = await apiFetch(`${apiUrl}/link/message/uploadfinish/${file_id}`, {
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

export { postLinkMessageLoginStartAPI, postLinkMessageLoginEndAPI, getLinkMessageMetadataAPI, getLinkMessageAPI, sendLinkMessageStartAPI, sendLinkMessageAPI, finishUploadFileToS3Link };