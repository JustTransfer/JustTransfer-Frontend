import { useEffect, useState } from "react";
import { Box, Typography, Button, Stack, Divider, Avatar, Card, CardContent, LinearProgress, Grid, Chip } from "@mui/material";
import StorageIcon from "@mui/icons-material/Storage";
import DownloadIcon from "@mui/icons-material/Download";
import ScheduleIcon from "@mui/icons-material/Schedule";

import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import DialpadIcon from "@mui/icons-material/Dialpad";
import SyncAltIcon from '@mui/icons-material/SyncAlt';

import { useAuth } from "../hooks/useAuth";
import { useServerConfig } from "../hooks/useServerConfig";
import { useNotification } from "../hooks/useNotificationContext";
import Layout from "../components/layout";
import { changePassword } from "../handlers/crypto";
import { getAccountInfoAPI } from "../handlers/api";
import { formatSize } from "../handlers/utils";
import AccountActionDialog from "../components/AccountActionDialog";
import { Mode } from "../components/AccountActionDialog";

function PlanLimitCard({
    icon,
    title,
    value,
    unit,
    progress
}: {
    icon: React.ReactNode;
    title: string;
    value: string | number;
    unit?: string;
    progress?: number;
}) {
    return (
        <Card variant="outlined" sx={{ borderRadius: 3, p: 2 }}>
            <Stack spacing={1}>
                <Stack direction="row" spacing={2} alignItems="center">
                    {icon}
                    <Box>
                        <Typography variant="caption" color="text.secondary">
                            {title}
                        </Typography>
                        <Typography variant="h6" fontWeight={600}>
                            {value} {unit && <Typography variant="caption" color="text.secondary">{unit}</Typography>}
                        </Typography>
                    </Box>
                </Stack>

                {progress !== undefined && (
                    <LinearProgress
                        variant="determinate"
                        value={Math.min(progress, 100)}
                    />
                )}
            </Stack>
        </Card>
    );
}

export default function AccountPage() {

    const { config } = useServerConfig();
    const { success, error } = useNotification();
    const { updateKeys, privateKeyEnc, publicKeyEnc, privateKeySign, publicKeySign } = useAuth();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("");
    const [numberTransfers, setNumberTransfers] = useState(0);

    const [dialogMode, setDialogMode] = useState<Mode | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleRotateKeys() {
        error("Key rotation is not implemented yet.");
    }

    async function handleChangePassword(currentPassword: string, newPassword: string) {
        try {

            const result = await changePassword(username, currentPassword, newPassword, publicKeyEnc!, privateKeyEnc!, publicKeySign!, privateKeySign!);

            if (!result.success) {
                throw new Error(result.message || "Failed to change password.");
            }

            updateKeys({
                exportKey: result.exportKey!,
                privateKeyEnc: result.privateKeyEnc!,
                publicKeyEnc: result.publicKeyEnc!,
                privateKeySign: result.privateKeySign!,
                publicKeySign: result.publicKeySign!,
            });

            success(result.message);

        } catch (e) {
            error(e instanceof Error ? e.message : "Failed to change password.");
        }
    }

    async function handleDeleteAccount() {
        error("Account deletion is not implemented yet.");
    }

    useEffect(() => {
        async function fetchAccountInfo() {
            try {
                const accountInfo = await getAccountInfoAPI();
                setUsername(accountInfo.username);
                setEmail(accountInfo.email);
                setRole(accountInfo.role);
                setNumberTransfers(accountInfo.number_transfers);
            } catch (e) {
                error("Failed to fetch account info: " + (e instanceof Error ? e.message : "Unknown error"));
            }
        }

        fetchAccountInfo();
    }, []);

    return (
        <Layout
            title="Account Settings"
            content={
                <Box sx={{ py: 6, px: 20 }}>
                    <Stack spacing={4} sx={{ width: "100%" }}>

                        <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                            <Avatar sx={{ width: 80, height: 80 }}>
                                {username?.[0]?.toUpperCase()}
                            </Avatar>

                            <Box>
                                <Typography variant="h6">{username}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {email}
                                </Typography>

                                {role === "premium" && (
                                    <Typography variant="caption" color="primary">
                                        Premium User
                                    </Typography>
                                ) || (
                                        <Typography variant="caption" color="text.secondary">
                                            Free User
                                        </Typography>
                                    )}
                            </Box>
                        </Box>

                        <Divider />

                        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>

                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                <Typography variant="h5">
                                    Plan Overview
                                </Typography>

                                <Chip
                                    label={role === "premium" ? "Premium Plan" : "Free Plan"}
                                    color={role === "premium" ? "primary" : "default"}
                                />
                            </Box>

                            {!config ? (
                                <Typography variant="body2">
                                    Loading plan limits...
                                </Typography>
                            ) : (

                                <Grid container spacing={3} mt={1}>

                                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                        <PlanLimitCard
                                            icon={<SyncAltIcon color="primary" />}
                                            title="Monthly Transfers"
                                            value={`${numberTransfers} / ${role === "premium" ? config.max_transfer_month_connected_premium : config.max_transfer_month_connected}`}
                                            progress={(numberTransfers / (role === "premium" ? config.max_transfer_month_connected_premium : config.max_transfer_month_connected)) * 100}
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                        <PlanLimitCard
                                            icon={<ScheduleIcon color="primary" />}
                                            title="Maximum Lifetime"
                                            value={
                                                role === "premium"
                                                    ? config.max_lifetime_connected_premium
                                                    : config.max_lifetime_connected
                                            }
                                            unit="Days"
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                        <PlanLimitCard
                                            icon={<StorageIcon color="primary" />}
                                            title="Max File Size"
                                            value={
                                                role === "premium"
                                                    ? formatSize(config.max_file_size_connected_premium)
                                                    : formatSize(config.max_file_size_connected)
                                            }
                                            unit="per transfer"
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                        <PlanLimitCard
                                            icon={<DownloadIcon color="primary" />}
                                            title="Downloads"
                                            value={
                                                role === "premium"
                                                    ? config.max_downloads_connected_premium
                                                    : config.max_downloads_connected
                                            }
                                            unit="per transfer"
                                        />
                                    </Grid>
                                </Grid>

                            )}
                        </Box>

                        <Divider />

                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            <Typography variant="h5">
                                Rotate Keys
                            </Typography>
                            <Typography variant="body2" color="text.primary" sx={{ mt: 1 }}>
                                Generate new encryption and signing keys.
                            </Typography>
                            <Button sx={{ mt: 2, maxWidth: 200 }} size="small" variant="contained" startIcon={<RefreshIcon />} onClick={() => setDialogMode("rotateKeys")}>
                                Rotate Keys
                            </Button>
                        </Box>

                        <Divider />

                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            <Typography variant="h5">
                                Change Password
                            </Typography>
                            <Typography variant="body2" color="text.primary" sx={{ mt: 1 }}>
                                Update your account password.
                            </Typography>
                            <Button sx={{ mt: 2, maxWidth: 200 }} size="small" variant="contained" startIcon={<DialpadIcon />} onClick={() => setDialogMode("changePassword")}>
                                Change Password
                            </Button>
                        </Box>

                        <Divider />

                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                            <Typography variant="h5" color="error">
                                Delete Account
                            </Typography>
                            <Typography variant="body2" color="text.primary" sx={{ mt: 1 }}>
                                Permanently remove your account and all associated data. This action cannot be undone.
                            </Typography>
                            <Button sx={{ mt: 2, maxWidth: 200 }} size="small" color="error" variant="contained" startIcon={<DeleteIcon />} onClick={() => setDialogMode("deleteAccount")}>
                                Delete Account
                            </Button>
                        </Box>

                    </ Stack>


                    <AccountActionDialog
                        open={dialogMode !== null}
                        mode={dialogMode}
                        loading={loading}
                        onClose={() => setDialogMode(null)}
                        onSubmit={async ({ currentPassword, newPassword }) => {
                            try {
                                setLoading(true);

                                if (dialogMode === "changePassword") {
                                    await handleChangePassword(currentPassword, newPassword!);
                                }

                                if (dialogMode === "deleteAccount") {
                                    await handleDeleteAccount();
                                }

                                if (dialogMode === "rotateKeys") {
                                    await handleRotateKeys();
                                }

                                setDialogMode(null);
                            } finally {
                                setLoading(false);
                            }
                        }}
                    />
                </ Box>
            }
        />
    );
}
