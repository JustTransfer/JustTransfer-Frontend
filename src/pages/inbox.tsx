import { useEffect, useState } from "react";
import { Box, Typography, Button, IconButton, Paper, Table, TableBody, TableCell, TableHead, TableRow, TableContainer, ListItem, ListItemIcon, ListItemText, Stack, Chip, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from "@mui/material";
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import InboxIcon from '@mui/icons-material/Inbox';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonIcon from '@mui/icons-material/Person';
import DeleteIcon from '@mui/icons-material/Delete';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';

import CircularProgress, {
    CircularProgressProps,
} from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

// @ts-ignore
import streamSaver from 'streamsaver';

import { useNotification } from "../hooks/useNotificationContext";
import { useAuth } from "../hooks/useAuth";
import Layout from "../components/layout";
import { getMessages, getOneMessage } from "../handlers/crypto"
import { formatSize, formatCreated, relativeExpire, expireColor } from "../handlers/utils";
import { deleteMessageAPI } from "../handlers/api";

import * as errors from "../messages/errors";
import * as strings from "../messages/strings";


type Props = {
    msg: any;
    progress?: number;
    onDownload: () => void;
    onDelete: () => void;
};

function DownloadSection({ msg, progress, onDownload, onDelete }: Props) {

    const downloadsLeft = msg.max_downloads - msg.number_downloads;

    // Invalid signature -> block download
    if (msg.signatureValid === false) {
        return (
            <Box sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 2,
            }}>
                <Chip color="error" label="Tampered" />

                <IconButton color="primary" onClick={onDelete}>
                    <DeleteIcon />
                </IconButton >
            </Box>
        );
    }

    // Already fully used
    if (downloadsLeft <= 0) {
        return <Chip label="Limit reached" />;
    }

    // Downloading state
    if (progress !== undefined) {
        return (
            <Stack direction="row" spacing={1} alignItems="center" minWidth={90}>
                <CircularProgress variant="determinate" value={progress} size={22} />
                <Typography variant="caption">{Math.round(progress)}%</Typography>
            </Stack>
        );
    }

    // Ready state
    return (
        <Box sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 2,
        }}>
            <IconButton color="primary" onClick={onDownload}>
                <DownloadIcon />
            </IconButton>

            <IconButton color="primary" onClick={onDelete}>
                <DeleteIcon />
            </IconButton >
        </Box>
    );
}


export default function Inbox() {

    const { username, keys, getLatestKeys } = useAuth();

    const { success, error } = useNotification();
    const [messages, setMessages] = useState<Array<any>>([]);
    const [downloadProgress, setDownloadProgress] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);

    const [openDialog, setOpenDialog] = useState(false);
    const [messageToDelete, setMessageToDelete] = useState<any>(null);

    const handleClickOpenDialog = (message: any) => {
        setMessageToDelete(message);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setMessageToDelete(null);
        setOpenDialog(false);
    };

    async function deleteMessage(id: string) {
        try {
            await deleteMessageAPI(id);
            setMessages(prev => prev.filter(msg => msg.id !== id));
            success(strings.msgMessageDeleted);
        } catch (e) {
            error("An error occurred: " + (e instanceof Error ? e.message : errors.errorUnknown));
        }
    }

    async function downloadFile(message: any) {
        setDownloadProgress(prev => ({ ...prev, [message.id]: 0 }));

        let messageWithContent;

        try {
            // Check if StreamSaver is supported (has service worker support)
            const supportsStreaming = typeof streamSaver !== 'undefined' && 'serviceWorker' in navigator && window.WritableStream;

            if (supportsStreaming) {

                // Use StreamSaver for streaming download (memory efficient)
                console.log("Using StreamSaver for streaming download");
                const fileStream = streamSaver.createWriteStream(message.filename);
                const writer = fileStream.getWriter();


                try {
                    messageWithContent = await getOneMessage(username!, keys!, message, async (chunk, name) => {
                        // Write chunk directly to the stream
                        await writer!.write(chunk);
                    }, (percent: number) => {
                        setDownloadProgress(prev => ({ ...prev, [message.id]: percent }));
                    });
                } catch (e) {
                    // If an error occurs during streaming, abort the stream to prevent hanging (e.g., signature verification failure)
                    await writer.abort(e);
                    throw e; // Re-throw to be caught by outer catch
                }

                // Close the stream
                await writer!.close();
            } else {
                // Fallback to traditional blob download (stores in memory)
                console.log("Using fallback blob download");
                const chunks: Uint8Array[] = [];

                messageWithContent = await getOneMessage(username!, keys!, message, async (chunk, name) => {
                    // Collect chunks in memory
                    chunks.push(new Uint8Array(chunk));
                }, (percent: number) => {
                    setDownloadProgress(prev => ({ ...prev, [message.id]: percent }));
                });

                // Create blob from all chunks
                const blob = new Blob(chunks as BlobPart[], { type: "application/octet-stream" });
                const url = URL.createObjectURL(blob);

                // Trigger download
                try {
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = messageWithContent.filename;
                    a.style.display = "none";
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                } finally {
                    // Cleanup
                    URL.revokeObjectURL(url);
                }
            }


            // At this point, the file has been downloaded successfully
            success(strings.msgFileDownloaded);

        } catch (e) {

            error("An error occurred: " + (e instanceof Error ? e.message : errors.errorUnknown));
            setDownloadProgress(prev => {
                const { [message.id]: _, ...rest } = prev;
                return rest;
            });
            return;
        }

        // Remove progress indicator
        setDownloadProgress(prev => {
            const { [message.id]: _, ...rest } = prev;
            return rest;
        });

        // Update the download count in the UI
        setMessages(prevMessages => prevMessages.map(msg => {
            if (msg.id === message.id) {
                return { ...msg, number_downloads: msg.number_downloads + 1 };
            }
            return msg;
        }));
    }

    async function getMessagesLocal() {
        try {
            const msgs = await getMessages(keys!);
            setMessages(msgs!);
        } catch (e) {
            error("Failed to load messages: " + (e instanceof Error ? e.message : errors.errorUnknown));
        }

        setLoading(false);
    }

    useEffect(() => {
        getMessagesLocal();
    }, []);

    return (
        <Layout title="Inbox" content={
            <Box
                sx={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    flexDirection: "column",
                    gap: 2,
                }}
            >
                <Box sx={{
                    display: 'flex', alignItems: "center",
                    justifyContent: "center", width: '80%', gap: 2
                }}>
                    <Typography variant="h5">
                        Received direct transfers
                    </Typography>
                    <IconButton aria-label="delete" color="primary" size="large" sx={{ marginLeft: 'auto' }} onClick={getMessagesLocal}>
                        <RefreshIcon />
                    </IconButton>
                </Box>


                <Box sx={{ width: '80%', display: 'flex', alignItems: 'center', justifyContent: "center" }}>
                    {messages.length > 0 && !loading ? (
                        <Stack spacing={1} sx={{ width: "100%" }}>
                            {messages.map((msg) => (
                                <ListItem
                                    key={msg.id}
                                    sx={{
                                        width: "100%",
                                        borderRadius: 2,
                                        px: 2,
                                        py: 1.2,
                                        display: "flex",
                                        alignItems: "center",
                                        border: "1px solid",
                                        borderColor: "divider",
                                        "&:hover": { backgroundColor: "action.hover" }
                                    }}
                                >
                                    <ListItemIcon>
                                        {msg.signatureValid === false && (
                                            <ErrorOutlineOutlinedIcon color="error" />
                                        ) || (
                                                <InsertDriveFileIcon color="primary" />
                                            )

                                        }
                                    </ListItemIcon>

                                    <ListItemText
                                        primary={
                                            <Stack spacing={1}>
                                                <Stack direction="row" spacing={1} alignItems="center">
                                                    <PersonIcon sx={{ fontSize: 16, opacity: 0.7 }} />
                                                    <Typography variant="caption" color="text.secondary">
                                                        From <b>{msg.sender}</b> • Received {formatCreated(msg.creation_time)}
                                                    </Typography>
                                                </Stack>

                                                <Stack direction="row" spacing={1} alignItems="center">
                                                    <Typography fontWeight={600}>{msg.filename}</Typography>
                                                    <Chip label={formatSize(msg.file_size)} size="small" />
                                                </Stack>

                                                <Stack direction="row" spacing={1} mt={0.5}>
                                                    <Chip
                                                        size="small"
                                                        variant={expireColor(msg) === "error.main" ? "filled" : expireColor(msg) === "warning.main" ? "filled" : "outlined"}
                                                        label={relativeExpire(msg)}
                                                        color={expireColor(msg) === "error.main" ? "error" : expireColor(msg) === "warning.main" ? "warning" : "default"}
                                                    />
                                                    <Chip
                                                        size="small"
                                                        variant={(msg.max_downloads - msg.number_downloads) <= 1 ? "filled" : "outlined"}
                                                        label={`${msg.max_downloads - msg.number_downloads} downloads remaining`}
                                                        color={(msg.max_downloads - msg.number_downloads) <= 1 ? "warning" : "default"}
                                                    />
                                                </Stack>
                                            </Stack>
                                        }
                                    />


                                    <DownloadSection
                                        msg={msg}
                                        progress={downloadProgress[msg.id]}
                                        onDownload={() => downloadFile(msg)}
                                        onDelete={() => handleClickOpenDialog(msg)}
                                    />
                                </ListItem>
                            ))}
                        </Stack>

                    ) : (
                        loading ?
                            <CircularProgress />
                            :
                            <Box textAlign="center" mt={8} color="text.secondary">
                                <InboxIcon sx={{ fontSize: 64, opacity: 0.4 }} />
                                <Typography variant="h6">No files yet</Typography>
                                <Typography variant="body2">
                                    When someone sends you a file, it will appear here.
                                </Typography>
                            </Box>

                    )}
                </Box>

                <Dialog
                    open={openDialog}
                    onClose={handleCloseDialog}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">
                        {"Delete Message"}
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            Are you sure you want to delete <strong>{messageToDelete?.filename}</strong>? This action cannot be undone.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions sx={{ gap: 2 }}>
                        <Button onClick={handleCloseDialog}>Cancel</Button>
                        <Button onClick={() => {
                            deleteMessage(messageToDelete.id);
                            handleCloseDialog();
                        }} color="error" autoFocus>
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>
            </ Box >
        } />
    );
};