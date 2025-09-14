import { useEffect, useState } from "react";
import { Box, Typography, Button, IconButton, Paper, Table, TableBody, TableCell, TableHead, TableRow, TableContainer } from "@mui/material";
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import CircularProgress, {
    CircularProgressProps,
} from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Snackbar, { type SnackbarCloseReason } from '@mui/material/Snackbar';

import Layout from "../components/layout";
import { getMessages, getOneMessage } from "../handlers/crypto"

export default function Inbox() {
    const [messages, setMessages] = useState<Array<any>>([]);
    const [downloadProgress, setDownloadProgress] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");
    const [openError, setOpenError] = useState(false);
    const [success, setSuccess] = useState("");
    const [openSuccess, setOpenSuccess] = useState(false);

    const handleClose = (event?: React.SyntheticEvent | Event, reason?: SnackbarCloseReason,) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpenSuccess(false);
        setOpenError(false);
    };

    async function downloadFile(message: any) {
        setDownloadProgress(prev => ({ ...prev, [message.id]: 0 }));
        setSuccess("");
        setOpenSuccess(false);
        setError("");
        setOpenError(false);

        let messageWithContent
        try {
            messageWithContent = await getOneMessage(message, (percent: number) => {
                setDownloadProgress(prev => ({ ...prev, [message.id]: percent }));
            });
        } catch (e) {
            setError("Failed to download file. Please try again later.");
            setOpenError(true);
            setDownloadProgress(prev => {
                const { [message.id]: _, ...rest } = prev;
                return rest;
            });
            return;
        }

        // Set the validity of the signature
        message.signatureValid = messageWithContent.signatureValid;
        if (message.signatureValid === false) {
            setError("Invalid signature. Download aborted.");
            setOpenError(true);
        } else {
            // Create a blob and trigger download
            setSuccess("File downloaded successfully.");
            setOpenSuccess(true);

            const byteArray = new Uint8Array(messageWithContent.message);
            const blob = new Blob([byteArray], { type: "application/octet-stream" });

            const url = URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = messageWithContent.filename_dec;
            a.click();

            URL.revokeObjectURL(url); // cleanup
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
                        Inbox
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
                                                <TableCell align="center">{msg.filename_dec}</TableCell>
                                            )}
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
                <Snackbar anchorOrigin={{ vertical: "bottom", horizontal: "right" }} open={openError} autoHideDuration={2000} onClose={handleClose}>
                    <Alert
                        severity="error"
                        variant="filled"
                        sx={{ width: '100%' }}
                    >
                        {error}
                    </Alert>
                </Snackbar>
                <Snackbar anchorOrigin={{ vertical: "bottom", horizontal: "right" }} open={openSuccess} autoHideDuration={3000} onClose={handleClose}>
                    <Alert
                        severity="success"
                        variant="filled"
                        sx={{ width: '100%' }}
                    >
                        {success}
                    </Alert>
                </Snackbar>
            </Box >
        } />
    );
};