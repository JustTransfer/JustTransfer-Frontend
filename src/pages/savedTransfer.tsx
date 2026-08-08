import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

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
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import LinkIcon from "@mui/icons-material/Link";
import KeyIcon from "@mui/icons-material/Key";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from '@mui/icons-material/Add';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';

import { useNotification } from "../hooks/useNotificationContext";
import { useAuth } from "../hooks/useAuth";
import Layout from "../components/layout";
import { getOneLinkMessageMetadata, getOneLinkMessage } from "../handlers/crypto_link";
import { getSavedTransfers, addSavedTransfer } from "../handlers/crypto";
import { deleteLinkMessageAPI } from "../handlers/api_link";
import { deleteSavedTransferAPI } from "../handlers/api";
import { formatSize, formatCreated, relativeExpire, expireColor, genericDownloadFile } from "../handlers/utils";

import * as errors from "../messages/errors";
import * as strings from "../messages/strings";

type Props = {
    msg: any;
    progress?: number;
    onDownload: () => void;
    onDelete: () => void;
    onInfo: () => void;
    compact?: boolean;
};

function DownloadSection({ msg, progress, onDownload, onDelete, onInfo, compact = false }: Props) {

    const tampered = msg.messageData.signatureValid === false;
    const downloadsLeft = tampered ? 0 : msg.messageData.max_downloads - msg.messageData.number_downloads;
    const limitReached = !tampered && downloadsLeft <= 0;

    const canDownload = !tampered && !limitReached;
    const canInfo = !tampered;
    const canDelete = !!msg.auth_key;

    const iconSize = compact ? "small" : "medium";

    const downloadControl = progress !== undefined ? (
        <Stack direction="row" spacing={1} sx={{ alignItems: "center", minWidth: compact ? undefined : 90, justifyContent: { xs: "flex-start", md: "flex-end" } }}>
            <CircularProgress variant="determinate" value={progress} size={compact ? 20 : 22} />
            <Typography variant="caption">{Math.round(progress)}%</Typography>
        </Stack>
    ) : compact ? (
        <Button
            fullWidth
            variant="contained"
            size="small"
            startIcon={<DownloadIcon />}
            onClick={onDownload}
            disabled={!canDownload}
            sx={{ flex: 1 }}
        >
            Download
        </Button>
    ) : (
        <IconButton color="primary" onClick={onDownload} disabled={!canDownload} aria-label="download">
            <DownloadIcon fontSize={iconSize} />
        </IconButton>
    );

    return (
        <Stack
            direction="row"
            spacing={1}
            sx={{
                width: compact ? "100%" : "auto",
                alignItems: "center",
                justifyContent: compact ? "flex-start" : { xs: "flex-start", sm: "flex-end" },
            }}
        >
            {downloadControl}

            <IconButton onClick={onInfo} disabled={!canInfo} size={iconSize} aria-label="transfer info">
                <InfoOutlinedIcon fontSize={iconSize} />
            </IconButton>

            <IconButton color="primary" onClick={onDelete} disabled={!canDelete} size={iconSize} aria-label="delete message">
                <DeleteIcon fontSize={iconSize} />
            </IconButton>
        </Stack>
    );
}

function parseTransferInput(input: string, password: string) {
    try {
        const url = new URL(input);

        const transferId = url.pathname.split("/").filter(Boolean).pop();

        if (!transferId) {
            throw new Error("Invalid transfer link");
        }

        // Password from fragment (#password)
        const fragmentPassword = url.hash.substring(1);

        return {
            transferId,
            password: fragmentPassword || password,
        };

    } catch {
        throw new Error("Invalid transfer URL");
    }
}

export default function SavedTransfer() {

    const navigate = useNavigate();
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

    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [transferInput, setTransferInput] = useState("");
    const [passwordInput, setPasswordInput] = useState("");
    const [addingTransfer, setAddingTransfer] = useState(false);

    async function handleAddTransfer() {
        try {
            setAddingTransfer(true);

            const { transferId, password } = parseTransferInput(
                transferInput,
                passwordInput
            );

            if (!password) {
                throw new Error("Password is missing");
            }

            await addSavedTransfer(
                transferId,
                password,
                exportKey!
            );

            success("Transfer added successfully!");

            setTransferInput("");
            setPasswordInput("");
            setOpenAddDialog(false);

            getMessagesLocal();

        } catch (e) {
            error(
                "Failed to add transfer: " +
                (e instanceof Error ? e.message : errors.errorUnknown)
            );
        } finally {
            setAddingTransfer(false);
        }
    }

    const handleClickOpenDialog = (message: any) => {
        setMessageToDelete(message);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setMessageToDelete(null);
        setOpenDialog(false);
    };

    async function deleteMessage(id: string, authKey: string) {
        try {
            await deleteLinkMessageAPI(id, authKey);

            setMessages(prev => prev.filter(msg => msg.messageData.id !== id));
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

            let tmpMessagesData: any[] = [];

            for (let msg of msgs) {

                try {
                    const result = await getOneLinkMessageMetadata(msg.password, msg.transfer_id);

                    tmpMessagesData.push({
                        ...result,
                        auth_key: msg.auth_key,
                        password: msg.password,
                    });
                } catch (e) {
                    if (e instanceof Error && e.message === errors.errorFailureMACVerification) {

                        tmpMessagesData.push({
                            messageData: {
                                id: msg.transfer_id,
                                signatureValid: false,
                            },
                            auth_key: msg.auth_key,
                            password: msg.password,
                        });
                    } else {
                        await deleteSavedTransferAPI(msg.id);
                    }
                }
            }

            setMessages(tmpMessagesData);
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

                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => setOpenAddDialog(true)}
                                sx={{
                                    minWidth: compactInbox ? 40 : undefined,
                                    width: compactInbox ? 40 : undefined,
                                    height: compactInbox ? 40 : undefined,
                                }}
                            >
                                <AddIcon />
                                {!compactInbox && "Add Transfer"}
                            </Button>

                            <IconButton aria-label="refresh" color="primary" size={compactInbox ? "medium" : "large"} onClick={getMessagesLocal}>
                                <RefreshIcon />
                            </IconButton>
                        </Box>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", pt: 3 }}>
                        {messages.length > 0 && !loading ? (
                            <Stack spacing={1} sx={{ width: "100%" }}>
                                {messages.map((msg) => {

                                    const tampered = msg.messageData.signatureValid === false;

                                    return (
                                        <ListItem
                                            key={msg.messageData.id}
                                            onClick={() => {
                                                if (!tampered) {
                                                    navigate(`/transfers/${msg.messageData.id}`);
                                                } else {
                                                    error("This transfer has been tampered and cannot be opened.");
                                                }
                                            }}
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
                                                cursor: "pointer",
                                                "&:hover": { backgroundColor: "#fff7fb" }
                                            }}
                                        >
                                            <ListItemIcon sx={{ display: { xs: "none", sm: "flex" }, minWidth: { xs: 0, md: 40 }, alignSelf: { xs: "flex-start", md: "center" }, mt: { xs: 0.25, md: 0 } }}>
                                                {tampered ? (
                                                    <ErrorOutlineOutlinedIcon color="error" />
                                                ) : (
                                                    <InsertDriveFileIcon color="primary" />
                                                )}
                                            </ListItemIcon>

                                            <ListItemText
                                                sx={{ minWidth: 0, width: "100%", mr: { xs: 0, md: 2 } }}
                                                primary={
                                                    <Stack spacing={compactInbox ? 0.75 : 1} sx={{ width: "100%" }}>
                                                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ alignItems: { xs: "flex-start", sm: "center" }, minWidth: 0 }}>
                                                            <PersonIcon sx={{ fontSize: 16, opacity: 0.7 }} />
                                                            <Typography variant="caption" color="text.secondary" sx={{ minWidth: 0, overflowWrap: "anywhere", lineHeight: 1.4 }}>
                                                                From <b>{msg.sender ?? "Unknown"}</b> • Sended{" "}
                                                                {tampered ? "Unknown" : formatCreated(msg.messageData.creation_time)}
                                                            </Typography>
                                                        </Stack>

                                                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ alignItems: { xs: "flex-start", sm: "center" }, minWidth: 0 }}>
                                                            <Typography sx={{ fontWeight: 600, overflowWrap: "anywhere", fontSize: compactInbox ? "0.98rem" : undefined, lineHeight: 1.35 }}>
                                                                {tampered ? "Unknown file" : msg.messageData.filename}
                                                            </Typography>
                                                            <Chip label={tampered ? "Unknown size" : formatSize(msg.messageData.file_size)} size="small" />
                                                        </Stack>

                                                        <Stack direction={compactInbox ? "column" : "row"} spacing={1} sx={{ mt: 0, alignItems: "flex-start", flexWrap: "wrap", rowGap: 1 }}>
                                                            {tampered ? (
                                                                <Chip size="small" color="error" label="Tampered" />
                                                            ) : (
                                                                <>
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
                                                                </>
                                                            )}
                                                        </Stack>
                                                    </Stack>
                                                }
                                            />


                                            <Box sx={{ width: { xs: "100%", md: "auto" }, display: "flex", justifyContent: { xs: "flex-start", md: "flex-end" } }} onClick={(e) => e.stopPropagation()}>
                                                <DownloadSection
                                                    msg={msg}
                                                    progress={downloadProgress[msg.messageData.id]}
                                                    onDownload={() => downloadFile(msg)}
                                                    onDelete={() => handleClickOpenDialog(msg)}
                                                    onInfo={() => navigate(`/transfers/${msg.messageData.id}`)}
                                                    compact={compactInbox}
                                                />
                                            </Box>
                                        </ListItem>
                                    );
                                })}
                            </Stack>

                        ) : (
                            loading ?
                                <CircularProgress />
                                :
                                <Box color="text.secondary" sx={{ mt: 4, textAlign: "center" }}>
                                    <InboxIcon sx={{ fontSize: 64, opacity: 0.4 }} />
                                    <Typography variant="h6">No transfers yet</Typography>
                                    <Typography variant="body2">
                                        Create or add a transfer to manage your transfers here.
                                    </Typography>
                                </Box>

                        )}
                    </Box>
                </Box>

                {/* Add Transfer Dialog */}
                <Dialog
                    open={openAddDialog}
                    onClose={() => setOpenAddDialog(false)}
                    fullWidth
                    maxWidth="sm"
                >
                    <DialogTitle>
                        Add Transfer
                        <IconButton
                            onClick={() => setOpenAddDialog(false)}
                            sx={{ float: "right" }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>

                    <DialogContent>

                        <DialogContentText sx={{ mb: 3 }}>
                            Paste a transfer link. Password can either be included after <b>#</b> in the URL or entered separately.
                        </DialogContentText>


                        <TextField
                            fullWidth
                            label="Transfer link"
                            placeholder="https://localhost/link-transfer/id#password"
                            value={transferInput}
                            onChange={(e) => setTransferInput(e.target.value)}
                            margin="normal"
                            autoFocus
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LinkIcon />
                                        </InputAdornment>
                                    )
                                }
                            }}
                        />


                        <TextField
                            fullWidth
                            label="Password (optional)"
                            placeholder="Only needed if not in URL fragment"
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                            margin="normal"
                            type="password"
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <KeyIcon />
                                        </InputAdornment>
                                    )
                                }
                            }}
                        />

                    </DialogContent>

                    <DialogActions sx={{ px: 3, pb: 3 }}>
                        <Button
                            onClick={() => setOpenAddDialog(false)}
                            disabled={addingTransfer}
                        >
                            Cancel
                        </Button>

                        <Button
                            variant="contained"
                            onClick={handleAddTransfer}
                            disabled={addingTransfer || !transferInput}
                        >
                            {addingTransfer ? (
                                <CircularProgress size={22} />
                            ) : (
                                "Add Transfer"
                            )}
                        </Button>
                    </DialogActions>

                </Dialog>

                {/* Delete Confirmation Dialog */}
                <Dialog
                    open={openDialog}
                    onClose={handleCloseDialog}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                    maxWidth="xs"
                    fullWidth
                    slotProps={{
                        paper: {
                            sx: {
                                borderRadius: 4,
                                border: "1px solid #f1e7ee",
                                boxShadow: "0 18px 40px rgba(83, 24, 60, 0.12)",
                            }
                        }
                    }}
                >
                    <DialogContent sx={{ pt: 4, px: 3.5, pb: 2 }}>
                        <Stack spacing={2.5} sx={{ textAlign: "center", alignItems: "center" }}>
                            <Box
                                sx={{
                                    width: 56,
                                    height: 56,
                                    borderRadius: "50%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    backgroundColor: "#fdeceb",
                                }}
                            >
                                <WarningAmberRoundedIcon sx={{ fontSize: 28, color: "#d32f2f" }} />
                            </Box>

                            <Stack spacing={0.75}>
                                <Typography id="alert-dialog-title" variant="h6" sx={{ fontWeight: 700, color: "#2b0f1f" }}>
                                    Delete this transfer?
                                </Typography>
                                <Typography id="alert-dialog-description" variant="body2" color="text.secondary">
                                    This action can't be undone. The transfer will be permanently removed.
                                </Typography>
                            </Stack>

                            {messageToDelete && (
                                <Box
                                    sx={{
                                        width: "100%",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1.5,
                                        px: 2,
                                        py: 1.25,
                                        borderRadius: 3,
                                        border: "1px solid #f1e7ee",
                                        backgroundColor: "#fff7fb",
                                    }}
                                >
                                    <InsertDriveFileIcon color="primary" fontSize="small" />
                                    <Typography
                                        variant="body2"
                                        sx={{ fontWeight: 600, overflowWrap: "anywhere", textAlign: "left", lineHeight: 1.3 }}
                                    >
                                        {messageToDelete.messageData.filename}
                                    </Typography>
                                </Box>
                            )}
                        </Stack>
                    </DialogContent>

                    <DialogActions sx={{ px: 3.5, pb: 3.5, pt: 1, gap: 1.5 }}>
                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={handleCloseDialog}
                            sx={{ borderRadius: 2, borderColor: "#f1e7ee", color: "#2b0f1f" }}
                        >
                            Cancel
                        </Button>
                        <Button
                            fullWidth
                            variant="contained"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={() => {
                                deleteMessage(messageToDelete.messageData.id, messageToDelete.auth_key);
                                handleCloseDialog();
                            }}
                            sx={{ borderRadius: 2 }}
                            autoFocus
                        >
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        } />
    );
}