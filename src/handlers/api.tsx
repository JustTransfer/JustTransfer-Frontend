import * as opaque from "@serenity-kit/opaque";

const apiUrl = "http://localhost:3333";

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

async function sendMessageAPI(mac: string, sender: string, receiver: string, filename: string, nonce_filename: string, message: Uint8Array, nonce_message: string, max_downloads: number, lifetime: number, creation_time: any, signature: string) {

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

    // wrap encrypted bytes in a Blob
    const blob = new Blob([message], { type: "application/octet-stream" });
    form.append("message", blob, "encrypted.bin");

    const response = await fetch(`${apiUrl}/message`, {
        method: "POST",
        body: form,
    });

    if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    return response.status;
}

export { registerStartAPI, registerEndAPI, registerUpdateAPI, loginStartAPI, loginEndAPI, logoutAPI, getPublicKeyEncAPI, getPublicKeySignAPI, getMessagesAPI, getOneMessageAPI, sendMessageAPI };