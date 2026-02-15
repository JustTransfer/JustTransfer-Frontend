import { useEffect } from "react";
import { useNavigate } from "react-router-dom"

import { useAuth } from "../hooks/useAuth";
import { logoutProcess } from "../handlers/crypto";

export default function Logout() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const doLogout = async () => {
            try {
                await logoutProcess();
            } finally {
                logout();
                navigate("/", { replace: true });
            }
        };

        doLogout();
    }, []);

    return null;
}
