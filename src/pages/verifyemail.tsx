import { useNavigate, useParams } from 'react-router-dom';
import { useEffect } from "react";
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

    useEffect(() => {
        if (id) {
            verifyEmailAPI(id)
                .then(() => {
                    success(strings.msgEmailVerified);
                    setTimeout(() => {
                        navigate("/login");
                    }, 2000);
                })
                .catch((err) => {
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
                    <Typography variant="h3" align="center" sx={{ mt: 5 }}>
                        Verifying your email...
                    </Typography>
                </ Box>
            ) : (
                <Box
                    sx={{
                        height: "100%",
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <Typography variant="h3" align="center" sx={{ mt: 5 }}>
                        Please check your email for the verification link!
                    </Typography>
                </ Box>
            )
        } />
    );
}
