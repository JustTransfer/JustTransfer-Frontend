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

export const PERSISTED_KEYS_INACTIVITY_MAX_AGE = 3 * 24 * 60 * 60 * 1000; // 3 days, in milliseconds
export const PERSISTED_KEYS_ABSOLUTE_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days, in milliseconds

export const MAX_NETWORK_RETRIES = 150;
export const NETWORK_RETRY_DELAY = 2000; // milliseconds

// Number of encrypted chunks (parts) transferred in parallel to/from object storage.
// Also bounds memory usage: roughly (CONCURRENCY + 1) * chunk_size bytes are held at once.
export const UPLOAD_CONCURRENCY = 4;
export const DOWNLOAD_CONCURRENCY = 4;
