import { createContext, useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { useLocalStorage } from "./useLocalStorage";

type AuthContextType = {
    username: string | null;
    role: string | null;
    login: (data: any) => Promise<void>;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: any) => {
    const [username, setUsername] = useLocalStorage("username", null);
    const [role, setRole] = useLocalStorage("role", null);
    const navigate = useNavigate();

    const login = async (data: any) => {
        setUsername(data.username);
        setRole(data.role);
        navigate("/new-transfer");
    };

    const logout = () => {
        setUsername(null);
        setRole(null);
        navigate("/", { replace: true });
    };

    const value = useMemo(
        () => ({
            username,
            role,
            login,
            logout,
        }),
        [username, role]
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