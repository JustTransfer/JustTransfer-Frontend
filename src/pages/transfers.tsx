import { useEffect, useState } from "react";
import { Box, Typography, Button, IconButton, Paper, Table, TableBody, TableCell, TableHead, TableRow, TableContainer, ListItem, ListItemIcon, ListItemText, Stack, Chip, CircularProgress } from "@mui/material";

import RefreshIcon from "@mui/icons-material/Refresh";
import InboxIcon from "@mui/icons-material/Inbox";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import PersonIcon from "@mui/icons-material/Person";
import SendIcon from '@mui/icons-material/Send';

import { useNotification } from "../hooks/useNotificationContext";
import Layout from "../components/layout";
import { getSentMessagesAPI } from "../handlers/api";
import { formatSize, formatCreated, relativeExpire, expireColor } from "../handlers/utils";

import * as errors from "../messages/errors";
import * as strings from "../messages/strings";

export default function Transfers() {

    const { success, error } = useNotification();

    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState<Array<any>>([]);


    async function getMessagesSentLocal() {
        try {
            const response = await getSentMessagesAPI();
            setMessages(response.messages);
        } catch (e) {
            error("Failed to load messages: " + (e instanceof Error ? e.message : errors.errorUnknown));
        }

        setLoading(false);
    }

    useEffect(() => {
        getMessagesSentLocal();
    }, []);

    return (
        <Layout title="Transfers" content={
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
                        Sent account transfers
                    </Typography>
                    <IconButton aria-label="delete" color="primary" size="large" sx={{ marginLeft: 'auto' }} onClick={getMessagesSentLocal}>
                        <RefreshIcon />
                    </IconButton>
                </Box>


                <Box sx={{ width: '80%', display: 'flex', alignItems: 'center', justifyContent: "center" }}>
                    {messages.length > 0 && !loading ? (
                        <Stack spacing={1} sx={{ width: "100%" }}>
                            {messages.map((msg) => (
                                < ListItem
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
                                        <SendIcon color="primary" />
                                    </ListItemIcon>

                                    <ListItemText
                                        primary={
                                            <Stack spacing={1}>
                                                <Typography variant="caption" color="text.secondary">
                                                    {formatCreated(msg.creation_time)}
                                                </Typography>

                                                < Stack direction="row" alignItems="center" spacing={1}>
                                                    <PersonIcon sx={{ fontSize: 18 }} color="action" />
                                                    <Typography fontWeight={500}>
                                                        {msg.receiver}
                                                    </Typography>

                                                    <Chip label={formatSize(msg.file_size)} size="small" />
                                                </Stack>

                                                <Typography variant="body2" color="text.secondary">
                                                    {relativeExpire(msg)} • Max downloads: {msg.max_downloads}
                                                </Typography>
                                            </Stack>
                                        }
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
            </ Box >
        } />
    );
}