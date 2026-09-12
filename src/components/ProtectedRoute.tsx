import { Navigate } from "react-router";

import { ThemeProvider } from '@mui/material/styles';
import Box from '@mui/material/Box';
import CircularProgress from "@mui/material/CircularProgress";

import { useAuth } from "../hooks/useAuth";
import { defaultTheme } from "./layout";

export const ProtectedRoute = ({ children }: { children: any }) => {

    const { email, isLoading } = useAuth();

    if (isLoading) {
        return (
            <ThemeProvider theme={defaultTheme}>
                <Box sx={{
                    display: "flex",
                    minHeight: "100vh",
                    alignItems: "center",
                    justifyContent: "center",
                }}>
                    <CircularProgress />
                </Box>
            </ThemeProvider>
        );
    }

    if (!email) {
        return <Navigate to="/login" />;
    }
    return children;
};