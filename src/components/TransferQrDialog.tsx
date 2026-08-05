import { useEffect, useState, type ReactNode } from "react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import LinkIcon from "@mui/icons-material/Link";
import KeyIcon from "@mui/icons-material/Key";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

import { QRCodeSVG } from "qrcode.react";

import { useNotification } from "../hooks/useNotificationContext";

type Props = {
    open: boolean;
    onClose: () => void;
    transferId: string;
    password?: string;
    title?: string;
    filename?: string;
    baseUrl?: string;
    /** Optional custom action buttons. If omitted, a default "Close" button is shown. */
    actions?: ReactNode;
};

export default function TransferQrDialog({
    open,
    onClose,
    transferId,
    password,
    title = "Transfer link",
    filename,
    baseUrl = "https://localhost/link-transfer",
    actions,
}: Props) {

    const { success, error } = useNotification();

    const [includePasswordInLink, setIncludePasswordInLink] = useState(true);
    const [showPassword, setShowPassword] = useState(false);

    // Reset toggles each time the dialog opens
    useEffect(() => {
        if (open) {
            setIncludePasswordInLink(true);
            setShowPassword(false);
        }
    }, [open]);

    const link = includePasswordInLink && password
        ? `${baseUrl}/${transferId}#${password}`
        : `${baseUrl}/${transferId}`;

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(link);
            success("Link copied to clipboard!");
        } catch (e) {
            error("Failed to copy link");
        }
    };

    const handleCopyPassword = async () => {
        if (!password) return;
        try {
            await navigator.clipboard.writeText(password);
            success("Password copied to clipboard!");
        } catch (e) {
            error("Failed to copy password");
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="xs"
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
            <DialogTitle sx={{ pr: 6, fontWeight: 700, color: "#2b0f1f" }}>
                {title}
                <IconButton
                    onClick={onClose}
                    sx={{ position: "absolute", right: 8, top: 8 }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent>
                <Stack spacing={3} sx={{ pt: 1, alignItems: "center" }}>
                    {filename && (
                        <Typography sx={{ fontWeight: 600, textAlign: "center", overflowWrap: "anywhere" }}>
                            {filename}
                        </Typography>
                    )}

                    <Box
                        sx={{
                            p: 2,
                            borderRadius: 3,
                            border: "1px solid #f1e7ee",
                            backgroundColor: "#ffffff",
                        }}
                    >
                        <QRCodeSVG value={link} size={180} />
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

                    {password && (
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
                                value={password}
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
                </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3, flexWrap: "wrap", gap: 1 }}>
                {actions ?? (
                    <Button onClick={onClose} fullWidth variant="outlined" sx={{ borderRadius: 2 }}>
                        Close
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
}