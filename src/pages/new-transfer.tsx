import React, { useState, useRef } from "react";
import { Box, Typography, TextField, Paper, Button, Snackbar, Alert } from "@mui/material";
import { type SnackbarCloseReason } from '@mui/material/Snackbar';
import { type SelectChangeEvent } from '@mui/material/Select';
import AddBoxIcon from '@mui/icons-material/AddBox';
import LinearProgress, { LinearProgressProps } from '@mui/material/LinearProgress';

import Layout from "../components/layout";
import { sendMessage } from "../handlers/crypto";


export default function NewTransfer() {
    const [error, setError] = useState("");
    const [openError, setOpenError] = useState(false);

    const [success, setSuccess] = useState("");
    const [openSuccess, setOpenSuccess] = useState(false);

    const [isSending, setIsSending] = useState(false);
    const [progress, setProgress] = useState(0);

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    function LinearProgressWithLabel(props: LinearProgressProps & { value: number }) {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Box sx={{ width: '100%', mr: 1 }}>
                    <LinearProgress variant="determinate" {...props} />
                </Box>
                <Box sx={{ minWidth: 35 }}>
                    <Typography
                        variant="body2"
                        sx={{ color: 'text.secondary' }}
                    >{`${Math.round(props.value)}%`}</Typography>
                </Box>
            </Box>
        );
    }

    const formatSize = (bytes: any) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
        if (bytes < 1024 * 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;

        return `${(bytes / (1024 * 1024 * 1024 * 1024)).toFixed(1)} TB`;
    };

    function handleIconClick() {
        fileInputRef.current?.click(); // Open the file selector
    }

    function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        if (event.target.files && event.target.files[0]) {
            setSelectedFile(event.target.files[0]);
        }
    }

    const handleClose = (event?: React.SyntheticEvent | Event, reason?: SnackbarCloseReason,) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpenError(false);
        setOpenSuccess(false);
    };


    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(form);

        if (selectedFile) {
            formData.append("file", selectedFile);
        } else {
            setError("Please select a file to upload.");
            setOpenError(true);
            return;
        }

        const data = {
            receiver: formData.get("receiver"),
            maxDownloads: formData.get("maxDownloads"),
            lifetime: formData.get("lifetime"),
            file: formData.get("file"),
        };

        try {
            setIsSending(true);
            setProgress(0);
            await sendMessage(data.receiver as string, selectedFile!.name, selectedFile!, Number(data.lifetime), Number(data.maxDownloads), (percent: number) => {
                setProgress(percent);
            });

            setSuccess("File sent successfully!");
            setOpenSuccess(true);

            setTimeout(() => {
                setIsSending(false);
                setProgress(0);
            }, 500);

        } catch (e) {
            setError("An error occurred while sending the file.");
            setOpenError(true);
            setIsSending(false);
            setProgress(0);
            return;
        }
    }

    return (
        <Layout title="New Transfer" content={
            <Box
                sx={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    gap: 10,
                }}
            >
                <Typography variant="h3">
                    Make a new transfer here!
                </Typography>

                <Paper elevation={4} sx={{ p: 6, borderRadius: 3, width: 500, textAlign: "center" }}>
                    <Box component="form" sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }} onSubmit={handleSubmit}>

                        <AddBoxIcon sx={{ color: "primary.main", transform: "scale(4)", "&:hover": { cursor: "pointer", transform: "scale(4.1)" }, marginBottom: 4 }} onClick={handleIconClick} />

                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: "none" }}
                            onChange={handleFileChange}
                        />


                        {selectedFile && (
                            <Typography variant="body2" color="text.secondary">
                                {selectedFile.name} ({formatSize(selectedFile.size)})
                            </Typography>
                        )}

                        <TextField label="Receiver" name="receiver" type="text" variant="outlined" fullWidth required />

                        <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 2, width: "100%" }}>
                            <TextField label="Max Downloads" name="maxDownloads" type="number" InputProps={{ inputProps: { min: 0, max: 100 } }} variant="outlined" fullWidth required />
                            <TextField label="Lifetime" name="lifetime" type="number" InputProps={{ inputProps: { min: 0, max: 100 } }} variant="outlined" fullWidth required />
                        </Box>

                        {isSending ? (
                            <LinearProgressWithLabel value={progress} />
                        ) : (
                            <Button type="submit" variant="contained" sx={{ mt: 2 }} fullWidth>
                                Send
                            </Button>
                        )}
                    </Box>
                </Paper>

                <Snackbar anchorOrigin={{ vertical: "bottom", horizontal: "right" }} open={openSuccess} autoHideDuration={2000} onClose={handleClose}>
                    <Alert
                        severity="success"
                        variant="filled"
                        sx={{ width: '100%' }}
                    >
                        {success}
                    </Alert>
                </Snackbar>
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