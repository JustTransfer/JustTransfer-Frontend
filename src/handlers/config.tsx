import i18n from "../i18n";
import { version } from "../../package.json";

function getEnv(name: string): string {
    const value = import.meta.env[name];
    if (value === undefined || value.trim() === "") {
        throw new Error(i18n.t("errors:errorEnvironmentVariableMissing", { name }));
    }
    return value;
}

export const frontendVersion = `v${version}`;
export const apiUrl = getEnv("VITE_API_URL");
export const frontendUrl = getEnv("VITE_FRONTEND_URL");
export const emailAddress = getEnv("VITE_EMAIL_INFO");

export const linkTransferGeneratedPasswordLen = 20; // Bytes

export const MAX_NETWORK_RETRIES = 150;
export const NETWORK_RETRY_DELAY = 2000; // milliseconds