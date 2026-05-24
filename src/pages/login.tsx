import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Button, Link, TextField, Paper, InputAdornment, IconButton } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

import { useNotification } from "../hooks/useNotificationContext";
import { useAuth } from "../hooks/useAuth";
import Layout from "../components/layout";
import { loginProcess } from "../handlers/crypto";
import { isValidUsername } from "../handlers/utils";

import * as errors from "../messages/errors";
import * as strings from "../messages/strings";

export default function LoginPage() {

    const cardSx = {
        width: "100%",
        maxWidth: 440,
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

    const [errorInvalidUsername, setErrorInvalidUsername] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const handleTogglePassword = () => {
        setShowPassword(prev => !prev);
    };

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(form);
        const data = {
            username: formData.get("username"),
            password: formData.get("password"),
        };

        let hasError = false;

        if (!isValidUsername(data.username as string)) {
            setErrorInvalidUsername(true);
            error(errors.errorInvalidUsernameShort);
            hasError = true;
        } else {
            setErrorInvalidUsername(false);
        }

        if (hasError) {
            return;
        }

        try {
            const result = await loginProcess(data.username as string, data.password as string);

            if (result.success) {

                success(strings.msgLoginSuccessful);

                login({
                    username: result.username!,
                    role: result.role,
                    exportKey: result.exportKey!,
                    keys: result.keys!,
                });

            } else {
                throw new Error(result.message);
            }
        } catch (e) {
            error(e instanceof Error ? e.message : errors.errorLoginFailed);
        }
    }

    return (
        <Layout title="Login" content={
            <Box
                sx={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    px: { xs: 2, md: 3 },
                    py: { xs: 4, md: 6 },
                    gap: 2,
                }}
            >

                <Paper elevation={0} sx={cardSx}>

                    <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
                        Login
                    </Typography>

                    <Typography variant="subtitle1" sx={{ color: "#7a6474" }}>
                        Login to access your encrypted transfers.
                    </Typography>

                    <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 4 }} onSubmit={handleSubmit}>
                        <TextField label="Username" name="username" type="text" variant="outlined" fullWidth required
                            error={errorInvalidUsername}
                            helperText={errorInvalidUsername ? errors.errorInvalidUsername : ""}
                        />
                        <TextField label="Password" name="password" type={showPassword ? "text" : "password"} variant="outlined" fullWidth required
                            InputProps={{
                                endAdornment: (
                                    < InputAdornment position="end" >
                                        <IconButton
                                            aria-label={
                                                showPassword ? 'hide the password' : 'display the password'
                                            }
                                            onClick={handleTogglePassword}
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                        <Button type="submit" variant="contained" sx={{ mt: 2 }}>
                            Login
                        </Button>
                    </Box>
                </Paper>

                <Typography variant="body2" sx={{ color: "#6e5a69" }}>
                    You don't have an account?

                    <Link
                        component="button"
                        variant="body2"
                        onClick={() => navigate("/register")}
                        underline="hover"
                        sx={{ ml: 1, verticalAlign: "baseline" }}
                    >
                        Create one
                    </Link>

                </Typography>
                <Typography variant="body2" sx={{ color: "#6e5a69" }}>
                    Forgot your password?
                    <Link
                        component="button"
                        variant="body2"
                        onClick={() => navigate("/reset-password")}
                        underline="hover"
                        sx={{ ml: 1, verticalAlign: "baseline" }}
                    >
                        Reset it
                    </Link>
                </Typography>
            </Box>
        } />
    );
}