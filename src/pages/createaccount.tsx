import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Link from "@mui/material/Link";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

import { useNotification } from "../hooks/useNotificationContext";
import Layout from "../components/layout";
import { register } from "../handlers/crypto";
import PasswordStrength from "../components/passwordStrength";
import { isValidUsername } from "../handlers/utils";
import AcceptTermsService from "../components/acceptTermsService";

import * as errors from "../messages/errors";
import * as strings from "../messages/strings";

export default function CreateAccountPage() {

    const cardSx = {
        width: "100%",
        maxWidth: 520,
        textAlign: "center",
        borderRadius: 4,
        border: "1px solid #f1e7ee",
        boxShadow: "0 18px 40px rgba(83, 24, 60, 0.12)",
        backgroundColor: "#ffffff",
        p: { xs: 3, md: 5 },
    };

    const { success, error } = useNotification();

    const navigate = useNavigate();

    const [errorInvalidUsername, setErrorInvalidUsername] = useState(false);
    const [errorPasswordMismatch, setErrorPasswordMismatch] = useState(false);
    const [errorWeakPassword, setErrorWeakPassword] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);

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
            username: formData.get("username"),
            email: formData.get("email"),
            password: formData.get("password"),
            confirmPassword: formData.get("confirmPassword"),
        };

        let hasError = false;

        if (!acceptedTerms) {
            error(errors.errorTermsServicesNotAccepted);
            hasError = true;
        }

        if (!isValidUsername(data.username as string)) {
            setErrorInvalidUsername(true);
            error(errors.errorInvalidUsernameShort);
            hasError = true;
        } else {
            setErrorInvalidUsername(false);
        }

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

                setTimeout(() => {
                    navigate("/verify-email");
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
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    py: { xs: 4, md: 6 },
                    gap: 2,
                }}
            >
                <Paper elevation={0} sx={cardSx}>

                    <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
                        Create Account
                    </Typography>

                    <Typography variant="subtitle1" sx={{ color: "#7a6474" }}>
                        Join now to securely share your files!
                    </Typography>

                    <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 4 }} onSubmit={handleSubmit}>
                        <TextField
                            label="Username"
                            name="username"
                            type="text"
                            variant="outlined"
                            fullWidth
                            required
                            error={errorInvalidUsername}
                            helperText={errorInvalidUsername ? errors.errorInvalidUsername : ""}
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
                            type={showPassword ? "text" : "password"}
                            variant="outlined"
                            fullWidth
                            required
                            onChange={(e) => setPassword(e.target.value)}
                            error={errorWeakPassword}
                            helperText={errorWeakPassword ? errors.errorWeakPassword : ""}
                            slotProps={{
                                input: {
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
                                }
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

                        <AcceptTermsService
                            accepted={acceptedTerms}
                            onChange={setAcceptedTerms}
                        />

                        <Button
                            type="submit"
                            variant="contained"
                        >
                            Create Account
                        </Button>
                    </Box>
                </Paper>

                <Typography variant="body2" sx={{ color: "#6e5a69" }}>
                    Already have an account?
                    <Link
                        component="button"
                        variant="body2"
                        onClick={() => navigate("/login")}
                        underline="hover"
                        sx={{ ml: 1, verticalAlign: "baseline" }}
                    >
                        Log in
                    </Link>
                </Typography>
            </Box>
        } />
    );
}
