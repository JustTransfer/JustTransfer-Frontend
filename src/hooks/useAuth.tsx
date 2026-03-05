import { createContext, useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useLocalStorage } from "./useLocalStorage";

import * as errors from "../messages/errors";

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
    username: string;
    role: string;
    exportKey: string;
    keys: Key[];
};

type updateKeysData = {
    exportKey: string;
    keys: Key[];
}

type AuthContextType = {
    username: string | null;
    role: string | null;
    exportKey: string | null;
    keys: Key[] | null;
    login: (data: LoginData) => Promise<void>;
    updateKeys: (data: updateKeysData) => Promise<void>;
    getLatestKeys: () => Promise<Key>;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: any) => {

    const [username, setUsername] = useState<string | null>(null);
    const [role, setRole] = useState<string | null>(null);

    const [exportKey, setExportKey] = useState<string | null>(null);
    const [keys, setKeys] = useState<Key[] | null>(null);

    const navigate = useNavigate();

    const login = async (data: LoginData) => {
        setUsername(data.username);
        setRole(data.role);
        setExportKey(data.exportKey);
        setKeys(data.keys);

        navigate("/new-transfer");
    };

    const updateKeys = async (data: updateKeysData) => {
        setExportKey(data.exportKey);
        setKeys(data.keys);
    }

    const getLatestKeys = async () => {
        // get valid keys and lastest
        keys?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        const validKeys = keys?.filter(key => key.is_active && !key.revoked_at);

        // If no valid keys, return null
        if (!validKeys || validKeys.length === 0) {
            throw new Error(errors.errorNoValidKeys);
        } else if (validKeys && validKeys.length > 1) {
            throw new Error (errors.errorMultipleValidKeys);
        }

        return validKeys[0];
    }

        
    const logout = async () => {
        setUsername(null);
        setRole(null);
        setExportKey(null);
        setKeys(null);

        // Navigation done in logout.tsx page
    };

    const value = useMemo(
        () => ({
            username,
            role,
            exportKey,
            keys,
            login,
            updateKeys,
            getLatestKeys,
            logout,
        }),
        [username, role, exportKey, keys]
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