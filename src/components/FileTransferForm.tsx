import React, { useState, useRef } from "react";
import { Box, Typography, TextField, Paper, Button, Alert, IconButton, InputAdornment } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import AddBoxIcon from '@mui/icons-material/AddBox';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DescriptionIcon from '@mui/icons-material/Description';
import LinearProgress, { LinearProgressProps } from '@mui/material/LinearProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import { useNotification } from "../hooks/useNotificationContext";
import * as errors from "../messages/errors";
import PasswordStrength from "./passwordStrength";
import { formatSize, isValidUsername } from "../handlers/utils";

type FileTransferFormProps = {
    type: "anonymous" | "connected"; // determines if password or receiver is used
    maxFileSize: number;
    maxDownloads: number;
    maxLifetime: number;
    onSubmit: (data: {
        receiver?: string;
        password?: string;
        file: File;
        lifetime: number;
        maxDownloads: number;
    }, onProgress: (percent: number) => void) => Promise<string | void>;
};

export default function FileTransferForm({ type, maxFileSize, maxDownloads, maxLifetime, onSubmit }: FileTransferFormProps) {

    const { success, error } = useNotification();

    const [selectedFile, setSelectedFile] = useState<File | null>(null)
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

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const formRef = useRef<HTMLFormElement | null>(null);

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
            const pass = formData.get("password") as string;
            const confirm = formData.get("confirmPassword") as string;

            let hasError = false;

            if (!isStrong) {
                error(errors.errorWeakPassword);
                setErrorWeakPassword(true);
                hasError = true;
            } else {
                setErrorWeakPassword(false);
            }

            if (pass !== confirm) {
                error(errors.errorPasswordMismatch);
                setErrorPassword(true);
                hasError = true;
            } else {
                setErrorPassword(false);
            }

            if (hasError) {
                return;
            }

            setErrorPassword(false);
            data.password = pass;
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
        <Paper elevation={4} sx={{ p: 4, borderRadius: 3, width: 450, textAlign: "center" }}>
            <Box component="form" ref={formRef} onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>

                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                />

                <Box
                    onClick={handleIconClick}
                    sx={{
                        width: "84%",
                        border: "2px dashed",
                        borderColor: "grey.400",
                        backgroundColor: "action.hover",
                        borderRadius: 3,
                        p: 4,
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 1,
                        transition: "0.2s",
                    }}
                >

                    {selectedFile ? (
                        <>
                            <DescriptionIcon sx={{ fontSize: 80, color: "primary.main" }} />
                            <Typography variant="body2" color="subtitle1" fontWeight="bold">
                                {`${selectedFile.name} (${formatSize(selectedFile.size)})`}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Click to change file
                            </Typography>
                        </>

                    ) : (
                        <>
                            <AddBoxIcon sx={{ fontSize: 80, color: "primary.main" }} />
                            <Typography variant="subtitle1" fontWeight="bold">
                                No file selected
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Click to add a file
                            </Typography>
                        </>
                    )}
                </Box>

                {type === "anonymous" ? (
                    <>
                        <Box sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                            width: "100%",
                        }}>
                            <TextField label="Password" name="password" type={showPassword ? "text" : "password"} variant="outlined" fullWidth required
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
                        </Box>

                        <TextField label="Confirm Password" name="confirmPassword" type="password" variant="outlined" fullWidth required
                            error={errorPassword}
                            helperText={errorPassword ? errors.errorPasswordMismatch : ""}
                        />
                    </>
                ) : (
                    <TextField label="Receiver" name="receiver" type="text" variant="outlined" fullWidth required
                        error={errorReceiver}
                        helperText={helperTextReceiver}
                    />
                )}

                <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 2, width: "100%" }}>
                    <TextField label="Max Downloads" name="maxDownloads" type="number" InputProps={{ inputProps: { min: 1, max: maxDownloads } }} variant="outlined" fullWidth required helperText={maxDownloads ? `Max allowed: ${maxDownloads}` : undefined} />
                    <TextField label="Lifetime" name="lifetime" type="number" InputProps={{ inputProps: { min: 1, max: maxLifetime } }} variant="outlined" fullWidth required helperText={maxLifetime ? `Max allowed: ${maxLifetime} days` : undefined} />
                </Box>

                {isSending ?
                    <LinearProgressWithLabel value={progress} />
                    :
                    <Button type="submit" variant="contained" sx={{ mt: 2 }} fullWidth>Send File</Button>
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
                <DialogContent sx={{ display: 'flex', gap: 2 }}>
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
