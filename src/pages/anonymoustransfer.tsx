import { useParams } from 'react-router-dom';
import React, { useState, useRef } from "react";
import { Box, Typography, TextField, Paper, Button, Alert, Chip, InputAdornment, IconButton } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import DownloadIcon from '@mui/icons-material/Download';
import LinearProgress, { LinearProgressProps } from '@mui/material/LinearProgress';
// @ts-ignore
import streamSaver from 'streamsaver';

import { useNotification } from "../hooks/useNotificationContext";
import Layout from "../components/layout";
import { getOneAnonymousMessageMetadata, getOneAnonymousMessage } from "../handlers/crypto_anonymous";
import { formatSize } from "../handlers/utils";

import * as errors from "../messages/errors";
import * as strings from "../messages/strings";

export default function AnonymousTransfer() {

    const { success, error } = useNotification();
    const { id } = useParams();

    const [showPassword, setShowPassword] = useState(false);
    const handleTogglePassword = () => {
        setShowPassword(prev => !prev);
    };

    const [exportKey, setExportKey] = useState<string>("");
    const [messageData, setMessageData] = useState<any>(null);

    const limitReached = messageData && messageData.max_downloads !== 0 && messageData.number_downloads >= messageData.max_downloads;

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

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(form);

        const data = {
            password: formData.get("password"),
        };

        try {
            setIsDownloading(false);
            setDownloadProgress(0);
            const result = await getOneAnonymousMessageMetadata(data.password as string, id!);

            setExportKey(result.exportKey);
            setMessageData(result.messageData);

            success(strings.msgFileInfoDecrypted);

        } catch (e) {

            error("An error occurred: " + (e instanceof Error ? e.message : errors.errorUnknown));
            return;
        }
    }

    async function downloadFile() {
        setDownloadProgress(0);

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
                    messageWithContent = await getOneAnonymousMessage(exportKey, messageData, async (chunk, name) => {
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

                messageWithContent = await getOneAnonymousMessage(exportKey, messageData, async (chunk, name) => {
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

            success(strings.msgFileDownloaded);

            // Increment download count
            setMessageData((prev: any) => ({ ...prev, number_downloads: prev.number_downloads + 1 }));

        } catch (e) {
            error("An error occurred: " + (e instanceof Error ? e.message : errors.errorUnknown));
        } finally {
            // Reset progress indicator
            setIsDownloading(false);
            setDownloadProgress(0);
        }
    }

    return (
        <Layout title="Link Transfer" content={
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
                    Link Transfer
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
                                {limitReached ? (
                                    <Chip label="Limit reached" />
                                ) : isDownloading ? (
                                    <LinearProgressWithLabel value={downloadProgress} />
                                ) :
                                    <Button
                                        variant="contained"
                                        startIcon={<DownloadIcon />}
                                        onClick={downloadFile}
                                    >
                                        Download
                                    </Button>
                                }
                            </Box>
                        ) :
                            <Box>
                                <TextField
                                    label="Password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    variant="outlined"
                                    fullWidth
                                    required

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
                                <Button type="submit" variant="contained" sx={{ mt: 2 }} fullWidth>
                                    Submit
                                </Button>
                            </Box>
                        }
                    </Box>
                </ Paper>
            </Box>
        } />
    );
}