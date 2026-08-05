import { apiUrl } from "./config";
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

async function registerStartAPI(email: string, client_registration_start: string) {

    const response = await apiFetch(`${apiUrl}/register/start`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email,
            client_registration_start,
        }),
    });

    return (await response.json());
}

async function registerEndAPI(email: string, client_registration_finish: string, cpriv_enc: string, nonce_priv_enc: string, pub_enc: string, cpriv_sign: string, nonce_priv_sign: string, pub_sign: string) {

    const response = await apiFetch(`${apiUrl}/register/end`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
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
            409: new Error(errors.errorEmailTaken),
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

async function loginStartAPI(email: string, client_registration_start: string) {
    const response = await apiFetch(`${apiUrl}/login/start`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email,
            client_registration_start,
        }),
    });

    return (await response.json());
}

async function loginEndAPI(email: string, client_login_finish_result: string) {

    const response = await apiFetch(`${apiUrl}/login/end`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email,
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

async function deleteAccountAPI(email: string) {

    const response = await apiFetch(`${apiUrl}/user/${email}`, {
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

async function getPublicKeyEmailAPI(email: string) {

    const response = await apiFetch(`${apiUrl}/user/${email}/pubkey`, {
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

async function getSavedTransfersAPI() {

    const response = await apiFetch(`${apiUrl}/user/saved-transfer`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    return (await response.json());
}

async function addSavedTransferAPI(nonce_transfer_id: string, enc_transfer_id: string, nonce_password: string, enc_password: string, nonce_auth_key?: string, enc_auth_key?: string) {

    const response = await apiFetch(`${apiUrl}/user/saved-transfer`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            nonce_transfer_id,
            enc_transfer_id,
            nonce_password,
            enc_password,
            nonce_auth_key,
            enc_auth_key,
        }),
    });

    return response.status;
}

async function deleteSavedTransferAPI(saved_transfer_id: string) {

    const response = await apiFetch(`${apiUrl}/user/saved-transfer/${saved_transfer_id}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
    });

    return response.status;
}

export { apiFetch, registerStartAPI, registerEndAPI, registerUpdateAPI, putNewKeyAPI, loginStartAPI, loginEndAPI, logoutAPI, verifyEmailAPI, requestResetPasswordAPI, endPasswordResetAPI, getAccountInfoAPI, deleteAccountAPI, getPublicKeyAPI, getPublicKeyEmailAPI, getSavedTransfersAPI, addSavedTransferAPI, deleteSavedTransferAPI };