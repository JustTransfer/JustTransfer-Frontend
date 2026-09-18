import { useState, useEffect } from "react";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Alert from "@mui/material/Alert";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useTranslation } from "react-i18next";

import PasswordStrength from "../components/passwordStrength";


export type Mode = "changePassword" | "deleteAccount" | "rotateKeys";

type AccountActionDialogProps = {
    open: boolean;
    mode: Mode | null;
    loading?: boolean;
    onClose: () => void;
    onSubmit: (data: {
        currentPassword: string;
        newPassword?: string;
    }) => Promise<void>;
};

export default function AccountActionDialog({
    open,
    mode,
    loading = false,
    onClose,
    onSubmit
}: AccountActionDialogProps) {
    const { t } = useTranslation(["account", "auth", "errors"]);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [isStrong, setIsStrong] = useState(false);
    const [showPassword1, setShowPassword1] = useState(false);
    const [showPassword2, setShowPassword2] = useState(false);

    const [errorSamePassword, setErrorSamePassword] = useState(false);
    const [errorPasswordMismatch, setErrorPasswordMismatch] = useState(false);
    const [errorWeakPassword, setErrorWeakPassword] = useState(false);

    const handleTogglePassword1 = () => {
        setShowPassword1(prev => !prev);
    };

    const handleTogglePassword2 = () => {
        setShowPassword2(prev => !prev);
    };


    useEffect(() => {
        if (!open) {
            setCurrentPassword("");
            setNewPassword("");
            setConfirmNewPassword("");
        }
    }, [open]);

    if (!mode) return null;

    const isChangePassword = mode === "changePassword";
    const isDelete = mode === "deleteAccount";

    const title = isChangePassword
        ? t("account:dialogChangeTitle")
        : isDelete
            ? t("account:dialogDeleteTitle")
            : t("account:dialogRotateTitle");

    const description = isChangePassword
        ? t("account:dialogChangeDescription")
        : isDelete
            ? t("account:dialogDeleteDescription")
            : t("account:dialogRotateDescription");

    const buttonLabel = isChangePassword
        ? t("account:updatePassword")
        : isDelete
            ? t("account:deleteButton")
            : t("account:rotateButton");

    const buttonColor = isDelete ? "error" : "primary";

    const handleSubmit = async () => {

        setErrorPasswordMismatch(false);
        setErrorWeakPassword(false);

        let error = false;
        if (isChangePassword && newPassword === currentPassword) {
            setErrorSamePassword(true);
            error = true;
        }

        if (isChangePassword && !isStrong) {
            setErrorWeakPassword(true);
            error = true;
        }

        if (isChangePassword && newPassword !== confirmNewPassword) {
            setErrorPasswordMismatch(true);
            error = true;
        }

        if (error) {
            return;
        }

        await onSubmit({
            currentPassword,
            newPassword: isChangePassword ? newPassword : undefined
        });
    };

    const isDisabled =
        loading ||
        !currentPassword ||
        (isChangePassword && !newPassword);

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle>{title}</DialogTitle>

            <DialogContent>
                <Stack spacing={2} sx={{ mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                        {description}
                    </Typography>

                    {isDelete && (
                        <Alert severity="warning" sx={{ mb: 3 }}>
                            {t("account:dialogWarning")}
                        </Alert>
                    )}

                    <TextField
                        label={t("account:currentPassword")}
                        type={showPassword1 ? "text" : "password"}
                        fullWidth
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        slotProps={{
                            input: {
                                endAdornment: (
                                    < InputAdornment position="end" >
                                        <IconButton
                                            aria-label={
                                                showPassword1 ? t("auth:hidePassword") : t("auth:showPassword")
                                            }
                                            onClick={handleTogglePassword1}
                                        >
                                            {showPassword1 ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }
                        }}
                    />

                    {isChangePassword && (
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                            <TextField
                                label={t("auth:newPassword")}
                                type={showPassword2 ? "text" : "password"}
                                fullWidth
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                error={errorWeakPassword || errorSamePassword}
                                helperText={errorWeakPassword ? t("errors:errorWeakPassword") : errorSamePassword ? t("errors:errorSamePassword") : ""}
                                slotProps={{
                                    input: {
                                        endAdornment: (
                                            < InputAdornment position="end" >
                                                <IconButton
                                                    aria-label={
                                                        showPassword2 ? t("auth:hidePassword") : t("auth:showPassword")
                                                    }
                                                    onClick={handleTogglePassword2}
                                                >
                                                    {showPassword2 ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }
                                }}
                            />

                            <PasswordStrength password={newPassword} onStrengthChange={setIsStrong} />

                            <TextField
                                label={t("auth:confirmNewPassword")}
                                type="password"
                                fullWidth
                                value={confirmNewPassword}
                                onChange={(e) => setConfirmNewPassword(e.target.value)}
                                error={errorPasswordMismatch}
                                helperText={errorPasswordMismatch ? t("errors:errorPasswordMismatch") : ""}
                            />
                        </Box>
                    )}
                </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} disabled={loading}>
                    {t("account:cancel")}
                </Button>

                <Button
                    variant="contained"
                    color={buttonColor}
                    onClick={handleSubmit}
                    disabled={isDisabled}
                >
                    {buttonLabel}
                </Button>
            </DialogActions>
        </Dialog>
    );
}