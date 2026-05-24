import { useParams } from 'react-router-dom';
import React, { useState, useRef, useEffect, use } from "react";
import { Box, Typography, TextField, Paper, Button, Alert, Chip, InputAdornment, IconButton } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import DownloadIcon from '@mui/icons-material/Download';
import LockIcon from '@mui/icons-material/Lock';
import DescriptionIcon from '@mui/icons-material/Description';
import LinearProgress, { LinearProgressProps } from '@mui/material/LinearProgress';
// @ts-ignore
import streamSaver from 'streamsaver';

import { useNotification } from "../hooks/useNotificationContext";
import Layout from "../components/layout";
import { getOneAnonymousMessageMetadata, getOneAnonymousMessage } from "../handlers/crypto_anonymous";
import { formatSize, relativeExpire, formatCreated } from "../handlers/utils";

import * as errors from "../messages/errors";
import * as strings from "../messages/strings";

export default function AnonymousTransfer() {

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

    const statTileSx = {
        p: 2,
        borderRadius: 3,
        backgroundColor: "#fff7fb",
        border: "1px solid #f1e7ee",
        textAlign: "left",
    };

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
                    gap: 6,
                    px: { xs: 2, md: 3 },
                    py: { xs: 4, md: 6 },
                }}
            >

                <Paper elevation={0} sx={cardSx}>
                    <Box component="form" sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }} onSubmit={handleSubmit}>

                        {messageData ? (
                            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>

                                <Box sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    gap: 1,
                                    width: "100%",
                                }}>
                                    <Box sx={{ p: 2, borderRadius: 3, backgroundColor: "#fff0f8" }}>
                                        <DescriptionIcon sx={{ fontSize: 60, color: "primary.main" }} />
                                    </Box>

                                    <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                                        {messageData.filename}
                                    </Typography>

                                    <Typography variant="body1" sx={{ color: '#6e5a69' }}>
                                        Transfer ready for decryption and download.
                                    </Typography>
                                </Box>


                                <Box
                                    sx={{
                                        display: "grid",
                                        gridTemplateColumns: "1fr 1fr",
                                        gap: 2,
                                        width: "100%",
                                        mt: 2,
                                    }}
                                >
                                    {/* Top-left: Size */}
                                    <Box
                                        sx={statTileSx}
                                    >
                                        <Typography variant="caption" color="text.secondary">Size</Typography>
                                        <Typography variant="subtitle1" fontWeight="bold">{formatSize(messageData.file_size)}</Typography>
                                    </Box>

                                    {/* Top-right: Downloads */}
                                    <Box
                                        sx={statTileSx}
                                    >
                                        <Typography variant="caption" color="text.secondary">Downloads</Typography>
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            {messageData.number_downloads}/{messageData.max_downloads === 0 ? "∞" : messageData.max_downloads}
                                        </Typography>
                                    </Box>

                                    {/* Bottom-left: Created */}
                                    <Box
                                        sx={statTileSx}
                                    >
                                        <Typography variant="caption" color="text.secondary">Created</Typography>
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            {formatCreated(messageData.creation_time)}
                                        </Typography>
                                    </Box>

                                    {/* Bottom-right: Expires */}
                                    <Box
                                        sx={statTileSx}
                                    >
                                        {/* left align the label*/}
                                        <Typography variant="caption" color="text.secondary">
                                            Expires
                                        </Typography>
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            {relativeExpire(messageData, true)}
                                        </Typography>
                                    </Box>
                                </Box>
                                {limitReached ? (
                                    <Chip label="Limit reached" />
                                ) : isDownloading ? (
                                    <LinearProgressWithLabel value={downloadProgress} />
                                ) :
                                    <Button
                                        variant="contained"
                                        startIcon={<DownloadIcon />}
                                        onClick={downloadFile}
                                        fullWidth
                                    >
                                        Download File
                                    </Button>
                                }
                            </Box>
                        ) :
                            <Box sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: 2,
                                width: "100%",
                            }}>
                                <Box sx={{ p: 2, borderRadius: 3, backgroundColor: "#fff0f8" }}>
                                    <LockIcon color="primary" sx={{ fontSize: 60 }} />
                                </Box>
                                <Box sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    gap: 1,
                                    width: "100%",
                                }}>
                                    <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                                        Protected Link Transfer
                                    </Typography>
                                    <Typography variant="body1" sx={{ color: '#6e5a69', mb: 4 }}>
                                        This transfer is protected with a password. Please enter the password to view the transfer details and download the file.
                                    </Typography>
                                </Box>
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
                                    Unlock Transfer
                                </Button>
                            </Box>
                        }
                    </Box>
                </ Paper>
            </Box>
        } />
    );
}