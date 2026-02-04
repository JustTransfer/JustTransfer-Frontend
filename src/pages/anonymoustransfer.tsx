import { useParams } from 'react-router-dom';
import React, { useState, useRef } from "react";
import { Box, Typography, TextField, Paper, Button, Snackbar, Alert } from "@mui/material";
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { type SnackbarCloseReason } from '@mui/material/Snackbar';
import DownloadIcon from '@mui/icons-material/Download';
import LinearProgress, { LinearProgressProps } from '@mui/material/LinearProgress';
// @ts-ignore
import streamSaver from 'streamsaver';

import Layout from "../components/layout";
import { getOneAnonymousMessageMetadata, getOneAnonymousMessage } from "../handlers/crypto";
import { formatSize } from "../handlers/utils";

export default function AnonymousTransfer() {
    const { id } = useParams();

    const [messageData, setMessageData] = useState<any>(null);

    const [error, setError] = useState("");
    const [openError, setOpenError] = useState(false);

    const [success, setSuccess] = useState("");
    const [openSuccess, setOpenSuccess] = useState(false);

    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);

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
            setIsDownloading(false);
            setDownloadProgress(0);
            const result = await getOneAnonymousMessageMetadata(data.passphrase as string, id!);

            setMessageData(result.messageData);

            setSuccess("File retrieved successfully!");
            setOpenSuccess(true);

        } catch (e) {
            setError((e as Error).message);
            setOpenError(true);
            setIsDownloading(false);
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
            setIsDownloading(true);

            // Check if StreamSaver is supported (has service worker support)
            const supportsStreaming = typeof streamSaver !== 'undefined' && 'serviceWorker' in navigator && window.WritableStream;

            if (supportsStreaming) {
                // Use StreamSaver for streaming download (memory efficient)
                console.log("Using StreamSaver for streaming download");
                const fileStream = streamSaver.createWriteStream(messageData.filename);
                const writer = fileStream.getWriter();

                try {
                    messageWithContent = await getOneAnonymousMessage(messageData, async (chunk, name) => {
                        // Write chunk directly to the stream
                        await writer.write(chunk);
                    }, (percent: number) => {
                        setDownloadProgress(percent);
                    });
                } catch (e) {
                    // If an error occurs during streaming, abort the stream to prevent hanging (e.g., signature verification failure)
                    await writer.abort(e);
                    throw e; // Re-throw to be caught by outer catch
                }

                // Close the stream
                await writer.close();
            } else {
                // Fallback to traditional blob download (stores in memory)
                console.log("Using fallback blob download");
                const chunks: Uint8Array[] = [];

                messageWithContent = await getOneAnonymousMessage(messageData, async (chunk, name) => {
                    // Collect chunks in memory
                    chunks.push(new Uint8Array(chunk));
                }, (percent: number) => {
                    setDownloadProgress(percent);
                });

                // Create blob from all chunks
                const blob = new Blob(chunks as BlobPart[], { type: "application/octet-stream" });
                const url = URL.createObjectURL(blob);

                // Trigger download
                try {
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = messageData.filename;
                    a.style.display = "none";
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                } finally {
                    // Cleanup
                    URL.revokeObjectURL(url);
                }
            }

            setSuccess("File downloaded successfully.");
            setOpenSuccess(true);

            // Increment download count
            setMessageData((prev: any) => ({ ...prev, number_downloads: prev.number_downloads + 1 }));

        } catch (e) {
            console.error("Download error:", e);
            setError("Failed to download file. Please try again later.");
            setOpenError(true);
        } finally {
            // Reset progress indicator
            setIsDownloading(false);
            setDownloadProgress(0);
        }
    }

    return (
        <Layout title="Anonymous Transfer" content={
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

                        {messageData ? (
                            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                                <Typography variant="h5">Message details</Typography>
                                <Table size="small">
                                    <TableBody>
                                        <TableRow>
                                            <TableCell><b>Filename</b></TableCell>
                                            <TableCell>{messageData.filename}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell><b>Creation Time</b></TableCell>
                                            <TableCell>{new Date(messageData.creation_time).toLocaleString()}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell><b>Expiration Time</b></TableCell>
                                            <TableCell>{new Date(
                                                new Date(messageData.creation_time).getTime() + messageData.lifetime * 24 * 60 * 60 * 1000
                                            ).toLocaleString()}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell><b>Size (bytes)</b></TableCell>
                                            <TableCell>{formatSize(messageData.file_size)}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell><b>Downloads</b></TableCell>
                                            <TableCell>{messageData.number_downloads}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell><b>Max Downloads</b></TableCell>
                                            <TableCell>{messageData.max_downloads === 0 ? "Unlimited" : messageData.max_downloads}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                                {isDownloading ? (
                                    <LinearProgressWithLabel value={downloadProgress} />
                                ) :
                                    <Button
                                        variant="contained"
                                        startIcon={<DownloadIcon />}
                                        onClick={downloadFile}
                                    >
                                        Download
                                    </Button>}
                            </Box>
                        ) :
                            <Box>
                                <TextField label="Passphrase" name="passphrase" type="password" variant="outlined" fullWidth required />
                                <Button type="submit" variant="contained" sx={{ mt: 2 }} fullWidth>
                                    Submit
                                </Button>
                            </Box>
                        }
                    </Box>
                </ Paper>

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