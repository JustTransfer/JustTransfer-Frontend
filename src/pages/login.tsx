import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Button, TextField, Paper } from "@mui/material";
import Alert from '@mui/material/Alert';
import Snackbar, { type SnackbarCloseReason } from '@mui/material/Snackbar';

import { useAuth } from "../hooks/useAuth";
import Layout from "../components/layout";
import { loginProcess } from "../handlers/crypto";

import * as errors from "../messages/errors";
import * as strings from "../messages/strings";

export default function LoginPage() {

    const navigate = useNavigate();
    const { login } = useAuth();
    const [error, setError] = useState("");
    const [openError, setOpenError] = useState(false);

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
            email: formData.get("username"),
            password: formData.get("password"),
        };

        try {
            const result = await loginProcess(data.email as string, data.password as string);

            if (result.success) {

                login({
                    username: result.username,
                    role: result.role,
                });

            } else {
                throw new Error(result.message);
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : errors.errorLoginFailed);
            setOpenError(true);
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
                            <TextField label="Password" name="password" type="password" variant="outlined" fullWidth required />
                            <Button type="submit" variant="contained" sx={{ mt: 2 }}>
                                Login
                            </Button>
                        </Box>
                    </Paper>
                </Box>

                <Snackbar anchorOrigin={{ vertical: "bottom", horizontal: "right" }} open={openError} autoHideDuration={2000} onClose={handleClose}>
                    <Alert
                        severity="error"
                        variant="filled"
                        sx={{ width: '100%' }}
                    >
                        {error}
                    </Alert>
                </Snackbar>
            </Box>
        } />
    );
}