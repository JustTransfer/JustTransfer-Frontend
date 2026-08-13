import { useParams } from 'react-router';
import React, { useState, useEffect } from "react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import DownloadIcon from '@mui/icons-material/Download';
import LockIcon from '@mui/icons-material/Lock';
import DescriptionIcon from '@mui/icons-material/Description';
import LinearProgress from '@mui/material/LinearProgress';
import type { LinearProgressProps } from '@mui/material/LinearProgress';

import { useNotification } from "../hooks/useNotificationContext";
import Layout from "../components/layout";
import { getOneLinkMessageMetadata, getOneLinkMessage } from "../handlers/crypto_link";
import { formatSize, relativeExpire, formatCreated, genericDownloadFile } from "../handlers/utils";

import * as errors from "../messages/errors";
import * as strings from "../messages/strings";

export default function LinkTransfer() {

    const cardSx = {
        width: "100%",
        maxWidth: 520,
        textAlign: "center",
        borderRadius: 4,
        border: "1px solid #f1e7ee",
        boxShadow: "0 18px 40px rgba(83, 24, 60, 0.12)",
        backgroundColor: "#ffffff",
        p: { xs: 3, md: 5 },
        overflow: "hidden",
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

    const [AegisKeyEncoded, setAegisKeyEncoded] = useState<string>("");
    const [MacKeyEncoded, setMacKeyEncoded] = useState<string>("");
    const [messageData, setMessageData] = useState<any>(null);

    const limitReached = messageData && messageData.max_downloads !== 0 && messageData.number_downloads >= messageData.max_downloads;

    const [isLoading, setIsLoading] = useState(true);
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

    async function getMessageMetadata(password: string) {
        try {
            setIsDownloading(false);
            setDownloadProgress(0);
            const result = await getOneLinkMessageMetadata(password as string, id!);

            setAegisKeyEncoded(result.AegisKey);
            setMacKeyEncoded(result.MacKey);
            setMessageData(result.messageData);

            success(strings.msgFileInfoDecrypted);

        } catch (e: any) {
            error(e.message || "Unknown error");
            return;
        }
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(form);
        const password = formData.get("password");

        await getMessageMetadata(password as string);
    }

    async function downloadFile() {
        setIsDownloading(true);
        setDownloadProgress(0);

        try {
            await genericDownloadFile({
                fileName: messageData.filename,
                download: (onChunk, onProgress) =>
                    getOneLinkMessage(AegisKeyEncoded, MacKeyEncoded, messageData, onChunk, onProgress),
                onProgress: setDownloadProgress,
                onSuccess: () => {
                    success(strings.msgFileDownloaded);
                    setMessageData((prev: any) => ({
                        ...prev,
                        number_downloads: prev.number_downloads + 1,
                    }));
                },
            });
        } catch (e) {
            error("An error occurred: " + (e instanceof Error ? e.message : errors.errorUnknown));
        } finally {
            setIsDownloading(false);
            setDownloadProgress(0);
        }
    }

    useEffect(() => {
        // Check if the url contains a fragment (after #) for the password
        const hash = window.location.hash;

        if (!hash) {
            setIsLoading(false);
            return;
        }

        const passwordFromFragment = hash.substring(1); // Remove the '#' character

        const loadMetadata = async () => {
            await getMessageMetadata(passwordFromFragment);
            setIsLoading(false);
        };

        loadMetadata();
    }, []);

    if (isLoading) {
        return (
            <Layout
                title="Link Transfer"
                content={
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            minHeight: "100vh",
                            transform: "translateY(-20vh)",
                        }}
                    >
                        <CircularProgress />
                    </Box>
                }
            />
        );
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
                    py: { xs: 4, md: 6 },
                }}
            >

                <Paper elevation={0} sx={cardSx}>
                    <Box component="form" sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, width: "100%", minWidth: 0 }} onSubmit={handleSubmit}>
                        {messageData ? (
                            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, width: "100%", minWidth: 0 }}>

                                <Box sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    gap: 1,
                                    width: "100%",
                                    minWidth: 0,
                                }}>
                                    <Box sx={{ p: 2, borderRadius: 3, backgroundColor: "#fff0f8" }}>
                                        <DescriptionIcon sx={{ fontSize: 60, color: "primary.main" }} />
                                    </Box>

                                    <Typography
                                        variant="h5"
                                        sx={{
                                            fontWeight: "bold",
                                            width: "100%",
                                            wordBreak: "break-word",
                                            overflowWrap: "anywhere",
                                            hyphens: "auto",
                                        }}
                                    >
                                        {messageData.filename}
                                    </Typography>

                                    <Typography variant="body2" sx={{ color: '#6e5a69' }}>
                                        From <b>{messageData.sender}</b>
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
                                        minWidth: 0,
                                        mt: 2,
                                    }}
                                >
                                    {/* Top-left: Size */}
                                    <Box
                                        sx={statTileSx}
                                    >
                                        <Typography variant="caption" color="text.secondary">Size</Typography>
                                        <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                                            {formatSize(messageData.file_size)}
                                        </Typography>
                                    </Box>

                                    {/* Top-right: Downloads */}
                                    <Box
                                        sx={statTileSx}
                                    >
                                        <Typography variant="caption" color="text.secondary">Downloads</Typography>
                                        <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                                            {messageData.number_downloads}/{messageData.max_downloads === 0 ? "∞" : messageData.max_downloads}
                                        </Typography>
                                    </Box>

                                    {/* Bottom-left: Created */}
                                    <Box
                                        sx={statTileSx}
                                    >
                                        <Typography variant="caption" color="text.secondary">Created</Typography>
                                        <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
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
                                        <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
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