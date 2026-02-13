import { createContext, useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { useLocalStorage } from "./useLocalStorage";

type AuthContextType = {
    userId: string | null;
    fonction: string | null;
    login: (data: any) => Promise<void>;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: any) => {
    const [userId, setUserId] = useLocalStorage("userId", null);
    const [fonction, setFonction] = useLocalStorage("fonction", null);
    const navigate = useNavigate();

    const login = async (data: any) => {
        setUserId(data.idlogin);
        setFonction(data.fonction);
        navigate("/");
    };

    const logout = () => {
        setUserId(null);
        setFonction(null);
        navigate("/", { replace: true });
    };

    const value = useMemo(
        () => ({
            userId,
            fonction,
            login,
            logout,
        }),
        [userId, fonction]
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