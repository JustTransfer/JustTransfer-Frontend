import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";

import * as errors from "../messages/errors";
import { storeRawKey, getRawKeyAsBase64, saveSessionMeta, loadSessionMeta, clearAllKeyStorage } from "./keyStorage";

type Key = {
    created_at: string;
    id: number;
    is_active: boolean;
    owner_id: number;
    revoked_at: string | null;
    enc_private_key: string;
    enc_public_key: string;
    sign_private_key: string;
    sign_public_key: string;
}

type LoginData = {
    email: string;
    role: string;
    exportKey: string;
    keys: Key[];
};

type updateKeysData = {
    exportKey: string;
    keys: Key[];
}

// Non-sensitive metadata kept in localStorage. Private key material and
// the export key are stripped out and stored separately in IndexedDB.
type SessionMeta = {
    email: string;
    role: string;
    keyIds: number[];
    keysPublicMeta: Omit<Key, "enc_private_key" | "sign_private_key">[];
};

const EXPORT_KEY_ID = "export-key";
const encPrivId = (id: number) => `enc-priv-${id}`;
const signPrivId = (id: number) => `sign-priv-${id}`;

type AuthContextType = {
    email: string | null;
    role: string | null;
    exportKey: string | null;
    keys: Key[] | null;
    isLoading: boolean;
    login: (data: LoginData) => Promise<void>;
    updateKeys: (data: updateKeysData) => Promise<void>;
    updateRole: (role: string) => void;
    getLatestKeys: () => Promise<Key>;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: any) => {

    const [email, setEmail] = useState<string | null>(null);
    const [role, setRole] = useState<string | null>(null);

    const [exportKey, setExportKey] = useState<string | null>(null);
    const [keys, setKeys] = useState<Key[] | null>(null);

    const [isLoading, setIsLoading] = useState(true);

    const navigate = useNavigate();

    // Persist the export key and every private key as raw, extractable
    // CryptoKeys in IndexedDB; everything else goes to localStorage.
    const persistSession = async (nextEmail: string, nextRole: string, nextExportKey: string, nextKeys: Key[]) => {
        try {
            await storeRawKey(EXPORT_KEY_ID, nextExportKey);

            for (const key of nextKeys) {
                await storeRawKey(encPrivId(key.id), key.enc_private_key);
                await storeRawKey(signPrivId(key.id), key.sign_private_key);
            }

            const keysPublicMeta = nextKeys.map(({ enc_private_key: _e, sign_private_key: _s, ...rest }) => rest);

            saveSessionMeta<SessionMeta>({
                email: nextEmail,
                role: nextRole,
                keyIds: nextKeys.map(k => k.id),
                keysPublicMeta,
            });
        } catch (e) {
            // Persistence failing shouldn't break the active in-memory session
            console.error("Failed to persist session key material:", e);
        }
    };

    // Rehydrate from IndexedDB + localStorage on mount (page refresh)
    useEffect(() => {
        (async () => {
            try {
                const meta = loadSessionMeta<SessionMeta>();
                if (!meta) {
                    setIsLoading(false);
                    return;
                }

                const restoredExportKey = await getRawKeyAsBase64(EXPORT_KEY_ID);
                if (!restoredExportKey) {
                    await clearAllKeyStorage();
                    setIsLoading(false);
                    return;
                }

                const restoredKeys: Key[] = [];
                for (const publicMeta of meta.keysPublicMeta) {
                    const enc_private_key = await getRawKeyAsBase64(encPrivId(publicMeta.id));
                    const sign_private_key = await getRawKeyAsBase64(signPrivId(publicMeta.id));

                    if (!enc_private_key || !sign_private_key) {
                        // Partial/corrupted state — bail out rather than proceed with holes
                        await clearAllKeyStorage();
                        setIsLoading(false);
                        return;
                    }

                    restoredKeys.push({ ...publicMeta, enc_private_key, sign_private_key });
                }

                setEmail(meta.email);
                setRole(meta.role);
                setExportKey(restoredExportKey);
                setKeys(restoredKeys);
            } catch (e) {
                console.error("Failed to restore session key material:", e);
                await clearAllKeyStorage();
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    const login = async (data: LoginData) => {
        setEmail(data.email);
        setRole(data.role);
        setExportKey(data.exportKey);
        setKeys(data.keys);

        await persistSession(data.email, data.role, data.exportKey, data.keys);

        navigate("/");
    };

    const updateKeys = async (data: updateKeysData) => {
        setExportKey(data.exportKey);
        setKeys(data.keys);

        if (email && role) {
            await persistSession(email, role, data.exportKey, data.keys);
        }
    }

    const updateRole = (newRole: string) => {
        setRole(newRole);

        if (email && exportKey && keys) {
            persistSession(email, newRole, exportKey, keys);
        }
    };

    const getLatestKeys = async () => {
        keys?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        const validKeys = keys?.filter(key => key.is_active && !key.revoked_at);

        if (!validKeys || validKeys.length === 0) {
            throw new Error(errors.errorNoValidKeys);
        } else if (validKeys && validKeys.length > 1) {
            throw new Error(errors.errorMultipleValidKeys);
        }

        return validKeys[0];
    }

    const logout = async () => {
        setEmail(null);
        setRole(null);
        setExportKey(null);
        setKeys(null);

        await clearAllKeyStorage();

        // Navigation done in logout.tsx page
    };

    const value = useMemo(
        () => ({
            email,
            role,
            exportKey,
            keys,
            isLoading,
            login,
            updateKeys,
            updateRole,
            getLatestKeys,
            logout,
        }),
        [email, role, exportKey, keys, isLoading]
    );
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};