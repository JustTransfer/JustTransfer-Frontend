import { useEffect } from "react";

import { useAuth } from "../hooks/useAuth";
import { useLangNavigate } from "../hooks/useLangNavigate";
import { logoutProcess } from "../handlers/crypto";

export default function Logout() {
    const { logout } = useAuth();
    const navigate = useLangNavigate();

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
