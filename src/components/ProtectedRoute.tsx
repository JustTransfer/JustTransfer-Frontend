import { Navigate } from "react-router";

import { useAuth } from "../hooks/useAuth";

export const ProtectedRoute = ({ children }: { children: any }) => {

    const { email } = useAuth();

    if (!email) {
        return <Navigate to="/login" />;
    }
    return children;
};