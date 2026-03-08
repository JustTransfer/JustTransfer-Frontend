import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";

import { useNotification } from "../hooks/useNotificationContext";
import Layout from "../components/layout";
import { verifyEmailAPI } from "../handlers/api";

import * as errors from "../messages/errors";
import * as strings from "../messages/strings";

export default function VerifyEmailPage() {

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
                        height: "100%",
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <Typography variant="h4" align="center" sx={{ mt: 5 }}>
                        {state === "verifying" && "Verifying your email..."}
                        {state === "success" && "Email verified successfully! Redirecting to login..."}
                        {state === "error" && "Email verification failed! Redirecting to home..."}
                    </Typography>
                </ Box>
            ) : (
                <Box
                    sx={{
                        height: "100%",
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
                    }}
                >
                    <Typography variant="h4" align="center" sx={{ mt: 5, mx: 2, lineHeight: 1.6 }}>
                        A verification link has been sent to your email. <br />
                    </Typography>
                    <Typography variant="h6" align="center" sx={{ mt: 0, mx: 2, lineHeight: 1.6 }}>
                        Please check your inbox and click the link to verify your account.
                    </Typography>
                </ Box>
            )
        } />
    );
}
