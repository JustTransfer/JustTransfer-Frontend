import { useParams } from 'react-router';
import React, { useState, useEffect } from "react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Tooltip from "@mui/material/Tooltip";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import DownloadIcon from '@mui/icons-material/Download';
import SaveIcon from '@mui/icons-material/Save';
import LockIcon from '@mui/icons-material/Lock';
import DescriptionIcon from '@mui/icons-material/Description';

import { useNotification } from "../hooks/useNotificationContext";
import { useTranslation } from "react-i18next";
import Layout from "../components/layout";
import { getOneLinkMessageMetadata, getOneLinkMessage } from "../handlers/crypto_link";
import { addSavedTransfer } from "../handlers/crypto";
import { formatSize, relativeExpire, formatCreated, genericDownloadFile } from "../handlers/utils";
import LinearProgressWithLabel from "../components/LinearProgressWithLabel";
import { useSpeedMeter } from "../handlers/useSpeedMeter";
import { useAuth } from "../hooks/useAuth";



export default function LinkTransfer() {
    const { t } = useTranslation(["common", "errors", "transfer", "auth"]);

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

    const { exportKey } = useAuth();

    const { success, error } = useNotification();
    const { id } = useParams();

    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState("");
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
    const { speed, updateProgress, reset: resetSpeed } = useSpeedMeter(messageData?.file_size ?? 0);

    async function getMessageMetadata(password: string) {
        try {
            setIsDownloading(false);
            setDownloadProgress(0);
            const result = await getOneLinkMessageMetadata(password as string, id!);

            setAegisKeyEncoded(result.AegisKey);
            setMacKeyEncoded(result.MacKey);
            setMessageData(result.messageData);

            success(t("common:msgFileInfoDecrypted"));

        } catch (e: any) {
            error(e.message || t("errors:errorUnknown"));
            return;
        }
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(form);
        const password = formData.get("password");

        await getMessageMetadata(password as string);
        setPassword(password as string);
    }

    async function downloadFile() {
        setIsDownloading(true);
        setDownloadProgress(0);
        resetSpeed();

        try {
            await genericDownloadFile({
                fileName: messageData.filename,
                download: (onChunk, onProgress) =>
                    getOneLinkMessage(AegisKeyEncoded, MacKeyEncoded, messageData, onChunk, onProgress),
                onProgress: (percent) => {
                    setDownloadProgress(percent);
                    updateProgress(percent);
                },
                onSuccess: () => {
                    success(t("common:msgFileDownloaded"));
                    setMessageData((prev: any) => ({
                        ...prev,
                        number_downloads: prev.number_downloads + 1,
                    }));
                },
            });
        } catch (e) {
            error(e instanceof Error ? e.message : t("errors:errorUnknown"));
        } finally {
            setIsDownloading(false);
            setDownloadProgress(0);
        }
    }

    async function saveTransferToAccount(id: string, password: string, exportKey: string) {

        console.log("Saving transfer to account:", { id, password, exportKey });
        try {
            await addSavedTransfer(id, password, exportKey, undefined);
        } catch (e) {
            error(e instanceof Error ? e.message : t("errors:errorUnknown"));
            return;
        }

        success(t("common:msgTransferSaved"));
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
            setPassword(passwordFromFragment);
            setIsLoading(false);
        };

        loadMetadata();
    }, []);

    useEffect(() => {
        // Prevent search engines from indexing this transfer link
        let metaTag = document.querySelector('meta[name="robots"]');
        if (!metaTag) {
            metaTag = document.createElement('meta');
            metaTag.setAttribute('name', 'robots');
            document.head.appendChild(metaTag);
        }
        metaTag.setAttribute('content', 'noindex, nofollow');

        // Clean up when leaving the page, in case other routes should stay indexable
        return () => {
            metaTag?.setAttribute('content', 'index, follow');
        };
    }, []);

    if (isLoading) {
        return (
            <Layout
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
        <Layout
            content={
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
                                            {t("transfer:from")} <b>{messageData.sender}</b>
                                        </Typography>

                                        <Typography variant="body1" sx={{ color: '#6e5a69' }}>
                                            {t("transfer:readyForDownload")}
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
                                            <Typography variant="caption" color="text.secondary">{t("transfer:size")}</Typography>
                                            <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                                                {formatSize(messageData.file_size)}
                                            </Typography>
                                        </Box>

                                        {/* Top-right: Downloads */}
                                        <Box
                                            sx={statTileSx}
                                        >
                                            <Typography variant="caption" color="text.secondary">{t("transfer:downloads")}</Typography>
                                            <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                                                {messageData.number_downloads}/{messageData.max_downloads === 0 ? "∞" : messageData.max_downloads}
                                            </Typography>
                                        </Box>

                                        {/* Bottom-left: Created */}
                                        <Box
                                            sx={statTileSx}
                                        >
                                            <Typography variant="caption" color="text.secondary">{t("transfer:created")}</Typography>
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
                                                {t("transfer:expires")}
                                            </Typography>
                                            <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                                                {relativeExpire(messageData, true)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    {limitReached ? (
                                        <Chip label={t("transfer:limitReached")} />
                                    ) : isDownloading ? (
                                        <LinearProgressWithLabel value={downloadProgress} speed={speed} />
                                    ) :
                                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, width: "100%" }}>
                                            <Button
                                                variant="contained"
                                                startIcon={<DownloadIcon />}
                                                onClick={downloadFile}
                                                fullWidth
                                            >
                                                {t("transfer:downloadFile")}
                                            </Button>

                                            <Divider sx={{ my: 0.5 }} />

                                            <Tooltip
                                                title={exportKey ? "" : t("transfer:loginToSave")}
                                                disableHoverListener={!!exportKey}
                                            >
                                                <span>
                                                    <Button
                                                        variant="outlined"
                                                        color="primary"
                                                        startIcon={<SaveIcon />}
                                                        disabled={!exportKey}
                                                        onClick={() => exportKey && saveTransferToAccount(id!, password, exportKey)}

                                                        fullWidth
                                                    >
                                                        {t("transfer:saveToMyTransfers")}
                                                    </Button>
                                                </span>
                                            </Tooltip>
                                        </Box>
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
                                            {t("transfer:protectedTitle")}
                                        </Typography>
                                        <Typography variant="body1" sx={{ color: '#6e5a69', mb: 4 }}>
                                            {t("transfer:protectedDescription")}
                                        </Typography>
                                    </Box>
                                    <TextField
                                        label={t("auth:password")}
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
                                                                showPassword ? t("auth:hidePassword") : t("auth:showPassword")
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
                                        {t("transfer:unlock")}
                                    </Button>
                                </Box>
                            }
                        </Box>
                    </ Paper>
                </Box>
            } />
    );
}