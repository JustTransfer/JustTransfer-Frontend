import { useEffect, useState } from "react";
import { Box, Typography, Button, IconButton, Paper, Table, TableBody, TableCell, TableHead, TableRow, TableContainer } from "@mui/material";
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import CircularProgress, {
    CircularProgressProps,
} from '@mui/material/CircularProgress';

import Layout from "../components/layout";
import { getMessages, getOneMessage } from "../handlers/crypto"

export default function Inbox() {
    const [messages, setMessages] = useState<Array<any>>([]);
    const [downloadProgress, setDownloadProgress] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);

    function CircularProgressWithLabel(
        props: CircularProgressProps & { value: number },
    ) {
        return (
            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                <CircularProgress variant="determinate" {...props} />
                <Box
                    sx={{
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        position: 'absolute',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Typography
                        variant="caption"
                        component="div"
                        sx={{ color: 'text.secondary' }}
                    >{`${Math.round(props.value)}%`}</Typography>
                </Box>
            </Box>
        );
    }

    async function downloadFile(message: any) {
        setDownloadProgress(prev => ({ ...prev, [message.id]: 0 }));

        const messageWithContent = await getOneMessage(message, (percent: number) => {
            setDownloadProgress(prev => ({ ...prev, [message.id]: percent }));
        });

        if (!messageWithContent) {
            console.error("Failed to get message content");
            return;
        }

        const byteArray = new Uint8Array(messageWithContent.message);
        const blob = new Blob([byteArray], { type: "application/octet-stream" });

        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = messageWithContent.filename_dec;
        a.click();

        URL.revokeObjectURL(url); // cleanup

        // Remove progress indicator
        setDownloadProgress(prev => {
            const { [message.id]: _, ...rest } = prev;
            return rest;
        });

        // Refresh the messages to update download count
        getMessagesLocal();
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
            </Box >
        } />
    );
};