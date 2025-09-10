import { useEffect, useState } from "react";
import { Box, Typography, Button, IconButton, Paper, Table, TableBody, TableCell, TableHead, TableRow, TableContainer } from "@mui/material";
import RefreshIcon from '@mui/icons-material/Refresh';
import CircularProgress from '@mui/material/CircularProgress';
import DownloadIcon from '@mui/icons-material/Download';

import { getMessages } from "../handlers/crypto"

export default function Inbox() {
    const [messages, setMessages] = useState<Array<any>>([]);
    const [loading, setLoading] = useState(true);

    async function getMessagesLocal() {
        try {
            const msgs = await getMessages();
            setMessages(msgs!);
        } catch (e) {
            console.error("Failed to fetch messages:", e);
        }

        setLoading(false);
    }

    function downloadFile(message: number[], filename: string) {
        const byteArray = new Uint8Array(message); // convert [104,101,108,108,111] → real bytes
        const blob = new Blob([byteArray], { type: "application/octet-stream" });

        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();

        URL.revokeObjectURL(url); // cleanup
    }

    useEffect(() => {
        getMessagesLocal();
    }, []);

    return (
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
                                    <TableCell align="center"><strong>Downloads Left</strong></TableCell>
                                    <TableCell align="center"><strong>Max Downloads</strong></TableCell>
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
                                        <TableCell align="center">{msg.creation_time}</TableCell>
                                        <TableCell align="center">{new Date(
                                            new Date(msg.creation_time).getTime() + msg.lifetime * 24 * 60 * 60 * 1000
                                        ).toLocaleString()}</TableCell>
                                        <TableCell align="center">{msg.max_downloads - msg.number_downloads}</TableCell>
                                        <TableCell align="center">{msg.max_downloads}</TableCell>
                                        <TableCell align="center">
                                            {msg.signatureValid === false ? (
                                                <Typography color="error">Invalid signature</Typography>
                                            ) : (
                                                <DownloadIcon sx={{ color: "primary.main", "&:hover": { cursor: "pointer" } }} onClick={() => downloadFile(msg.message, msg.filename)} />
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
    );
};