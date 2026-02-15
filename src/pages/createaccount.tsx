import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Button, TextField, Paper } from "@mui/material";
import Alert from '@mui/material/Alert';
import { LinearProgress } from "@mui/material";

import { useNotification } from "../hooks/useNotificationContext";
import { useAuth } from "../hooks/useAuth";
import Layout from "../components/layout";
import { register } from "../handlers/crypto";
import PasswordStrength from "../components/passwordStrength";

import * as errors from "../messages/errors";
import * as strings from "../messages/strings";

export default function CreateAccountPage() {

    const { success, error } = useNotification();

    const navigate = useNavigate();
    const { login } = useAuth();
    const [errorPasswordMismatch, setErrorPasswordMismatch] = useState(false);
    const [errorWeakPassword, setErrorWeakPassword] = useState(false);

    const [password, setPassword] = useState("");
    const [isStrong, setIsStrong] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(form);
        const data = {
            username: formData.get("username"),
            email: formData.get("email"),
            password: formData.get("password"),
            confirmPassword: formData.get("confirmPassword"),
        };

        let hasError = false;

        if (!isStrong) {
            setErrorWeakPassword(true);
            error(errors.errorWeakPassword);
            hasError = true;
        } else {
            setErrorWeakPassword(false);
        }

        if (data.password !== data.confirmPassword) {
            setErrorPasswordMismatch(true);
            error(errors.errorPasswordMismatch);
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
            const result = await register(data.username as string, data.email as string, data.password as string);

            if (result.success) {
                success(strings.msgAccountCreated);

                login({
                    username: data.username as string,
                    role: result.role,
                });

                setTimeout(() => {
                    navigate("/new-transfer");
                }, 1000);

            } else {
                throw new Error(errors.errorRegistrationFailed);
            }
        } catch (e) {
            error(e instanceof Error ? e.message : errors.errorRegistrationFailed);
        }
    }

    return (
        <Layout title="Create Account" content={
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
                            Create Account
                        </Typography>

                        <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 3 }} onSubmit={handleSubmit}>
                            <TextField
                                label="Username"
                                name="username"
                                type="text"
                                variant="outlined"
                                fullWidth
                                required
                            />
                            <TextField
                                label="Email"
                                name="email"
                                type="email"
                                variant="outlined"
                                fullWidth
                                required
                            />
                            <TextField
                                label="Password"
                                name="password"
                                type="password"
                                variant="outlined"
                                fullWidth
                                required
                                onChange={(e) => setPassword(e.target.value)}
                                error={errorWeakPassword}
                                helperText={errorWeakPassword ? errors.errorWeakPassword : ""}
                            />

                            <PasswordStrength password={password} onStrengthChange={setIsStrong} />

                            <TextField
                                label="Confirm Password"
                                name="confirmPassword"
                                type="password"
                                variant="outlined"
                                fullWidth
                                required
                                error={errorPasswordMismatch}
                                helperText={errorPasswordMismatch ? errors.errorPasswordMismatch : ""}
                            />
                            <Button
                                type="submit"
                                variant="contained"
                            >
                                Create Account
                            </Button>
                        </Box>
                    </Paper>
                </Box>
            </Box>
        } />
    );
}
