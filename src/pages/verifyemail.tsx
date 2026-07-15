import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";

import { useNotification } from "../hooks/useNotificationContext";
import Layout from "../components/layout";
import { verifyEmailAPI } from "../handlers/api";

import * as errors from "../messages/errors";
import * as strings from "../messages/strings";

export default function VerifyEmailPage() {

    const cardSx = {
        width: "100%",
        maxWidth: 520,
        textAlign: "center",
        borderRadius: 4,
        border: "1px solid #f1e7ee",
        boxShadow: "0 18px 40px rgba(83, 24, 60, 0.12)",
        backgroundColor: "#ffffff",
        p: { xs: 3, md: 5 },
    };

    const { id } = useParams();

    // If id is present, call verifyEmailAPI with the id and show success or error message based on the response
    const { success, error } = useNotification();
    const navigate = useNavigate();

    const [state, setState] = useState<"verifying" | "success" | "error">("verifying");

    useEffect(() => {
        if (id) {
            verifyEmailAPI(id)
                .then(() => {
                    setState("success");
                    success(strings.msgEmailVerified);
                    setTimeout(() => {
                        navigate("/login");
                    }, 2000);
                })
                .catch((err) => {
                    setState("error");
                    error(err.message || errors.errorEmailVerificationFailed);
                    setTimeout(() => {
                        navigate("/");
                    }, 2000);
                });
        }
    }, []);

    return (
        <Layout title="Verify Email" content={

            id ? (
                <Box
                    sx={{
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        py: { xs: 4, md: 6 },
                    }}
                >
                    <Box sx={cardSx}>
                        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: "#2b0f1f" }}>
                            {state === "verifying" && "Verifying your email"}
                            {state === "success" && "Email verified"}
                            {state === "error" && "Verification failed"}
                        </Typography>
                        <Typography variant="body1" sx={{ color: "#6e5a69" }}>
                            {state === "verifying" && "Hang tight while we confirm your email address."}
                            {state === "success" && "You are all set. Redirecting you to login now."}
                            {state === "error" && "We could not verify your email. Redirecting to home."}
                        </Typography>
                    </Box>
                </ Box>
            ) : (
                <Box
                    sx={{
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        py: { xs: 4, md: 6 },
                    }}
                >
                    <Box sx={cardSx}>
                        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: "#2b0f1f" }}>
                            Check your email
                        </Typography>
                        <Typography variant="body1" sx={{ color: "#6e5a69", lineHeight: 1.6 }}>
                            A verification link has been sent to your inbox. Please click the link to verify your account.
                        </Typography>
                    </Box>
                </ Box>
            )
        } />
    );
}
