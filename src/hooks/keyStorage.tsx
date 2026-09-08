import { Base64 } from 'js-base64';

const DB_NAME = "jt-secure-store";
const DB_VERSION = 1;
const STORE_NAME = "raw-keys";
const SESSION_META_KEY = "jt-session-meta";

// IndexedDB wrapper functions
function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = () => {
            req.result.createObjectStore(STORE_NAME);
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

async function idbSet(key: string, value: CryptoKey): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).put(value, key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

async function idbGet(key: string): Promise<CryptoKey | undefined> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const req = tx.objectStore(STORE_NAME).get(key);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

async function idbClear(): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).clear();
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

// Stores a raw key (base64-encoded, url-safe) in IndexedDB as a CryptoKey.
export async function storeRawKey(id: string, base64Value: string): Promise<void> {
    const bytes = Base64.toUint8Array(base64Value);
    const cryptoKey = await crypto.subtle.importKey(
        "raw", // bytes,
        bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer,
        { name: "HMAC", hash: "SHA-256" },
        true, // extractable
        ["sign", "verify"]
    );
    await idbSet(id, cryptoKey);
}

// Retrieves a raw key from IndexedDB as a base64-encoded string.
export async function getRawKeyAsBase64(id: string): Promise<string | null> {
    const cryptoKey = await idbGet(id);
    if (!cryptoKey) return null;

    if (!cryptoKey.extractable) {
        throw new Error(`Stored key "${id}" is not extractable; cannot retrieve raw bytes.`);
    }

    const raw = await crypto.subtle.exportKey("raw", cryptoKey);
    return Base64.fromUint8Array(new Uint8Array(raw), true);
}

// Persists session metadata in localStorage.
export function saveSessionMeta<T>(meta: T): void {
    localStorage.setItem(SESSION_META_KEY, JSON.stringify(meta));
}

// Loads session metadata from localStorage.
export function loadSessionMeta<T>(): T | null {
    const raw = localStorage.getItem(SESSION_META_KEY);
    if (!raw) return null;
    try {
        return JSON.parse(raw) as T;
    } catch {
        return null;
    }
}

// Clears all session-related data from localStorage and IndexedDB.
export async function clearAllKeyStorage(): Promise<void> {
    localStorage.removeItem(SESSION_META_KEY);
    await idbClear();
}