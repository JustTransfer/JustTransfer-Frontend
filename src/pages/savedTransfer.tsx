import { useEffect, useState } from "react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import InboxIcon from '@mui/icons-material/Inbox';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import PersonIcon from '@mui/icons-material/Person';
import DeleteIcon from '@mui/icons-material/Delete';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import CircularProgress from '@mui/material/CircularProgress';

import { useNotification } from "../hooks/useNotificationContext";
import { useAuth } from "../hooks/useAuth";
import Layout from "../components/layout";
import { getOneLinkMessageMetadata, getOneLinkMessage } from "../handlers/crypto_link";
import { getSavedTransfers, addSavedTransfer } from "../handlers/crypto";
import { formatSize, formatCreated, relativeExpire, expireColor, genericDownloadFile } from "../handlers/utils";

import * as errors from "../messages/errors";
import * as strings from "../messages/strings";

type Props = {
    msg: any;
    progress?: number;
    onDownload: () => void;
    onDelete: () => void;
    compact?: boolean;
};

function DownloadSection({ msg, progress, onDownload, onDelete, compact = false }: Props) {

    const downloadsLeft = msg.max_downloads - msg.number_downloads;

    // Invalid signature -> block download
    if (msg.signatureValid === false) {
        return (
            <Box sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: "center",
                gap: 2,
                width: "100%",
            }}>
                <Chip color="error" label="Tampered" />

                <IconButton color="primary" onClick={onDelete}>
                    <DeleteIcon />
                </IconButton>
            </Box>
        );
    }

    // Already fully used
    if (downloadsLeft <= 0) {
        return <Chip size={compact ? "small" : "medium"} label="Limit reached" />;
    }

    // Downloading state
    if (progress !== undefined) {
        return (
            <Stack direction="row" spacing={1} sx={{ alignItems: "center", minWidth: 90, justifyContent: { xs: "flex-start", md: "flex-end" } }}>
                <CircularProgress variant="determinate" value={progress} size={compact ? 20 : 22} />
                <Typography variant="caption">{Math.round(progress)}%</Typography>
            </Stack>
        );
    }

    // Ready state
    if (compact) {
        return (
            <Stack direction="row" spacing={1} sx={{ width: "100%", alignItems: "center" }}>
                <Button
                    fullWidth
                    variant="contained"
                    size="small"
                    startIcon={<DownloadIcon />}
                    onClick={onDownload}
                    sx={{ flex: 1 }}
                >
                    Download
                </Button>

                <IconButton color="primary" onClick={onDelete} size="small" aria-label="delete message">
                    <DeleteIcon fontSize="small" />
                </IconButton>
            </Stack>
        );
    }

    return (
        <Box sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: "center",
            gap: 2,
            width: "100%",
            justifyContent: { xs: "flex-start", sm: "flex-end" },
        }}>
            <IconButton color="primary" onClick={onDownload}>
                <DownloadIcon />
            </IconButton>

            <IconButton color="primary" onClick={onDelete}>
                <DeleteIcon />
            </IconButton>
        </Box>
    );
}


export default function SavedTransfer() {

    const theme = useTheme();
    const compactInbox = useMediaQuery(theme.breakpoints.down("sm"));

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

    const { exportKey } = useAuth();

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
            throw new Error("Delete message API not implemented yet");
            setMessages(prev => prev.filter(msg => msg.id !== id));
            success(strings.msgMessageDeleted);
        } catch (e) {
            error("An error occurred: " + (e instanceof Error ? e.message : errors.errorUnknown));
        }
    }

    async function downloadFile(message: any) {
        setDownloadProgress(prev => ({ ...prev, [message.id]: 0 }));

        try {
            await genericDownloadFile({
                fileName: message.messageData.filename,
                download: (onChunk: any, onProgress: any) =>
                    getOneLinkMessage(message.exportKey, message.messageData, onChunk, onProgress),
                onProgress: (percent: number) =>
                    setDownloadProgress(prev => ({
                        ...prev,
                        [message.messageData.id]: percent,
                    })),
                onSuccess: () => {
                    success(strings.msgFileDownloaded);

                    setMessages(prev =>
                        prev.map(m =>
                            m.messageData.id === message.messageData.id
                                ? {
                                    ...m,
                                    messageData: {
                                        ...m.messageData,
                                        number_downloads: m.messageData.number_downloads + 1,
                                    },
                                }
                                : m
                        )
                    );
                },
            });
        } catch (e) {
            error("An error occurred: " + (e instanceof Error ? e.message : errors.errorUnknown));
        } finally {
            setDownloadProgress(prev => {
                const { [message.messageData.id]: _, ...rest } = prev;
                return rest;
            });
        }
    }

    async function getMessagesLocal() {
        try {
            const msgs = await getSavedTransfers(exportKey!);
            console.log("msg 1:", msgs);

            let tmpMessagesData: any[] = [];

            for (let msg of msgs) {
                console.log("processing msg:", msg);

                try {
                    const result = await getOneLinkMessageMetadata(msg.password, msg.transfer_id);
                    // setExportKey(result.exportKey);
                    // setMessageData(result.messageData);

                    console.log("res msg:", result);
                    tmpMessagesData.push(result);
                } catch (e) {
                    console.error("Failed for", msg.transfer_id, e);
                }
            }

            setMessages(tmpMessagesData);
            console.log("Processed messages data:", tmpMessagesData);

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
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    flexDirection: "column",
                    gap: 3,
                    py: { xs: 2.25, md: 5 },
                }}
            >
                <Box sx={contentCardSx}>
                    <Box sx={headerCardSx}>
                        <Typography variant={compactInbox ? "h6" : "h5"} sx={{ fontWeight: 700, color: "#2b0f1f" }}>
                            Active Transfers
                        </Typography>
                        <IconButton aria-label="refresh" color="primary" size={compactInbox ? "medium" : "large"} onClick={getMessagesLocal}>
                            <RefreshIcon />
                        </IconButton>
                    </Box>

                    {/* Box to add a transfer by its link and password */}
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", pt: 3 }}>
                        <Button variant="contained" color="primary" onClick={() => {
                            const transferId = prompt("Enter the transfer ID:");
                            const transferPassword = prompt("Enter the transfer password:");

                            if (transferId && transferPassword) {
                                addSavedTransfer(transferId, transferPassword, exportKey!)
                                    .then(() => {
                                        success("Transfer added successfully!");
                                        getMessagesLocal(); // Refresh the list after adding
                                    })
                                    .catch((e) => {
                                        error("Failed to add transfer: " + (e instanceof Error ? e.message : errors.errorUnknown));
                                    });
                            }
                        }}>
                            Add Transfer by Link
                        </Button>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", pt: 3 }}>
                        {messages.length > 0 && !loading ? (
                            <Stack spacing={1} sx={{ width: "100%" }}>
                                {messages.map((msg) => (
                                    <ListItem
                                        key={msg.messageData.id}
                                        sx={{
                                            width: "100%",
                                            borderRadius: 3,
                                            px: { xs: 1.5, md: 3 },
                                            py: { xs: 1.5, md: 1.6 },
                                            display: "flex",
                                            alignItems: { xs: "stretch", md: "center" },
                                            flexDirection: { xs: "column", md: "row" },
                                            border: "1px solid #f1e7ee",
                                            backgroundColor: "#ffffff",
                                            boxShadow: "0 12px 28px rgba(83, 24, 60, 0.06)",
                                            gap: { xs: 1.25, md: 2 },
                                            "&:hover": { backgroundColor: "#fff7fb" }
                                        }}
                                    >
                                        <ListItemIcon sx={{ display: { xs: "none", sm: "flex" }, minWidth: { xs: 0, md: 40 }, alignSelf: { xs: "flex-start", md: "center" }, mt: { xs: 0.25, md: 0 } }}>
                                            {msg.signatureValid === false && (
                                                <ErrorOutlineOutlinedIcon color="error" />
                                            ) || (
                                                    <InsertDriveFileIcon color="primary" />
                                                )

                                            }
                                        </ListItemIcon>

                                        <ListItemText
                                            sx={{
                                                minWidth: 0,
                                                width: "100%",
                                                mr: { xs: 0, md: 2 },
                                            }}
                                            primary={
                                                <Stack spacing={compactInbox ? 0.75 : 1} sx={{ width: "100%" }}>
                                                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ alignItems: { xs: "flex-start", sm: "center" }, minWidth: 0 }}>
                                                        <PersonIcon sx={{ fontSize: 16, opacity: 0.7 }} />
                                                        <Typography variant="caption" color="text.secondary" sx={{ minWidth: 0, overflowWrap: "anywhere", lineHeight: 1.4 }}>
                                                            From <b>{msg.sender}</b> • Sended {formatCreated(msg.messageData.creation_time)}
                                                        </Typography>
                                                    </Stack>

                                                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ alignItems: { xs: "flex-start", sm: "center" }, minWidth: 0 }}>
                                                        <Typography sx={{ fontWeight: 600, overflowWrap: "anywhere", fontSize: compactInbox ? "0.98rem" : undefined, lineHeight: 1.35 }}>
                                                            {msg.messageData.filename}
                                                        </Typography>
                                                        <Chip label={formatSize(msg.messageData.file_size)} size="small" />
                                                    </Stack>

                                                    <Stack direction={compactInbox ? "column" : "row"} spacing={1} sx={{ mt: 0, alignItems: "flex-start", flexWrap: "wrap", rowGap: 1 }}>
                                                        <Chip
                                                            size="small"
                                                            variant={expireColor(msg.messageData) === "error.main" ? "filled" : expireColor(msg.messageData) === "warning.main" ? "filled" : "outlined"}
                                                            label={relativeExpire(msg.messageData)}
                                                            color={expireColor(msg.messageData) === "error.main" ? "error" : expireColor(msg.messageData) === "warning.main" ? "warning" : "default"}
                                                        />
                                                        <Chip
                                                            size="small"
                                                            variant={(msg.messageData.max_downloads - msg.messageData.number_downloads) <= 1 ? "filled" : "outlined"}
                                                            label={`${msg.messageData.max_downloads - msg.messageData.number_downloads} downloads remaining`}
                                                            color={(msg.messageData.max_downloads - msg.messageData.number_downloads) <= 1 ? "warning" : "default"}
                                                        />
                                                    </Stack>
                                                </Stack>
                                            }
                                        />


                                        <Box sx={{ width: { xs: "100%", md: "auto" }, display: "flex", justifyContent: { xs: "flex-start", md: "flex-end" } }}>
                                            <DownloadSection
                                                msg={msg.messageData}
                                                progress={downloadProgress[msg.messageData.id]}
                                                onDownload={() => downloadFile(msg)}
                                                onDelete={() => handleClickOpenDialog(msg.messageData)}
                                                compact={compactInbox}
                                            />
                                        </Box>
                                    </ListItem>
                                ))}
                            </Stack>

                        ) : (
                            loading ?
                                <CircularProgress />
                                :
                                <Box color="text.secondary" sx={{ mt: 4, textAlign: "center" }}>
                                    <InboxIcon sx={{ fontSize: 64, opacity: 0.4 }} />
                                    <Typography variant="h6">No files yet</Typography>
                                    <Typography variant="body2">
                                        When someone sends you a file, it will appear here.
                                    </Typography>
                                </Box>

                        )}
                    </Box>
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
            </Box>
        } />
    );
}