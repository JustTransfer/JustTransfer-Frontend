import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Button, TextField, Paper, InputAdornment, IconButton } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

import { useNotification } from "../hooks/useNotificationContext";
import { useAuth } from "../hooks/useAuth";
import Layout from "../components/layout";
import { loginProcess } from "../handlers/crypto";

import * as errors from "../messages/errors";
import * as strings from "../messages/strings";

export default function LoginPage() {

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
            email: formData.get("username"),
            password: formData.get("password"),
        };

        try {
            const result = await loginProcess(data.email as string, data.password as string);

            if (result.success) {

                success(strings.msgLoginSuccessful);

                login({
                    username: result.username!,
                    role: result.role,
                    exportKey: result.exportKey!,
                    privateKeyEnc: result.privateKeyEnc!,
                    publicKeyEnc: result.publicKeyEnc!,
                    privateKeySign: result.privateKeySign!,
                    publicKeySign: result.publicKeySign!,
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
                    height: "100%",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <Box
                    sx={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Paper elevation={4} sx={{ p: 6, borderRadius: 3, width: 400, textAlign: "center" }}>
                        <Typography variant="h4" sx={{ mb: 4, fontWeight: "bold", color: "black" }}>
                            Login
                        </Typography>

                        <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 3 }} onSubmit={handleSubmit}>
                            <TextField label="Username" name="username" type="text" variant="outlined" fullWidth required />
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
                </Box>
            </Box>
        } />
    );
}