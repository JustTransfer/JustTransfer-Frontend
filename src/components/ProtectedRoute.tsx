import { Navigate } from "react-router-dom";

export const ProtectedRoute = ({ children }: { children: any }) => {

    const isAuthenticated = !!sessionStorage.getItem("sessionKey"); // TODO change to check if cookies are set

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};