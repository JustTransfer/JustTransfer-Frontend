import React, { useState, useRef } from "react";
import { Box, Typography, TextField, Paper, Button, IconButton, InputAdornment, Collapse, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import AddBoxIcon from '@mui/icons-material/AddBox';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DescriptionIcon from '@mui/icons-material/Description';
import LinearProgress from '@mui/material/LinearProgress';
import type { LinearProgressProps } from '@mui/material/LinearProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import { useNotification } from "../hooks/useNotificationContext";
import * as errors from "../messages/errors";
import PasswordStrength from "./passwordStrength";
import AcceptTermsService from "./acceptTermsService";
import { formatSize, isValidUsername } from "../handlers/utils";

type FileTransferFormProps =
    | {
        type: "anonymous";
        maxFileSize: number;
        maxDownloads: number;
        maxLifetime: number;
        onSubmit: (
            data: {
                password: string;
                file: File;
                lifetime: number;
                maxDownloads: number;
            },
            onProgress: (percent: number) => void
        ) => Promise<string | void>;
    }
    | {
        type: "connected";
        maxFileSize: number;
        maxDownloads: number;
        maxLifetime: number;
        onSubmit: (
            data: {
                receiver: string;
                file: File;
                lifetime: number;
                maxDownloads: number;
            },
            onProgress: (percent: number) => void
        ) => Promise<string | void>;
    };

export default function FileTransferForm({ type, maxFileSize, maxDownloads, maxLifetime, onSubmit }: FileTransferFormProps) {

    const { success, error } = useNotification();

    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [isUsingPassword, setIsUsingPassword] = useState(false);
    const [password, setPassword] = useState("");
    const [isStrong, setIsStrong] = useState(false);

    const [errorReceiver, setErrorReceiver] = useState(false);
    const [helperTextReceiver, setHelperTextReceiver] = useState("");

    const [errorPassword, setErrorPassword] = useState(false);
    const [errorWeakPassword, setErrorWeakPassword] = useState(false);

    const [isSending, setIsSending] = useState(false);
    const [progress, setProgress] = useState(0);
    const [link, setLink] = useState("");
    const [openDialog, setOpenDialog] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const handleTogglePassword = () => {
        setShowPassword(prev => !prev);
    };

    const handlePasswordModeChange = (_event: React.MouseEvent<HTMLElement>, nextValue: string | null) => {
        const useManualPassword = nextValue === "manual";
        setIsUsingPassword(useManualPassword);

        if (!useManualPassword) {
            setPassword("");
            setIsStrong(false);
            setShowPassword(false);
            setErrorPassword(false);
            setErrorWeakPassword(false);
        }
    };

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const formRef = useRef<HTMLFormElement | null>(null);

    const [acceptedTerms, setAcceptedTerms] = useState(false);

    function LinearProgressWithLabel(props: LinearProgressProps & { value: number }) {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Box sx={{ width: '100%', mr: 1 }}>
                    <LinearProgress variant="determinate" {...props} />
                </Box>
                <Box sx={{ minWidth: 35 }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {`${Math.round(props.value)}%`}
                    </Typography>
                </Box>
            </Box>
        );
    }

    const handleIconClick = () => fileInputRef.current?.click();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || !event.target.files[0]) return;
        const file = event.target.files[0];
        if (maxFileSize && file.size > maxFileSize) {
            error(`File too large. Max: ${formatSize(maxFileSize)}`);
            return;
        }
        setSelectedFile(file);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setLink("");
        setSelectedFile(null);
        setProgress(0);
        setIsSending(false);
        formRef.current?.reset();
        setPassword("");
        setIsStrong(false);
        setAcceptedTerms(false);
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!selectedFile) {
            error("No file selected");
            return;
        }
        const form = event.currentTarget;
        const formData = new FormData(form);

        let data: any = {
            file: selectedFile,
            lifetime: Number(formData.get("lifetime")),
            maxDownloads: Number(formData.get("maxDownloads")),
        };

        if (type === "anonymous") {
            const password = formData.get("password") as string;
            const confirm = formData.get("confirmPassword") as string;

            let hasError = false;

            if (!acceptedTerms) {
                error(errors.errorTermsServicesNotAccepted);
                hasError = true;
            }

            // Validate password fields if using password
            if (isUsingPassword) {
                if (!isStrong) {
                    error(errors.errorWeakPassword);
                    setErrorWeakPassword(true);
                    hasError = true;
                } else {
                    setErrorWeakPassword(false);
                }

                if (password !== confirm) {
                    error(errors.errorPasswordMismatch);
                    setErrorPassword(true);
                    hasError = true;
                } else {
                    setErrorPassword(false);
                }
            }

            if (hasError) {
                return;
            }

            setErrorPassword(false);
            if (isUsingPassword) {
                data.password = password;
            } else {
                data.password = undefined; // Let the backend generate a random password
            }
        } else {

            data.receiver = formData.get("receiver") as string;

            // Validate receiver field
            if (!isValidUsername(data.receiver)) {
                error(errors.errorInvalidUsernameShort);
                setErrorReceiver(true);
                setHelperTextReceiver(errors.errorInvalidUsernameShort);
                return;
            } else {
                setErrorReceiver(false);
                setHelperTextReceiver("");
            }
        }

        try {
            setIsSending(true);
            setProgress(0);
            const result = await onSubmit(data, (percent) => setProgress(percent));
            if (type === "anonymous" && typeof result === "string") {
                setLink(result);
                setOpenDialog(true);
            }
            success("File uploaded successfully!");

            // Reset form and state if connected
            if (type === "connected") {
                handleCloseDialog();
            }
        } catch (e: any) {
            if (e.message === errors.errorUserNotFound) {
                setErrorReceiver(true);
                setHelperTextReceiver(errors.errorUserNotFound);
            } else {
                setErrorReceiver(false);
                setHelperTextReceiver("");
            }

            error(e.message || "Unknown error");

            // Only reset sending state and progress
            setIsSending(false);
            setProgress(0);
        }
    };

    return (
        <Paper
            elevation={4}
            sx={{
                width: "100%",
                textAlign: "center",
                borderRadius: { xs: 2, sm: 3 },
                p: { xs: 2, sm: 3, md: 4 },
                mx: "auto",
            }}
        >

            <Box
                component="form"
                ref={formRef}
                onSubmit={handleSubmit}
                sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: { xs: 2, sm: 3 } }}
            >

                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                />

                <Box
                    onClick={handleIconClick}
                    sx={{
                        width: "100%",
                        border: "2px dashed",
                        borderColor: "grey.400",
                        backgroundColor: "action.hover",
                        borderRadius: 3,
                        p: { xs: 2, sm: 4 },
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 1,
                        minHeight: { xs: 150, sm: 190 },
                        transition: "0.2s",
                    }}
                >

                    {selectedFile ? (
                        <>
                            <DescriptionIcon sx={{ fontSize: { xs: 56, sm: 80 }, color: "primary.main" }} />
                            <Typography variant="body2" color="subtitle1" sx={{ fontWeight: "bold", wordBreak: "break-word" }}>
                                {`${selectedFile.name} (${formatSize(selectedFile.size)})`}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: "0.78rem", sm: "0.875rem" } }}>
                                Click to change file
                            </Typography>
                        </>

                    ) : (
                        <>
                            <AddBoxIcon sx={{ fontSize: { xs: 56, sm: 80 }, color: "primary.main" }} />
                            <Typography variant="subtitle1" sx={{ fontWeight: "bold", fontSize: { xs: "1rem", sm: "1.1rem" } }}>
                                Click to add a file
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: "0.78rem", sm: "0.875rem" } }}>
                                Up to {formatSize(maxFileSize)} allowed
                            </Typography>
                        </>
                    )}
                </Box>

                <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: "stretch", gap: 2, width: "100%" }}>
                    <TextField label="Max Downloads" name="maxDownloads" type="number" slotProps={{ htmlInput: { min: 1, max: maxDownloads } }} variant="outlined" fullWidth required helperText={maxDownloads ? `Max allowed: ${maxDownloads}` : undefined} />
                    <TextField label="Lifetime" name="lifetime" type="number" slotProps={{ htmlInput: { min: 1, max: maxLifetime } }} variant="outlined" fullWidth required helperText={maxLifetime ? `Max allowed: ${maxLifetime} days` : undefined} />
                </Box>

                {type === "anonymous" ? (

                    <Box sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        width: "100%",
                    }}>
                        <Box sx={{
                            p: { xs: 1.5, sm: 2 },
                            borderRadius: 3,
                            border: "1px solid",
                            borderColor: "divider",
                            backgroundColor: "background.paper",
                            textAlign: "left",
                        }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                                Password choice
                            </Typography>
                            <ToggleButtonGroup
                                exclusive
                                fullWidth
                                value={isUsingPassword ? "manual" : "auto"}
                                onChange={handlePasswordModeChange}
                                sx={{
                                    display: "grid",
                                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                                    gap: 1,
                                    "& .MuiToggleButtonGroup-grouped": {
                                        border: 0,
                                        borderRadius: 2,
                                        textTransform: "none",
                                        px: { xs: 1, sm: 2 },
                                        py: { xs: 1, sm: 1.25 },
                                        width: "100%",
                                    },
                                }}
                            >
                                <ToggleButton value="auto" aria-label="Use generated password" sx={{ textAlign: "left", alignItems: "flex-start" }}>
                                    <Box sx={{ width: "100%" }}>
                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                            Auto-generate
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Automatically added to the link
                                        </Typography>
                                    </Box>
                                </ToggleButton>
                                <ToggleButton value="manual" aria-label="Set password manually" sx={{ textAlign: "left", alignItems: "flex-start" }}>
                                    <Box sx={{ width: "100%" }}>
                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                            Set manually
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Choose your own password
                                        </Typography>
                                    </Box>
                                </ToggleButton>
                            </ToggleButtonGroup>
                        </Box>

                        <Collapse in={isUsingPassword} unmountOnExit>
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                <TextField label="Password" name="password" type={showPassword ? "text" : "password"} variant="outlined" fullWidth required
                                    onChange={(e) => setPassword(e.target.value)}
                                    error={errorWeakPassword}
                                    helperText={errorWeakPassword ? errors.errorWeakPassword : ""}
                                    slotProps={{
                                        input: {
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                                        onClick={handleTogglePassword}
                                                    >
                                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        },
                                    }}
                                />

                                <PasswordStrength password={password} onStrengthChange={setIsStrong} />

                                <TextField label="Confirm Password" name="confirmPassword" type="password" variant="outlined" fullWidth required
                                    error={errorPassword}
                                    helperText={errorPassword ? errors.errorPasswordMismatch : ""}
                                />
                            </Box>
                        </Collapse>
                    </Box>

                ) : (
                    <TextField label="Receiver" name="receiver" type="text" variant="outlined" fullWidth required
                        error={errorReceiver}
                        helperText={helperTextReceiver}
                    />
                )}

                {type === "anonymous" ? (
                    <AcceptTermsService
                        accepted={acceptedTerms}
                        onChange={setAcceptedTerms}
                    />
                ) : (
                    null
                )}


                {isSending ? (
                    <LinearProgressWithLabel value={progress} />
                ) : (
                    <>
                        {type === "anonymous" ? (
                            <Button type="submit" variant="contained" fullWidth>Get a Link</Button>
                        ) : (
                            <Button type="submit" variant="contained" fullWidth>Send File</Button>
                        )}
                    </>
                )
                }
            </Box>

            {/* Dialog with link pop up */}
            <Dialog open={openDialog} onClose={handleCloseDialog}
                maxWidth={"sm"}
                fullWidth
                sx={{
                    '& .MuiDialog-paper': {
                        borderRadius: 3,
                    },
                }}
            >
                <DialogTitle>Link ready!</DialogTitle>
                <DialogContent
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                    }}
                >
                    <TextField value={link} fullWidth />
                    <ContentCopyIcon sx={{ color: "primary.main", "&:hover": { cursor: "pointer" } }}
                        onClick={() => {
                            navigator.clipboard.writeText(link);
                            success("Link copied");
                        }} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => window.open(link, '_blank', 'noopener,noreferrer')}>
                        Open link
                    </Button>
                    <Button onClick={handleCloseDialog}>Close</Button>
                </DialogActions>
            </Dialog>
        </Paper >
    );
}
