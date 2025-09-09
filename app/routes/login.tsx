import React, { useState } from "react";
import { Box, Typography, Button, TextField, Paper } from "@mui/material";
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

import { login } from "../handlers/crypto";

export default function LoginPage() {

    const [error, setError] = useState("");
    const [openError, setOpenError] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(form);
        const data = {
            email: formData.get("username"),
            password: formData.get("password"),
        };

        try {
            const result = await login(data.email as string, data.password as string);

            if (result.success) {
                window.location.href = "/account";

            } else {
                setError(result.message);
                setOpenError(true);
            }
        } catch (e) {
            setError("An error occurred during login.");
            setOpenError(true);
        }
    }

    return (
        <Box
            sx={{
                height: "100vh",
                width: "100vw",
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

            <Snackbar anchorOrigin={{ vertical: "bottom", horizontal: "right" }} open={openError} autoHideDuration={2000}>
                <Alert
                    severity="error"
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {error}
                </Alert>
            </Snackbar>
        </Box>
    );
}