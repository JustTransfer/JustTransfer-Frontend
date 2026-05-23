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

    const contentCardSx = {
        width: "100%",
        maxWidth: 1400,
        mx: "auto",
        borderRadius: 4,
        border: "1px solid #f1e7ee",
        boxShadow: "0 18px 40px rgba(83, 24, 60, 0.08)",
        backgroundColor: "#ffffff",
        p: { xs: 2.5, md: 4 },
    };

    const headerCardSx = {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        pb: { xs: 2, md: 2.5 },
        borderBottom: "1px solid #f1e7ee",
    };

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
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    flexDirection: "column",
                    gap: 3,
                    px: { xs: 2, md: 0 },
                    py: { xs: 3, md: 5 },
                }}
            >
                <Box sx={contentCardSx}>
                    <Box sx={headerCardSx}>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: "#2b0f1f" }}>
                            Active direct transfers
                        </Typography>
                        <IconButton aria-label="refresh" color="primary" size="large" onClick={getMessagesSentLocal}>
                            <RefreshIcon />
                        </IconButton>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", pt: 3 }}>
                        {messages.length > 0 && !loading ? (
                            <Stack spacing={1} sx={{ width: "100%" }}>
                                {messages.map((msg) => (
                                    < ListItem
                                        key={msg.id}
                                        sx={{
                                            width: "100%",
                                            borderRadius: 3,
                                            px: { xs: 2, md: 3 },
                                            py: 1.6,
                                            display: "flex",
                                            alignItems: "center",
                                            border: "1px solid #f1e7ee",
                                            backgroundColor: "#ffffff",
                                            boxShadow: "0 12px 28px rgba(83, 24, 60, 0.06)",
                                            "&:hover": { backgroundColor: "#fff7fb" }
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
                                <Box textAlign="center" mt={4} color="text.secondary">
                                    <InboxIcon sx={{ fontSize: 64, opacity: 0.4 }} />
                                    <Typography variant="h6">No files yet</Typography>
                                    <Typography variant="body2">
                                        Files you send will appear here.
                                    </Typography>
                                </Box>

                        )}
                    </Box>
                </Box>
            </ Box>
        } />
    );
}