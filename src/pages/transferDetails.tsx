import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LinkIcon from "@mui/icons-material/Link";
import KeyIcon from "@mui/icons-material/Key";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import PersonIcon from "@mui/icons-material/Person";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Collapse from "@mui/material/Collapse";

import { QRCodeSVG } from "qrcode.react";

import { useNotification } from "../hooks/useNotificationContext";
import { useServerConfig } from "../hooks/useServerConfig";
import { useAuth } from "../hooks/useAuth";
import Layout from "../components/layout";
import { getOneLinkMessageMetadata, getOneLinkMessage, updateMessageLink, updateLinkPassword } from "../handlers/crypto_link";
import { getSavedTransfers, addSavedTransfer } from "../handlers/crypto";
import { deleteLinkMessageAPI } from "../handlers/api_link";
import { formatSize, formatCreated, relativeExpire, expireColor, genericDownloadFile } from "../handlers/utils";
import { frontendUrl } from "../handlers/config";
import PasswordStrength from "../components/passwordStrength";

import * as errors from "../messages/errors";
import * as strings from "../messages/strings";

export default function TransferDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const theme = useTheme();
    const compact = useMediaQuery(theme.breakpoints.down("sm"));
    const stackedLayout = useMediaQuery(theme.breakpoints.down("md"));

    const { role, exportKey } = useAuth();
    const { config } = useServerConfig();
    const { success, error } = useNotification();

    const [message, setMessage] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    const [includePasswordInLink, setIncludePasswordInLink] = useState(true);
    const [showPassword, setShowPassword] = useState(false);

    const [isUsingManualPassword, setIsUsingManualPassword] = useState(true);
    const [changingPassword, setChangingPassword] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [isNewPasswordStrong, setIsNewPasswordStrong] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [errorWeakNewPassword, setErrorWeakNewPassword] = useState(false);
    const [errorNewPasswordMismatch, setErrorNewPasswordMismatch] = useState(false);

    const [maxDownloads, setMaxDownloads] = useState<number | "">(0);
    const [lifetimeDays, setLifetimeDays] = useState<number | "">(0);
    const [saving, setSaving] = useState(false);

    const [downloadProgress, setDownloadProgress] = useState<number | undefined>(undefined);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    // Account-tier caps, used only to bound the inputs (not as their values)
    const maxDownloadsAccount = role === "premium" ? config?.max_downloads_connected_premium! : config?.max_downloads_connected!;
    const maxLifetimeAccount = role === "premium" ? config?.max_lifetime_connected_premium! : config?.max_lifetime_connected!;

    const contentCardSx = {
        width: "100%",
        maxWidth: 1400,
        mx: "auto",
        borderRadius: 4,
        border: "1px solid #f1e7ee",
        boxShadow: "0 18px 40px rgba(83, 24, 60, 0.08)",
        backgroundColor: "#ffffff",
        p: { xs: 2.5, md: 4, lg: 5 },
    };

    const headerCardSx = {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        pb: { xs: 2, md: 2.5 },
        mb: { xs: 2.5, md: 3.5 },
        borderBottom: "1px solid #f1e7ee",
    };

    const panelSx = {
        borderRadius: 3,
        border: "1px solid #f1e7ee",
        backgroundColor: "#fff7fb",
        p: { xs: 2, md: 3 },
    };

    async function loadTransfer() {
        if (!id || !exportKey) return;

        setLoading(true);
        setNotFound(false);

        try {
            const saved = await getSavedTransfers(exportKey);
            const entry = saved.find((s: any) => s.transfer_id === id);

            if (!entry) {
                setNotFound(true);
                setLoading(false);
                return;
            }

            const result = await getOneLinkMessageMetadata(entry.password, entry.transfer_id);

            const msg = {
                ...result,
                auth_key: entry.auth_key,
                password: entry.password,
            };

            setMessage(msg);
            setMaxDownloads(msg.messageData.max_downloads);
            setLifetimeDays(msg.messageData.lifetime ?? 0);
        } catch (e) {
            error("Failed to load transfer: " + (e instanceof Error ? e.message : errors.errorUnknown));
            setNotFound(true);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadTransfer();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, exportKey]);

    const link = includePasswordInLink && message?.password
        ? `${frontendUrl}/link-transfer/${id}#${message.password}`
        : `${frontendUrl}/link-transfer/${id}`;

    async function handleCopyLink() {
        try {
            await navigator.clipboard.writeText(link);
            success("Link copied to clipboard!");
        } catch (e) {
            error("Failed to copy link");
        }
    }

    async function handleCopyPassword() {
        if (!message?.password) return;
        try {
            await navigator.clipboard.writeText(message.password);
            success("Password copied to clipboard!");
        } catch (e) {
            error("Failed to copy password");
        }
    }

    const handlePasswordModeChange = (_event: React.MouseEvent<HTMLElement>, nextValue: string | null) => {
        if (nextValue === null) return;

        const manual = nextValue === "manual";
        setIsUsingManualPassword(manual);

        setNewPassword("");
        setConfirmNewPassword("");
        setIsNewPasswordStrong(false);
        setShowNewPassword(false);
        setErrorWeakNewPassword(false);
        setErrorNewPasswordMismatch(false);
    };

    const settingsChanged = message
        ? maxDownloads !== message.messageData.max_downloads || lifetimeDays !== (message.messageData.lifetime ?? 0)
        : false;

    const maxDownloadsInvalid = maxDownloads === "" || (maxDownloadsAccount ? maxDownloads < 1 || maxDownloads > maxDownloadsAccount : maxDownloads < 1);
    const lifetimeInvalid = lifetimeDays === "" || (maxLifetimeAccount ? lifetimeDays < 1 || lifetimeDays > maxLifetimeAccount : lifetimeDays < 1);

    async function handleSave() {
        if (!message || maxDownloads === "" || lifetimeDays === "") return;

        setSaving(true);
        try {
            // await updateLinkMessageAPI(message.messageData.id, message.auth_key, message.cfilename, message.nonce_filename, maxDownloads, lifetimeDays);

            console.log("Updating transfer with values:", message);

            const { nonce_filename, cfilename, mac } = await updateMessageLink(message.messageData.id, message.auth_key, message.AegisKey, message.MacKey, message.messageData.filename, maxDownloads, lifetimeDays, message.messageData.hash_file, message.messageData.file_id, message.messageData.chunk_size, message.messageData.creation_time, message.messageData.file_size);

            success("Transfer updated successfully!");

            setMessage((prev: any) => ({
                ...prev,
                messageData: {
                    ...prev.messageData,

                    cfilename: cfilename,
                    nonce_filename: nonce_filename,
                    mac: mac,
                    max_downloads: maxDownloads,
                    lifetime: lifetimeDays,
                },
            }));
        } catch (e) {
            error("Failed to update transfer: " + (e instanceof Error ? e.message : errors.errorUnknown));
        } finally {
            setSaving(false);
        }
    }

    async function handleChangePassword() {
        if (!message) return;

        let hasError = false;

        if (isUsingManualPassword) {
            if (!isNewPasswordStrong) {
                error(errors.errorWeakPassword);
                setErrorWeakNewPassword(true);
                hasError = true;
            } else {
                setErrorWeakNewPassword(false);
            }

            if (newPassword !== confirmNewPassword) {
                error(errors.errorPasswordMismatch);
                setErrorNewPasswordMismatch(true);
                hasError = true;
            } else {
                setErrorNewPasswordMismatch(false);
            }
        }

        if (hasError) return;

        setChangingPassword(true);
        try {
            const { auth_key, password } = await updateLinkPassword(
                message.messageData.id,
                message.auth_key,
                message.AegisKey,
                message.MacKey,
                isUsingManualPassword ? newPassword : undefined
            );

            await addSavedTransfer(
                message.messageData.id,
                password,
                exportKey!,
                auth_key
            );

            success("Password updated successfully!");

            setMessage((prev: any) => ({
                ...prev,
                auth_key,
                password,
            }));

            setNewPassword("");
            setConfirmNewPassword("");
            setIsNewPasswordStrong(false);
            setShowNewPassword(false);
        } catch (e) {
            error("Failed to update password: " + (e instanceof Error ? e.message : errors.errorUnknown));
        } finally {
            setChangingPassword(false);
        }
    }

    async function handleDownload() {
        if (!message) return;

        setDownloadProgress(0);
        try {
            await genericDownloadFile({
                fileName: message.messageData.filename,
                download: (onChunk: any, onProgress: any) =>
                    getOneLinkMessage(message.AegisKey, message.MacKey, message.messageData, onChunk, onProgress),
                onProgress: (percent: number) => setDownloadProgress(percent),
                onSuccess: () => {
                    success(strings.msgFileDownloaded);
                    setMessage((prev: any) => ({
                        ...prev,
                        messageData: {
                            ...prev.messageData,
                            number_downloads: prev.messageData.number_downloads + 1,
                        },
                    }));
                },
            });
        } catch (e) {
            error("An error occurred: " + (e instanceof Error ? e.message : errors.errorUnknown));
        } finally {
            setDownloadProgress(undefined);
        }
    }

    async function handleDelete() {
        if (!message) return;

        try {
            await deleteLinkMessageAPI(message.messageData.id, message.auth_key);
            success(strings.msgMessageDeleted);
            navigate("/transfers");
        } catch (e) {
            error("An error occurred: " + (e instanceof Error ? e.message : errors.errorUnknown));
        }
    }

    const downloadsLeft = message ? message.messageData.max_downloads - message.messageData.number_downloads : 0;

    return (
        <Layout title="Transfer Details" content={
            <Box sx={{
                flex: 1,
                width: "100%",
                display: "flex",
                alignItems: "center",
                flexDirection: "column",
                gap: 3,
                py: { xs: 2.25, md: 5 },
                px: { xs: 1.5, sm: 2, md: 3 },
            }}>
                {loading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", pt: 8 }}>
                        <CircularProgress />
                    </Box>
                ) : notFound || !message ? (
                    <Box sx={contentCardSx}>
                        <Typography variant="h6" sx={{ textAlign: "center", color: "#2b0f1f" }}>
                            Transfer not found
                        </Typography>
                        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                            <Button variant="contained" onClick={() => navigate("/transfers")}>
                                Back to transfers
                            </Button>
                        </Box>
                    </Box>
                ) : (
                    <Box sx={contentCardSx}>
                        {/* Header */}
                        <Box sx={headerCardSx}>
                            <Stack direction="row" spacing={1} sx={{ alignItems: "center", minWidth: 0 }}>
                                <IconButton onClick={() => navigate("/transfers")} aria-label="back">
                                    <ArrowBackIcon />
                                </IconButton>
                                <Typography variant={compact ? "h6" : "h5"} sx={{ fontWeight: 700, color: "#2b0f1f" }}>
                                    Transfer Details
                                </Typography>
                            </Stack>

                            {message.auth_key && (
                                <IconButton color="primary" onClick={() => setOpenDeleteDialog(true)} aria-label="delete transfer">
                                    <DeleteIcon />
                                </IconButton>
                            )}
                        </Box>

                        {/* File summary */}
                        <Box sx={{ ...panelSx, mb: { xs: 3, md: 4 } }}>
                            <Stack direction={{ xs: "column", sm: "row" }} spacing={{ xs: 1.5, sm: 2 }} sx={{ alignItems: { xs: "flex-start", sm: "center" }, justifyContent: "space-between" }}>
                                <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", minWidth: 0 }}>
                                    <InsertDriveFileIcon color="primary" />
                                    <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                                        <Typography sx={{ fontWeight: 600, overflowWrap: "anywhere" }}>
                                            {message.messageData.filename}
                                        </Typography>
                                        <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
                                            <PersonIcon sx={{ fontSize: 14, opacity: 0.7 }} />
                                            <Typography variant="caption" color="text.secondary">
                                                From <b>{message.sender ?? "Unknown"}</b> • Sent {formatCreated(message.messageData.creation_time)}
                                            </Typography>
                                        </Stack>
                                    </Stack>
                                </Stack>

                                <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", rowGap: 1, justifyContent: { xs: "flex-start", sm: "flex-end" } }}>
                                    <Chip size="small" label={formatSize(message.messageData.file_size)} />
                                    <Chip
                                        size="small"
                                        label={relativeExpire(message.messageData)}
                                        color={expireColor(message.messageData) === "error.main" ? "error" : expireColor(message.messageData) === "warning.main" ? "warning" : "default"}
                                    />
                                    <Chip
                                        size="small"
                                        label={`${downloadsLeft} downloads remaining`}
                                        color={downloadsLeft <= 1 ? "warning" : "default"}
                                        variant={downloadsLeft <= 1 ? "filled" : "outlined"}
                                    />
                                </Stack>
                            </Stack>
                        </Box>

                        {/* Body: two columns on md+, stacked on mobile */}
                        <Stack direction={{ xs: "column", md: "row" }} spacing={{ xs: 3, md: 5 }} sx={{ alignItems: "stretch" }}>

                            {/* Left column: Share */}
                            <Stack spacing={2.5} sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#2b0f1f" }}>
                                    Share
                                </Typography>

                                <Stack spacing={3} sx={{ alignItems: "center" }}>
                                    <Box sx={{ p: 2, borderRadius: 3, border: "1px solid #f1e7ee", backgroundColor: "#ffffff" }}>
                                        <QRCodeSVG value={link} size={compact ? 160 : 200} />
                                    </Box>

                                    <TextField
                                        fullWidth
                                        label="Transfer link"
                                        value={link}
                                        slotProps={{
                                            input: {
                                                readOnly: true,
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <LinkIcon />
                                                    </InputAdornment>
                                                ),
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton onClick={handleCopyLink} edge="end" size="small">
                                                            <ContentCopyIcon fontSize="small" />
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            }
                                        }}
                                    />

                                    {message.password && (
                                        <>
                                            <FormControlLabel
                                                sx={{
                                                    width: "100%",
                                                    m: 0,
                                                    justifyContent: "space-between",
                                                    px: 1.5,
                                                    py: 0.75,
                                                    borderRadius: 3,
                                                    border: "1px solid #f1e7ee",
                                                    backgroundColor: "#fff7fb",
                                                }}
                                                labelPlacement="start"
                                                control={
                                                    <Switch
                                                        checked={includePasswordInLink}
                                                        onChange={(e) => setIncludePasswordInLink(e.target.checked)}
                                                    />
                                                }
                                                label={
                                                    <Typography variant="body2" sx={{ fontWeight: 600, color: "#2b0f1f" }}>
                                                        Include password in link
                                                    </Typography>
                                                }
                                            />

                                            <TextField
                                                fullWidth
                                                label="Password"
                                                type={showPassword ? "text" : "password"}
                                                value={message.password}
                                                slotProps={{
                                                    input: {
                                                        readOnly: true,
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <KeyIcon />
                                                            </InputAdornment>
                                                        ),
                                                        endAdornment: (
                                                            <InputAdornment position="end">
                                                                <IconButton onClick={() => setShowPassword((p) => !p)} edge="end" size="small">
                                                                    {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                                                                </IconButton>
                                                                <IconButton onClick={handleCopyPassword} edge="end" size="small">
                                                                    <ContentCopyIcon fontSize="small" />
                                                                </IconButton>
                                                            </InputAdornment>
                                                        ),
                                                    }
                                                }}
                                            />
                                        </>
                                    )}

                                    <Button
                                        fullWidth
                                        variant="contained"
                                        startIcon={downloadProgress !== undefined ? <CircularProgress size={18} color="inherit" /> : <DownloadIcon />}
                                        onClick={handleDownload}
                                        disabled={downloadsLeft <= 0 || downloadProgress !== undefined}
                                    >
                                        {downloadProgress !== undefined ? `Downloading ${Math.round(downloadProgress)}%` : "Download"}
                                    </Button>
                                </Stack>
                            </Stack>

                            {stackedLayout ? (
                                <Divider sx={{ width: "100%" }} />
                            ) : (
                                <Divider orientation="vertical" flexItem sx={{ borderColor: "#f1e7ee" }} />
                            )}

                            {/* Right column: Manage */}
                            <Stack spacing={2.5} sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#2b0f1f" }}>
                                    Manage
                                </Typography>

                                {message.auth_key ? (
                                    <Stack spacing={3}>
                                        <Box sx={{ ...panelSx, backgroundColor: "#ffffff" }}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                                                Transfer settings
                                            </Typography>

                                            <Stack spacing={2}>
                                                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                                                    <TextField
                                                        label="Max Downloads"
                                                        name="maxDownloads"
                                                        type="number"
                                                        slotProps={{ htmlInput: { min: 1, max: maxDownloadsAccount } }}
                                                        variant="outlined"
                                                        fullWidth
                                                        required
                                                        value={maxDownloads}
                                                        onChange={(e) => {
                                                            const v = e.target.value;
                                                            setMaxDownloads(v === "" ? "" : Number(v));
                                                        }}
                                                        error={maxDownloadsInvalid}
                                                        helperText={
                                                            maxDownloadsInvalid
                                                                ? `Must be between 1 and ${maxDownloadsAccount}`
                                                                : maxDownloadsAccount
                                                                    ? `Max allowed: ${maxDownloadsAccount}`
                                                                    : undefined
                                                        }
                                                    />

                                                    <TextField
                                                        label="Lifetime"
                                                        name="lifetime"
                                                        type="number"
                                                        slotProps={{ htmlInput: { min: 1, max: maxLifetimeAccount } }}
                                                        variant="outlined"
                                                        fullWidth
                                                        required
                                                        value={lifetimeDays}
                                                        onChange={(e) => {
                                                            const v = e.target.value;
                                                            setLifetimeDays(v === "" ? "" : Number(v));
                                                        }}
                                                        error={lifetimeInvalid}
                                                        helperText={
                                                            lifetimeInvalid
                                                                ? `Must be between 1 and ${maxLifetimeAccount} days`
                                                                : maxLifetimeAccount
                                                                    ? `Max allowed: ${maxLifetimeAccount} days`
                                                                    : undefined
                                                        }
                                                    />
                                                </Stack>

                                                <Button
                                                    fullWidth
                                                    variant="contained"
                                                    startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
                                                    onClick={handleSave}
                                                    disabled={saving || !settingsChanged || maxDownloadsInvalid || lifetimeInvalid}
                                                >
                                                    Save changes
                                                </Button>
                                            </Stack>
                                        </Box>

                                        <Box sx={{ ...panelSx, backgroundColor: "#ffffff" }}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                                                Change password
                                            </Typography>

                                            <Stack spacing={2}>
                                                <ToggleButtonGroup
                                                    exclusive
                                                    fullWidth
                                                    value={isUsingManualPassword ? "manual" : "auto"}
                                                    onChange={handlePasswordModeChange}
                                                    sx={{
                                                        display: "grid",
                                                        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                                                        gap: 1,
                                                        "& .MuiToggleButtonGroup-grouped": {
                                                            border: 0,
                                                            borderRadius: 2,
                                                            textTransform: "none",
                                                            px: { xs: 1, sm: 2 },
                                                            py: { xs: 1, sm: 1.25 },
                                                            width: "100%",
                                                        },
                                                    }}
                                                >
                                                    <ToggleButton value="manual" aria-label="Set password manually" sx={{ textAlign: "left", alignItems: "flex-start" }}>
                                                        <Box sx={{ width: "100%" }}>
                                                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                                                Set manually
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                Choose your own password
                                                            </Typography>
                                                        </Box>
                                                    </ToggleButton>
                                                    <ToggleButton value="auto" aria-label="Auto-generate password" sx={{ textAlign: "left", alignItems: "flex-start" }}>
                                                        <Box sx={{ width: "100%" }}>
                                                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                                                Auto-generate
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                Replaces the shared link's password
                                                            </Typography>
                                                        </Box>
                                                    </ToggleButton>
                                                </ToggleButtonGroup>

                                                <Collapse in={isUsingManualPassword} unmountOnExit>
                                                    <Stack spacing={2}>
                                                        <TextField
                                                            label="New password"
                                                            name="newPassword"
                                                            type={showNewPassword ? "text" : "password"}
                                                            variant="outlined"
                                                            fullWidth
                                                            required
                                                            value={newPassword}
                                                            onChange={(e) => setNewPassword(e.target.value)}
                                                            error={errorWeakNewPassword}
                                                            helperText={errorWeakNewPassword ? errors.errorWeakPassword : ""}
                                                            slotProps={{
                                                                input: {
                                                                    endAdornment: (
                                                                        <InputAdornment position="end">
                                                                            <IconButton
                                                                                aria-label={showNewPassword ? "Hide password" : "Show password"}
                                                                                onClick={() => setShowNewPassword((p) => !p)}
                                                                            >
                                                                                {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                                                            </IconButton>
                                                                        </InputAdornment>
                                                                    ),
                                                                },
                                                            }}
                                                        />

                                                        <PasswordStrength password={newPassword} onStrengthChange={setIsNewPasswordStrong} />

                                                        <TextField
                                                            label="Confirm new password"
                                                            name="confirmNewPassword"
                                                            type="password"
                                                            variant="outlined"
                                                            fullWidth
                                                            required
                                                            value={confirmNewPassword}
                                                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                                                            error={errorNewPasswordMismatch}
                                                            helperText={errorNewPasswordMismatch ? errors.errorPasswordMismatch : ""}
                                                        />
                                                    </Stack>
                                                </Collapse>

                                                <Button
                                                    fullWidth
                                                    variant="contained"
                                                    startIcon={changingPassword ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
                                                    onClick={handleChangePassword}
                                                    disabled={changingPassword || (isUsingManualPassword && (!newPassword || !confirmNewPassword))}
                                                >
                                                    Update password
                                                </Button>
                                            </Stack>
                                        </Box>
                                    </Stack>
                                ) : (
                                    <Typography variant="body2" color="text.secondary">
                                        You don't have owner access to manage this transfer's settings.
                                    </Typography>
                                )}
                            </Stack>
                        </Stack>
                    </Box>
                )}

                <Dialog
                    open={openDeleteDialog}
                    onClose={() => setOpenDeleteDialog(false)}
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
                            <Box sx={{
                                width: 56, height: 56, borderRadius: "50%",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                backgroundColor: "#fdeceb",
                            }}>
                                <WarningAmberRoundedIcon sx={{ fontSize: 28, color: "#d32f2f" }} />
                            </Box>
                            <Stack spacing={0.75}>
                                <Typography variant="h6" sx={{ fontWeight: 700, color: "#2b0f1f" }}>
                                    Delete this transfer?
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    This action can't be undone. The transfer will be permanently removed.
                                </Typography>
                            </Stack>
                        </Stack>
                    </DialogContent>
                    <DialogActions sx={{ px: 3.5, pb: 3.5, pt: 1, gap: 1.5 }}>
                        <Button fullWidth variant="outlined" onClick={() => setOpenDeleteDialog(false)} sx={{ borderRadius: 2, borderColor: "#f1e7ee", color: "#2b0f1f" }}>
                            Cancel
                        </Button>
                        <Button
                            fullWidth
                            variant="contained"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={() => { setOpenDeleteDialog(false); handleDelete(); }}
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