import { useNavigate, useParams } from 'react-router';
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { useNotification } from "../hooks/useNotificationContext";
import Layout from "../components/layout";
import { verifyEmailAPI } from "../handlers/api";

export default function VerifyEmailPage() {

    const { t } = useTranslation(["auth", "common", "errors"]);

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
                    success(t("common:msgEmailVerified"));
                    setTimeout(() => {
                        navigate("/login");
                    }, 2000);
                })
                .catch((err) => {
                    setState("error");
                    error(err.message || t("errors:errorEmailVerificationFailed"));
                    setTimeout(() => {
                        navigate("/");
                    }, 2000);
                });
        }
    }, []);

    return (
        <Layout content={
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
                            {state === "verifying" && t("auth:verifyTitle")}
                            {state === "success" && t("auth:verifiedTitle")}
                            {state === "error" && t("auth:verifyFailedTitle")}
                        </Typography>
                        <Typography variant="body1" sx={{ color: "#6e5a69" }}>
                            {state === "verifying" && t("auth:verifySubtitle")}
                            {state === "success" && t("auth:verifiedSubtitle")}
                            {state === "error" && t("auth:verifyFailedSubtitle")}
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
                            {t("auth:checkEmailTitle")}
                        </Typography>
                        <Typography variant="body1" sx={{ color: "#6e5a69", lineHeight: 1.6 }}>
                            {t("auth:checkEmailSubtitle")}
                        </Typography>
                    </Box>
                </ Box>
            )
        } />
    );
}
