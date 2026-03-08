import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from "react";
import { Box, Typography, Paper, TextField, Button, InputAdornment, IconButton, Alert } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

import { useNotification } from "../hooks/useNotificationContext";
import Layout from "../components/layout";
import PasswordStrength from "../components/passwordStrength";
import { resetPassword } from "../handlers/crypto";

import * as errors from "../messages/errors";
import * as strings from "../messages/strings";

export default function ResetPasswordPage() {

    const { id, encodedUsername } = useParams();
    const username = decodeURIComponent(encodedUsername || "");

    const { success, error } = useNotification();
    const navigate = useNavigate();

    const [errorPasswordMismatch, setErrorPasswordMismatch] = useState(false);
    const [errorWeakPassword, setErrorWeakPassword] = useState(false);

    const [password, setPassword] = useState("");
    const [isStrong, setIsStrong] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const handleTogglePassword = () => {
        setShowPassword(prev => !prev);
    };

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
                        Enter your new password below for the account <strong>{username}</strong>.
                    </Typography>

                    <Alert severity="warning" sx={{ mb: 3 }}>
                        All sent and received transfers will be deleted!
                    </Alert>

                    <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 3 }} onSubmit={handleSubmit}>

                        <TextField
                            label="Password"
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
                            Reset Password
                        </Button>
                    </Box>
                </Paper>
            </ Box>
        } />
    );
}
