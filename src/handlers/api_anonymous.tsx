import * as opaque from "@serenity-kit/opaque";

import { apiUrl } from "./config";
import sodium from "libsodium-wrappers-sumo";

import * as errors from "../messages/errors";
import * as strings from "../messages/strings";


async function postAnonymousMessageLoginStartAPI(id: string, client_login_start: string) {
    const response = await fetch(`${apiUrl}/anonymous/message/${id}/login/start`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            client_login_start,
        }),
    });

    if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    return (await response.json());
}

async function postAnonymousMessageLoginEndAPI(id: string, client_login_finish_result: string) {
    const response = await fetch(`${apiUrl}/anonymous/message/${id}/login/end`, {
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

async function getAnonymousMessageMetadataAPI(file_id: string) {

    const response = await fetch(`${apiUrl}/anonymous/message/${file_id}/metadata`, {
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

async function getAnonymousMessageAPI(id: string) {

    const response = await fetch(`${apiUrl}/anonymous/message/${id}`, {
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

async function sendAnonymousMessageAPI(id: string, client_registration_finish: string, cfilename: string, nonce_filename: string, header: string, max_downloads: number, lifetime: number, creation_time: any, file_size: number) {

    const response = await fetch(`${apiUrl}/anonymous/message`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            id,
            client_registration_finish,
            cfilename,
            nonce_filename,
            header,
            max_downloads,
            lifetime,
            creation_time,
            file_size,
        }),
    });

    if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    return (await response.json());
}

//
// Upload and Download to/from S3
//

async function finishUploadFileToS3Anonymous(file_id: string, upload_id: string, etags: string[]) {

    const response = await fetch(`${apiUrl}/anonymous/message/uploadfinish/${file_id}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            upload_id,
            etags,
        }),
    });

    if (!response.ok) {
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
    }

    return response.status;
}

export { postAnonymousMessageLoginStartAPI, postAnonymousMessageLoginEndAPI, getAnonymousMessageMetadataAPI, getAnonymousMessageAPI, sendAnonymousMessageStartAPI, sendAnonymousMessageAPI, finishUploadFileToS3Anonymous };