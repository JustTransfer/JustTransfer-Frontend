import { useNavigate, useParams } from 'react-router';
import { useEffect, useState } from "react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Alert from "@mui/material/Alert";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useTranslation } from "react-i18next";


import { useNotification } from "../hooks/useNotificationContext";
import Layout from "../components/layout";
import PasswordStrength from "../components/passwordStrength";
import { resetPassword } from "../handlers/crypto";


export default function ResetPasswordPage() {

    const { t } = useTranslation(["auth", "errors", "common"]);

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

    const { success, error } = useNotification();
    const navigate = useNavigate();

    const [username, setUsername] = useState("");

    const [errorPasswordMismatch, setErrorPasswordMismatch] = useState(false);
    const [errorWeakPassword, setErrorWeakPassword] = useState(false);

    const [password, setPassword] = useState("");
    const [isStrong, setIsStrong] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const handleTogglePassword = () => {
        setShowPassword(prev => !prev);
    };

    // Get username from fragment identifier if present
    useEffect(() => {
        const hash = window.location.hash;
        let decodedUsername = "";

        if (hash) {
            decodedUsername = decodeURIComponent(hash.substring(1));
            setUsername(decodedUsername);
        }

        // check if id and username are set
        if (!id || !decodedUsername) {
            error(t("errors:errorInvalidResetLink"));
            setTimeout(() => {
                navigate("/");
            }, 2000);
        }
    }, []);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(form);
        const data = {
            password: formData.get("password"),
            confirmPassword: formData.get("confirmPassword"),
        };

        let hasError = false;

        if (!isStrong) {
            setErrorWeakPassword(true);
            error(t("errors:errorWeakPassword"));
            hasError = true;
        } else {
            setErrorWeakPassword(false);
        }

        if (data.password !== data.confirmPassword) {
            setErrorPasswordMismatch(true);
            error(t("errors:errorPasswordMismatch"));
            hasError = true;
        } else {
            setErrorPasswordMismatch(false);
        }

        if (hasError) {
            return;
        }

        setErrorWeakPassword(false);
        setErrorPasswordMismatch(false);

        try {
            const result = await resetPassword(username as string, data.password as string, id as string);

            if (result.success) {
                success(t("common:msgPasswordReset"));

                setTimeout(() => {
                    navigate("/login");
                }, 1000);

            } else {
                throw new Error(t("errors:errorPasswordResetFailed"));
            }
        } catch (e) {
            error(e instanceof Error ? e.message : t("errors:errorPasswordResetFailed"));
        }
    }

    return (
        <Layout
            content={
                <Box
                    sx={{
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        flex: 1,
                        alignItems: "center",
                        justifyContent: "center",
                        py: { xs: 4, md: 6 },
                    }}
                >
                    <Paper elevation={0} sx={cardSx}>
                        <Typography variant="h4" sx={{ mb: 2, fontWeight: "bold", color: "#2b0f1f" }}>
                            {t("auth:resetTitle")}
                        </Typography>

                        <Typography variant="body1" sx={{ mb: 3, color: "#6e5a69" }}>
                            {t("auth:resetDescription", { username })}
                        </Typography>

                        <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
                            {t("auth:resetWarning")}
                        </Alert>

                        <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 3 }} onSubmit={handleSubmit}>

                            <TextField
                                label={t("auth:newPassword")}
                                name="password"
                                type={showPassword ? "text" : "password"}
                                variant="outlined"
                                fullWidth
                                required
                                onChange={(e) => setPassword(e.target.value)}
                                error={errorWeakPassword}
                                helperText={errorWeakPassword ? t("errors:errorWeakPassword") : ""}
                                slotProps={{
                                    input: {
                                        endAdornment: (
                                            < InputAdornment position="end" >
                                                <IconButton
                                                    aria-label={
                                                        showPassword ? t("auth:hidePassword") : t("auth:showPassword")
                                                    }
                                                    onClick={handleTogglePassword}
                                                >
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }
                                }}
                            />

                            <PasswordStrength password={password} onStrengthChange={setIsStrong} />

                            <TextField
                                label={t("auth:confirmNewPassword")}
                                name="confirmPassword"
                                type="password"
                                variant="outlined"
                                fullWidth
                                required
                                error={errorPasswordMismatch}
                                helperText={errorPasswordMismatch ? t("errors:errorPasswordMismatch") : ""}
                            />
                            <Button
                                type="submit"
                                variant="contained"
                            >
                                {t("auth:reset")}
                            </Button>
                        </Box>
                    </Paper>
                </ Box>
            } />
    );
}
