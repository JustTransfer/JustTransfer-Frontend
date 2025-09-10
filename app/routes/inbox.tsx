import { useEffect, useState } from "react";
import { Box, Typography, Button, IconButton } from "@mui/material";
import RefreshIcon from '@mui/icons-material/Refresh';

import { getMessages } from "../handlers/crypto"

export default function Inbox() {
    const [messages, setMessages] = useState<Array<any>>([]);

    async function getMessagesLocal() {
        try {
            const msgs = await getMessages();
            setMessages(msgs!);
        } catch (e) {
            console.error("Failed to fetch messages:", e);
        }
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
                justifyContent: "center",
                flexDirection: "column",
                gap: 10,
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

            {messages == null || messages.length === 0 ? (
                <Typography variant="h6">No messages</Typography>
            ) : (
                messages.map((msg, index) => (
                    <Box key={index} sx={{ border: '1px solid', padding: 2, borderRadius: 2, width: '80%' }}>
                        <Typography><strong>From:</strong> {msg.sender}</Typography>

                        {msg.signatureValid === false ? (
                            <Typography color="error"><strong>Error:</strong> Invalid signature!</Typography>
                        ) : (
                            <Typography><strong>File Name:</strong> {msg.filename}</Typography>
                        )}

                        <Typography><strong>Received At:</strong> {new Date(msg.creation_time).toLocaleString()}</Typography>
                        <Typography>
                            <strong>Expire At:</strong>{" "}
                            {new Date(
                                new Date(msg.creation_time).getTime() + msg.lifetime * 24 * 60 * 60 * 1000
                            ).toLocaleString()}
                        </Typography>
                        <Typography><strong>Max Downloads:</strong> {msg.max_downloads}</Typography>
                        <Typography><strong>Downloads Left:</strong> {msg.max_downloads - msg.number_downloads}</Typography>

                        {msg.signatureValid === true && (
                            <Button variant="outlined" sx={{ marginTop: 1 }} onClick={() => downloadFile(msg.message, msg.filename)}>Download</Button>
                        )}
                    </Box>
                ))
            )
            }
        </Box >
    );
};