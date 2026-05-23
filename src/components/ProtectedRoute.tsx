import { Navigate } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

export const ProtectedRoute = ({ children }: { children: any }) => {

    const { username } = useAuth();

    if (!username) {
        return children;
        return <Navigate to="/login" />;
    }
    return children;
};