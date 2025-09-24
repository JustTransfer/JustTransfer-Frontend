import { useParams } from 'react-router-dom';
import React, { useState, useRef } from "react";
import { Box, Typography, TextField, Paper, Button, Snackbar, Alert } from "@mui/material";
import { type SnackbarCloseReason } from '@mui/material/Snackbar';
import DownloadIcon from '@mui/icons-material/Download';

import Layout from "../components/layout";
import { getOneAnonymousMessageMetadata, getOneAnonymousMessage } from "../handlers/crypto";

export default function AnonymousTransfer() {
    const { id } = useParams();

    const [messageData, setMessageData] = useState<any>(null);

    const [error, setError] = useState("");
    const [openError, setOpenError] = useState(false);

    const [success, setSuccess] = useState("");
    const [openSuccess, setOpenSuccess] = useState(false);

    const [isGetting, setIsGetting] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);

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

        const data = {
            passphrase: formData.get("passphrase"),
        };

        try {
            setIsGetting(false);
            setDownloadProgress(0);
            const result = await getOneAnonymousMessageMetadata(data.passphrase as string, id!);

            setMessageData(result.messageData);

            setSuccess("File retrieved successfully!");
            setOpenSuccess(true);

        } catch (e) {
            setError((e as Error).message);
            setOpenError(true);
            setIsGetting(false);
            return;
        }
    }

    async function downloadFile() {
        setDownloadProgress(0);
        setSuccess("");
        setOpenSuccess(false);
        setError("");
        setOpenError(false);

        let messageWithContent
        try {
            messageWithContent = await getOneAnonymousMessage(messageData, (percent: number) => {
                setDownloadProgress(prev => percent);
            });
        } catch (e) {
            setError("Failed to download file. Please try again later.");
            setOpenError(true);
            setDownloadProgress(0);
            return;
        }

        // Create a blob and trigger download
        setSuccess("File downloaded successfully.");
        setOpenSuccess(true);

        const byteArray = new Uint8Array(messageWithContent.message);
        const blob = new Blob([byteArray], { type: "application/octet-stream" });

        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = messageWithContent.filename;
        a.click();

        URL.revokeObjectURL(url); // cleanup
    }

    return (
        <Layout title="Transfer" content={
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
                    Anonymous Transfer
                </Typography>

                <Paper elevation={4} sx={{ p: 6, borderRadius: 3, width: 500, textAlign: "center" }}>
                    <Box component="form" sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }} onSubmit={handleSubmit}>

                        <TextField label="Passphrase" name="passphrase" type="text" variant="outlined" fullWidth required />

                        {messageData ? (
                            <Box sx={{ mt: 2, textAlign: "left" }}>
                                <Typography variant="h6">Message Details:</Typography>
                                <Typography>Filename: {messageData.filename}</Typography>
                                <Typography>Creation Time: {new Date(messageData.creation_time * 1000).toLocaleString()}</Typography>
                                <Typography>Lifetime: {messageData.lifetime} seconds</Typography>
                                <Typography>Max Downloads: {messageData.max_downloads}</Typography>
                                <Typography>Number of Downloads: {messageData.number_downloads}</Typography>
                                <DownloadIcon
                                    sx={{ color: "primary.main", "&:hover": { cursor: "pointer" } }}
                                    onClick={() => downloadFile()}
                                />
                            </Box>
                        ) :
                            <Button type="submit" variant="contained" sx={{ mt: 2 }} fullWidth>
                                Submit
                            </Button>
                        }
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