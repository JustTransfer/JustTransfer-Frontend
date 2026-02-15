import { createContext, useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useLocalStorage } from "./useLocalStorage";

type LoginData = {
    username: string;
    role: string;
    exportKey: string;
    privateKeyEnc: string;
    publicKeyEnc: string;
    privateKeySign: string;
    publicKeySign: string;
};

type AuthContextType = {
    username: string | null;
    role: string | null;
    exportKey: string | null;
    privateKeyEnc: string | null;
    publicKeyEnc: string | null;
    privateKeySign: string | null;
    publicKeySign: string | null;
    login: (data: LoginData) => Promise<void>;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: any) => {

    const [username, setUsername] = useLocalStorage("username", null);
    const [role, setRole] = useLocalStorage("role", null);

    const [exportKey, setExportKey] = useState<string>("");
    const [privateKeyEnc, setPrivateKeyEnc] = useState<string>("");
    const [publicKeyEnc, setPublicKeyEnc] = useState<string>("");
    const [privateKeySign, setPrivateKeySign] = useState<string>("");
    const [publicKeySign, setPublicKeySign] = useState<string>("");


    const navigate = useNavigate();

    const login = async (data: LoginData) => {
        setUsername(data.username);
        setRole(data.role);
        setExportKey(data.exportKey);
        setPrivateKeyEnc(data.privateKeyEnc);
        setPublicKeyEnc(data.publicKeyEnc);
        setPrivateKeySign(data.privateKeySign);
        setPublicKeySign(data.publicKeySign);

        navigate("/new-transfer");
    };

    const logout = async () => {
        setUsername(null);
        setRole(null);
        setExportKey("");
        setPrivateKeyEnc("");
        setPublicKeyEnc("");
        setPrivateKeySign("");
        setPublicKeySign("");

        // Navigation done in logout.tsx page
    };

    const value = useMemo(
        () => ({
            username,
            role,
            exportKey,
            privateKeyEnc,
            publicKeyEnc,
            privateKeySign,
            publicKeySign,
            login,
            logout,
        }),
        [username, role, exportKey, privateKeyEnc, publicKeyEnc, privateKeySign, publicKeySign]
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