import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Button, TextField, Paper } from "@mui/material";
import Alert from '@mui/material/Alert';
import Snackbar, { type SnackbarCloseReason } from '@mui/material/Snackbar';
import { LinearProgress } from "@mui/material";

import { useAuth } from "../hooks/useAuth";
import Layout from "../components/layout";
import { register } from "../handlers/crypto";
import PasswordStrength from "../components/passwordStrength";

import * as errors from "../messages/errors";
import * as strings from "../messages/strings";

export default function CreateAccountPage() {

    const navigate = useNavigate();
    const { login } = useAuth();
    const [errorPasswordMismatch, setErrorPasswordMismatch] = useState(false);
    const [errorWeakPassword, setErrorWeakPassword] = useState(false);
    const [error, setError] = useState("");
    const [openError, setOpenError] = useState(false);

    const [success, setSuccess] = useState("");
    const [openSuccess, setOpenSuccess] = useState(false);

    const [password, setPassword] = useState("");
    const [isStrong, setIsStrong] = useState(false);

    const handleClose = (event?: React.SyntheticEvent | Event, reason?: SnackbarCloseReason,) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpenError(false);
    };

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
            setError(errors.errorWeakPassword);
            setOpenError(true);
            hasError = true;
        } else {
            setErrorWeakPassword(false);
        }

        if (data.password !== data.confirmPassword) {
            setErrorPasswordMismatch(true);
            setError(errors.errorPasswordMismatch);
            setOpenError(true);
            hasError = true;
        } else {
            setErrorPasswordMismatch(false);
        }

        if (hasError) {
            return;
        }

        setErrorWeakPassword(false);
        setErrorPasswordMismatch(false);
        setError("");
        setOpenError(false);
        setSuccess("");
        setOpenSuccess(false);

        try {
            const result = await register(data.username as string, data.email as string, data.password as string);

            if (result.success) {
                setSuccess(strings.msgAccountCreated);
                setOpenSuccess(true);

                login({
                    username: data.username as string,
                    role: result.role,
                });

                setTimeout(() => {
                    navigate("/new-transfer", { replace: true });
                }, 1000);

            } else {
                throw new Error(errors.errorRegistrationFailed);
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : errors.errorRegistrationFailed);
            setOpenError(true);
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

                            <Snackbar anchorOrigin={{ vertical: "bottom", horizontal: "right" }} open={openSuccess} autoHideDuration={3000}>
                                <Alert
                                    severity="success"
                                    variant="filled"
                                    sx={{ width: '100%' }}
                                >
                                    {success}
                                </Alert>
                            </Snackbar>
                            <Snackbar anchorOrigin={{ vertical: "bottom", horizontal: "right" }} open={openError} autoHideDuration={4000} onClose={handleClose}>
                                <Alert
                                    severity="error"
                                    variant="filled"
                                    sx={{ width: '100%' }}
                                >
                                    {error}
                                </Alert>
                            </Snackbar>
                        </Box>
                    </Paper>
                </Box>
            </Box>
        } />
    );
}
