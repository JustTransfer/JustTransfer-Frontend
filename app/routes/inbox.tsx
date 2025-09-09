import { useEffect, useState } from "react";
import { Box, Typography, Button, IconButton } from "@mui/material";
import RefreshIcon from '@mui/icons-material/Refresh';

import { getMessages } from "../handlers/crypto"

export default function Inbox() {
    const [messages, setMessages] = useState<Array<any>>([]);

    async function getMessagesLocal() {
        try {
            const msgs = await getMessages();
            console.log("Fetched messages:", msgs);
            setMessages(msgs!);
        } catch (e) {
            console.error("Failed to fetch messages:", e);
        }
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
                        <Typography><strong>File Name:</strong> {msg.filename}</Typography>
                        <Typography><strong>Received At:</strong> {new Date(msg.timestamp).toLocaleString()}</Typography>
                        <Typography><strong>Downloads Left:</strong> {msg.downloads_left}</Typography>
                        <Button variant="outlined" sx={{ marginTop: 1 }} onClick={() => alert(`Downloading file: ${msg.filename}`)}>Download</Button>
                    </Box>
                ))
            )}
        </Box>
    );
};