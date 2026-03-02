import { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Stack,
    Typography,
    Box
} from "@mui/material";

import PasswordStrength from "../components/passwordStrength";

import * as errors from "../messages/errors";
import * as strings from "../messages/strings";

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
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [isStrong, setIsStrong] = useState(false);

    const [errorSamePassword, setErrorSamePassword] = useState(false);
    const [errorPasswordMismatch, setErrorPasswordMismatch] = useState(false);
    const [errorWeakPassword, setErrorWeakPassword] = useState(false);

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
    const isRotate = mode === "rotateKeys";

    const title = isChangePassword
        ? "Change Password"
        : isDelete
            ? "Delete Account"
            : "Rotate Keys";

    const description = isChangePassword
        ? "Enter your current password and choose a new one."
        : isDelete
            ? "Enter your current password to permanently delete your account."
            : "Enter your current password to generate new encryption and signing keys.";

    const buttonLabel = isChangePassword
        ? "Update Password"
        : isDelete
            ? "Delete Account"
            : "Rotate Keys";

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
                <Stack spacing={2} mt={1}>
                    <Typography variant="body2" color="text.secondary">
                        {description}
                    </Typography>

                    <TextField
                        label="Current Password"
                        type="password"
                        fullWidth
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                    />

                    {isChangePassword && (
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                            <TextField
                                label="New Password"
                                type="password"
                                fullWidth
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                error={errorWeakPassword || errorSamePassword}
                                helperText={errorWeakPassword ? errors.errorWeakPassword : errorSamePassword ? errors.errorSamePassword : ""}
                            />

                            <PasswordStrength password={newPassword} onStrengthChange={setIsStrong} />

                            <TextField
                                label="Confirm New Password"
                                type="password"
                                fullWidth
                                value={confirmNewPassword}
                                onChange={(e) => setConfirmNewPassword(e.target.value)}
                                error={errorPasswordMismatch}
                                helperText={errorPasswordMismatch ? errors.errorPasswordMismatch : ""}
                            />
                        </Box>
                    )}
                </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} disabled={loading}>
                    Cancel
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