import { Box, Typography, Paper, TextField, Button } from "@mui/material";

import { useNotification } from "../hooks/useNotificationContext";
import Layout from "../components/layout";
import { requestResetPasswordAPI } from "../handlers/api";

import * as errors from "../messages/errors";
import * as strings from "../messages/strings";

export default function ResetPasswordRequestPage() {

    const cardSx = {
        width: "100%",
        maxWidth: 460,
        textAlign: "center",
        borderRadius: 4,
        border: "1px solid #f1e7ee",
        boxShadow: "0 18px 40px rgba(83, 24, 60, 0.12)",
        backgroundColor: "#ffffff",
        p: { xs: 3, md: 5 },
    };

    const { success, error } = useNotification();

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
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                    px: { xs: 2, md: 3 },
                    py: { xs: 4, md: 6 },
                }}
            >
                <Paper elevation={0} sx={cardSx}>
                    <Typography variant="h4" sx={{ mb: 2, fontWeight: "bold", color: "#2b0f1f" }}>
                        Reset Password
                    </Typography>

                    <Typography variant="body1" sx={{ mb: 3, color: "#6e5a69" }}>
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
