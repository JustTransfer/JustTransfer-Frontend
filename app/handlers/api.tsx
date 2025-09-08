import * as opaque from "@serenity-kit/opaque";

const apiUrl = "http://localhost:3000";

async function registerStartAPI(username: string, client_registration_start: string): Promise<Response> {

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

function registerEndAPI() {

}

function registerUpdateAPI() {

}

function loginStartAPI() {

}

function loginEndAPI() {

}

function logoutAPI() {

}

function getPublicKeyEncAPI() {

}

function getPublicKeySignAPI() {

}

function getMessagesAPI() {

}

function sendMessageAPI() {

}

export { registerStartAPI, registerEndAPI, registerUpdateAPI, loginStartAPI, loginEndAPI, logoutAPI, getPublicKeyEncAPI, getPublicKeySignAPI, getMessagesAPI, sendMessageAPI };