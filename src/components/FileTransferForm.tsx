import React, { useState, useRef } from "react";
import { Box, Typography, TextField, Paper, Button, Snackbar, Alert } from "@mui/material";
import AddBoxIcon from '@mui/icons-material/AddBox';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import LinearProgress, { LinearProgressProps } from '@mui/material/LinearProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import PasswordStrength from "./passwordStrength";
import { formatSize } from "../handlers/utils";

type FileTransferFormProps = {
    type: "anonymous" | "connected"; // determines if passphrase or receiver is used
    maxFileSize: number;
    maxDownloads: number;
    maxLifetime: number;
    onSubmit: (data: {
        receiver?: string;
        passphrase?: string;
        file: File;
        lifetime: number;
        maxDownloads: number;
    }, onProgress: (percent: number) => void) => Promise<string | void>;
};

export default function FileTransferForm({ type, maxFileSize, maxDownloads, maxLifetime, onSubmit }: FileTransferFormProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [password, setPassword] = useState("");
    const [isStrong, setIsStrong] = useState(false);

    const [errorPassphrase, setErrorPassphrase] = useState(false);
    const [error, setError] = useState("");
    const [openError, setOpenError] = useState(false);

    const [success, setSuccess] = useState("");
    const [openSuccess, setOpenSuccess] = useState(false);

    const [isSending, setIsSending] = useState(false);
    const [progress, setProgress] = useState(0);
    const [link, setLink] = useState("");
    const [openDialog, setOpenDialog] = useState(false);

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
            setError(`File too large. Max: ${formatSize(maxFileSize)}`);
            setOpenError(true);
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

    const handleCloseSnackbar = () => {
        setOpenError(false);
        setOpenSuccess(false);
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!selectedFile) {
            setError("No file selected");
            setOpenError(true);
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
            const pass = formData.get("passphrase") as string;
            const confirm = formData.get("confirmPassphrase") as string;
            if (pass !== confirm) {
                setError("Passphrases do not match");
                setOpenError(true);
                setErrorPassphrase(true);
                return;
            }
            setErrorPassphrase(false);
            data.passphrase = pass;
        } else {
            data.receiver = formData.get("receiver") as string;
        }

        try {
            setIsSending(true);
            setProgress(0);
            const result = await onSubmit(data, (percent) => setProgress(percent));
            if (type === "anonymous" && typeof result === "string") {
                setLink(result);
                setOpenDialog(true);
            }
            setSuccess("File uploaded successfully!");
            setOpenSuccess(true);
        } catch (e: any) {
            setError(e.message || "Unknown error");
            setOpenError(true);
        } finally {

            // Reset form and state if connected
            if (type === "connected") {
                handleCloseDialog();
            }
        }
    };

    return (
        <Paper elevation={4} sx={{ p: 4, borderRadius: 3, width: 500, textAlign: "center" }}>
            <Box component="form" ref={formRef} onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                <Typography variant="h6">Click to add a file to transfer.</Typography>
                <AddBoxIcon sx={{ color: "primary.main", transform: "scale(4)", "&:hover": { cursor: "pointer", transform: "scale(4.1)" }, marginBottom: 3, marginTop: 3 }} onClick={handleIconClick} />
                <input type="file" ref={fileInputRef} style={{ display: "none" }} onChange={handleFileChange} />
                {selectedFile ? (
                    <Typography variant="body2" color="text.secondary">{selectedFile.name} ({formatSize(selectedFile.size)})</Typography>
                ) : (
                    <Typography variant="body2" color="text.secondary">No file selected</Typography>
                )}

                {type === "anonymous" ? (
                    <>
                        <TextField label="Passphrase" name="passphrase" type="password" variant="outlined" fullWidth required onChange={(e) => setPassword(e.target.value)} />

                        <PasswordStrength password={password} onStrengthChange={setIsStrong} />

                        <TextField label="Confirm Passphrase" name="confirmPassphrase" type="password" variant="outlined" fullWidth required
                            error={errorPassphrase}
                            helperText={errorPassphrase ? "Passphrases do not match" : ""}
                        />
                    </>
                ) : (
                    <TextField label="Receiver" name="receiver" type="text" variant="outlined" fullWidth required />
                )}

                <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 2, width: "100%" }}>
                    <TextField label="Max Downloads" name="maxDownloads" type="number" InputProps={{ inputProps: { min: 1, max: maxDownloads } }} variant="outlined" fullWidth required helperText={maxDownloads ? `Max allowed: ${maxDownloads}` : undefined} />
                    <TextField label="Lifetime" name="lifetime" type="number" InputProps={{ inputProps: { min: 1, max: maxLifetime } }} variant="outlined" fullWidth required helperText={maxLifetime ? `Max allowed: ${maxLifetime} days` : undefined} />
                </Box>

                {isSending ?
                    <LinearProgressWithLabel value={progress} />
                    :
                    <Button type="submit" variant="contained" sx={{ mt: 2 }} fullWidth disabled={type === "anonymous" && !isStrong}
                    >Send</Button>
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
                    <ContentCopyIcon sx={{ color: "primary.main", "&:hover": { cursor: "pointer" } }} onClick={() => { navigator.clipboard.writeText(link); setSuccess("Link copied"); setOpenSuccess(true); }} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => window.open(link, '_blank', 'noopener,noreferrer')}>Open link</Button>
                    <Button onClick={handleCloseDialog}>Close</Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={openSuccess} autoHideDuration={3000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
                <Alert
                    severity="success"
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {success}
                </Alert>
            </Snackbar>
            <Snackbar open={openError} autoHideDuration={3000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
                <Alert
                    severity="error"
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {error}
                </Alert>
            </Snackbar>
        </Paper>
    );
}
