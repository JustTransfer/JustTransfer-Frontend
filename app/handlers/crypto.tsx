import * as opaque from "@serenity-kit/opaque";
import { registerStartAPI, registerEndAPI, registerUpdateAPI, loginStartAPI, loginEndAPI, logoutAPI, getPublicKeyEncAPI, getPublicKeySignAPI, getMessagesAPI, sendMessageAPI } from "./api";

async function register(username: string, email: string, password: string) {
    console.log("Registering user:", username, email);

    const { clientRegistrationState, registrationRequest } = opaque.client.startRegistration({ password });

    const result = await registerStartAPI(username, registrationRequest);

    console.log("Return code:", result.status);
    console.log("Response from /register/start:", result);
}

async function login(email: string, password: string) {
}

async function logout() {
}

async function sendMessage(receiver: string, fileName: string, file: File, lifetimeDays: number, maxDownloads: number) {
}

async function getMessages() {

}

export { register, login, logout, sendMessage, getMessages };