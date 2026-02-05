import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

export const ProtectedRoute = ({ children }: { children: any }) => {

    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        const key = sessionStorage.getItem("exportKey");
        setIsAuthenticated(!!key);
    }, []);

    // prevent redirect before sessionStorage is checked
    if (isAuthenticated === null) {
        return null; // or a loading spinner
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};
