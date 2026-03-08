import { useNavigate, useParams } from 'react-router-dom';
import { useEffect } from "react";
import { Box, Typography, Paper, TextField, Button, InputAdornment, IconButton } from "@mui/material";

import { useNotification } from "../hooks/useNotificationContext";
import Layout from "../components/layout";
import { requestResetPasswordAPI } from "../handlers/api";

import * as errors from "../messages/errors";
import * as strings from "../messages/strings";

export default function ResetPasswordRequestPage() {

    const { success, error } = useNotification();

    const navigate = useNavigate();

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(form);
        const data = {
            email: formData.get("email"),
        };

        try {
            await requestResetPasswordAPI(data.email as string);
            success(strings.msgPasswordRequested);

        } catch (e) {
            error(e instanceof Error ? e.message : errors.errorPasswordResetRequestFailed);
        }
    }

    return (
        <Layout title="Reset Password Request" content={

            <Box
                sx={{
                    height: "100%",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",

                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Paper elevation={4} sx={{ p: 6, borderRadius: 3, width: 400, textAlign: "center" }}>
                    <Typography variant="h4" sx={{ mb: 4, fontWeight: "bold", color: "black" }}>
                        Reset Password
                    </Typography>

                    <Typography variant="body1" sx={{ mb: 3 }}>
                        Enter your email address below and we'll send you a link to reset your password.
                    </Typography>

                    <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 3 }} onSubmit={handleSubmit}>
                        <TextField label="Email" name="email" type="email" variant="outlined" fullWidth required />
                        <Button type="submit" variant="contained" sx={{ mt: 2 }}>
                            Send Reset Password Email
                        </Button>
                    </Box>
                </Paper>
            </ Box>

        } />
    );
}
