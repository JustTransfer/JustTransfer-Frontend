import { useEffect, useState } from "react";
import { Box, Typography, Button, IconButton, Paper, Table, TableBody, TableCell, TableHead, TableRow, TableContainer } from "@mui/material";
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import CircularProgress, {
    CircularProgressProps,
} from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

// @ts-ignore
import streamSaver from 'streamsaver';

import { useNotification } from "../hooks/useNotificationContext";
import Layout from "../components/layout";
import { getMessages, getOneMessage } from "../handlers/crypto"
import { formatSize } from "../handlers/utils";

import * as errors from "../messages/errors";
import * as strings from "../messages/strings";

export default function Inbox() {

    const { success, error } = useNotification();
    const [messages, setMessages] = useState<Array<any>>([]);
    const [downloadProgress, setDownloadProgress] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);

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
                    messageWithContent = await getOneMessage(message, async (chunk, name) => {
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

                messageWithContent = await getOneMessage(message, async (chunk, name) => {
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
            const msgs = await getMessages();
            setMessages(msgs!);
        } catch (e) {
            console.error("Failed to fetch messages:", e);
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
                        Received account transfers
                    </Typography>
                    <IconButton aria-label="delete" color="primary" size="large" sx={{ marginLeft: 'auto' }} onClick={getMessagesLocal}>
                        <RefreshIcon />
                    </IconButton>
                </Box>


                <Box sx={{ width: '80%', display: 'flex', alignItems: 'center', justifyContent: "center" }}>
                    {messages.length > 0 && !loading ? (
                        <TableContainer component={Paper}>
                            <Table sx={{ width: "100%", justifyContent: "center" }} aria-label="simple table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell align="center"><strong>From</strong></TableCell>
                                        <TableCell align="center"><strong>File name</strong></TableCell>
                                        <TableCell align="center"><strong>File size</strong></TableCell>
                                        <TableCell align="center"><strong>Received at</strong></TableCell>
                                        <TableCell align="center"><strong>Expire At</strong></TableCell>
                                        <TableCell align="center"><strong>Max Downloads</strong></TableCell>
                                        <TableCell align="center"><strong>Downloads Left</strong></TableCell>
                                        <TableCell align="center"></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {messages.map((msg) => (
                                        <TableRow
                                            key={msg.id}
                                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                        >
                                            <TableCell align="center" component="th" scope="row">
                                                <strong>{msg.sender}</strong>
                                            </TableCell>
                                            {msg.signatureValid === false ? (
                                                <TableCell align="center"><Typography color="error">Invalid signature</Typography></TableCell>
                                            ) : (
                                                <TableCell align="center">{msg.filename}</TableCell>
                                            )}
                                            <TableCell align="center" component="th" scope="row">
                                                {formatSize(msg.file_size)}
                                            </TableCell>
                                            <TableCell align="center">{new Date(msg.creation_time).toLocaleString()}</TableCell>
                                            <TableCell align="center">{new Date(
                                                new Date(msg.creation_time).getTime() + msg.lifetime * 24 * 60 * 60 * 1000
                                            ).toLocaleString()}</TableCell>
                                            <TableCell align="center">{msg.max_downloads}</TableCell>
                                            <TableCell align="center">{msg.max_downloads - msg.number_downloads}</TableCell>
                                            <TableCell align="center">
                                                {msg.signatureValid === false ? (
                                                    <Typography color="error">Invalid signature</Typography>
                                                ) : downloadProgress[msg.id] !== undefined ? (
                                                    <CircularProgress
                                                        variant="determinate"
                                                        value={downloadProgress[msg.id]}
                                                        size={24}
                                                    />
                                                ) : (
                                                    <DownloadIcon
                                                        sx={{ color: "primary.main", "&:hover": { cursor: "pointer" } }}
                                                        onClick={() => downloadFile(msg)}
                                                    />
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        !loading ? <Typography variant="h6">No messages</Typography> : <CircularProgress />
                    )}
                </Box>
            </Box >
        } />
    );
};