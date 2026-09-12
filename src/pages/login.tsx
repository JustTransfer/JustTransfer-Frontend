import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";


import { useNotification } from "../hooks/useNotificationContext";
import { useAuth } from "../hooks/useAuth";
import Layout from "../components/layout";
import { loginProcess } from "../handlers/crypto";

export default function LoginPage() {

    // "login" is this page's own namespace; "common"/"errors" are the shared ones.
    const { t } = useTranslation(["login", "common", "errors"]);

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

    const { success, error } = useNotification();
    const navigate = useNavigate();
    const { login } = useAuth();

    const [showPassword, setShowPassword] = useState(false);
    const handleTogglePassword = () => {
        setShowPassword(prev => !prev);
    };

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(form);
        const data = {
            email: formData.get("email"),
            password: formData.get("password"),
        };

        let hasError = false;

        if (hasError) {
            return;
        }

        try {
            const result = await loginProcess(data.email as string, data.password as string);

            if (result.success) {

                success(t("common:msgLoginSuccessful"));

                login({
                    email: result.email!,
                    role: result.role,
                    exportKey: result.exportKey!,
                    keys: result.keys!,
                });

            } else {
                throw new Error(result.message);
            }
        } catch (e) {
            error(e instanceof Error ? e.message : t("errors:errorLoginFailed"));
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
                        alignItems: "center",
                        justifyContent: "center",
                        py: { xs: 4, md: 6 },
                        gap: 2,
                    }}
                >

                    <Paper elevation={0} sx={cardSx}>

                        <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
                            {t("login:title")}
                        </Typography>

                        <Typography variant="subtitle1" sx={{ color: "#7a6474" }}>
                            {t("login:subtitle")}
                        </Typography>

                        <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 4 }} onSubmit={handleSubmit}>
                            <TextField label={t("login:emailLabel")} name="email" type="text" variant="outlined" fullWidth required />
                            <TextField label={t("login:passwordLabel")} name="password" type={showPassword ? "text" : "password"} variant="outlined" fullWidth required
                                slotProps={{
                                    input: {
                                        endAdornment: (
                                            < InputAdornment position="end" >
                                                <IconButton
                                                    aria-label={
                                                        showPassword ? t("login:hidePassword") : t("login:showPassword")
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
                            <Button type="submit" variant="contained" sx={{ mt: 2 }}>
                                {t("login:submit")}
                            </Button>
                        </Box>
                    </Paper>

                    <Typography variant="body2" sx={{ color: "#6e5a69" }}>
                        {t("login:noAccount")}

                        <Link
                            component="button"
                            variant="body2"
                            onClick={() => navigate("/register")}
                            underline="hover"
                            sx={{ ml: 1, verticalAlign: "baseline" }}
                        >
                            {t("login:createOne")}
                        </Link>

                    </Typography>
                    <Typography variant="body2" sx={{ color: "#6e5a69" }}>
                        {t("login:forgotPassword")}
                        <Link
                            component="button"
                            variant="body2"
                            onClick={() => navigate("/reset-password")}
                            underline="hover"
                            sx={{ ml: 1, verticalAlign: "baseline" }}
                        >
                            {t("login:resetIt")}
                        </Link>
                    </Typography>
                </Box>
            } />
    );
}
