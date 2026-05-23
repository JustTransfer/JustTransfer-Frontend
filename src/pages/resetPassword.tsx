import { useNavigate, useParams } from 'react-router-dom';
import { use, useEffect, useState } from "react";
import { Box, Typography, Paper, TextField, Button, InputAdornment, IconButton, Alert } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

import { useNotification } from "../hooks/useNotificationContext";
import Layout from "../components/layout";
import PasswordStrength from "../components/passwordStrength";
import { resetPassword } from "../handlers/crypto";

import * as errors from "../messages/errors";
import * as strings from "../messages/strings";

export default function ResetPasswordPage() {

    const cardSx = {
        width: "100%",
        maxWidth: 480,
        textAlign: "center",
        borderRadius: 4,
        border: "1px solid #f1e7ee",
        boxShadow: "0 18px 40px rgba(83, 24, 60, 0.12)",
        backgroundColor: "#ffffff",
        p: { xs: 3, md: 5 },
    };

    const { id } = useParams();

    const { success, error } = useNotification();
    const navigate = useNavigate();

    const [username, setUsername] = useState("");

    const [errorPasswordMismatch, setErrorPasswordMismatch] = useState(false);
    const [errorWeakPassword, setErrorWeakPassword] = useState(false);

    const [password, setPassword] = useState("");
    const [isStrong, setIsStrong] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const handleTogglePassword = () => {
        setShowPassword(prev => !prev);
    };

    // Get username from fragment identifier if present
    useEffect(() => {
        const hash = window.location.hash;
        let decodedUsername = "";

        if (hash) {
            decodedUsername = decodeURIComponent(hash.substring(1));
            setUsername(decodedUsername);
        }

        // check if id and username are set
        if (!id || !decodedUsername) {
            error(errors.errorInvalidResetLink);
            setTimeout(() => {
                navigate("/");
            }, 2000);
        }
    }, []);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(form);
        const data = {
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
            const result = await resetPassword(username as string, data.password as string, id as string);

            if (result.success) {
                success(strings.msgPasswordReset);

                setTimeout(() => {
                    navigate("/login");
                }, 1000);

            } else {
                throw new Error(errors.errorPasswordResetFailed);
            }
        } catch (e) {
            error(e instanceof Error ? e.message : errors.errorPasswordResetFailed);
        }
    }

    return (
        <Layout title="Reset Password" content={
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
                        Enter a new password for account with username <strong>{username}</strong>. This action is irreversible!
                    </Typography>

                    <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
                        All sent and received transfers will be deleted!
                    </Alert>

                    <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 3 }} onSubmit={handleSubmit}>

                        <TextField
                            label="New Password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            variant="outlined"
                            fullWidth
                            required
                            onChange={(e) => setPassword(e.target.value)}
                            error={errorWeakPassword}
                            helperText={errorWeakPassword ? errors.errorWeakPassword : ""}
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

                        <PasswordStrength password={password} onStrengthChange={setIsStrong} />

                        <TextField
                            label="Confirm New Password"
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
                            Reset Password
                        </Button>
                    </Box>
                </Paper>
            </ Box>
        } />
    );
}
