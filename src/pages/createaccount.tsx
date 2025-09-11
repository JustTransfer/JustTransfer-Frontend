import { useState } from "react";
import { Box, Typography, Button, TextField, Paper } from "@mui/material";
import Alert from '@mui/material/Alert';
import Snackbar, { type SnackbarCloseReason } from '@mui/material/Snackbar';

import Layout from "../components/layout";
import { register } from "../handlers/crypto";

export default function CreateAccountPage() {
    const [errorPassword, setErrorPassword] = useState("");
    const [error, setError] = useState("");
    const [openError, setOpenError] = useState(false);

    const [success, setSuccess] = useState("");
    const [openSuccess, setOpenSuccess] = useState(false);

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

        if (data.password !== data.confirmPassword) {
            setErrorPassword("Passwords do not match");
            setError("Passwords do not match");
            setOpenError(true);
            return;
        }

        setError("");
        setOpenError(false);
        setSuccess("");
        setOpenSuccess(false);

        try {
            const result = await register(data.username as string, data.email as string, data.password as string);

            if (result.success) {
                setSuccess(result.message);
                setOpenSuccess(true);

                setTimeout(() => {
                    window.location.href = "/login";
                }, 2000);

            } else {
                setError(result.message);
                setOpenError(true);
            }
        } catch (e) {
            setError("An error occurred during registration.");
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
                            />
                            <TextField
                                label="Confirm Password"
                                name="confirmPassword"
                                type="password"
                                variant="outlined"
                                fullWidth
                                required
                                error={!!errorPassword}
                                helperText={errorPassword}
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
