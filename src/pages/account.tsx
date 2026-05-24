import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { changePassword, generateNewKeys } from "../handlers/crypto";
import { getAccountInfoAPI, deleteAccountAPI } from "../handlers/api";
import { formatSize } from "../handlers/utils";
import AccountActionDialog from "../components/AccountActionDialog";
import { Mode } from "../components/AccountActionDialog";

import * as errors from "../messages/errors";
import * as strings from "../messages/strings";

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

                <Box sx={{ minHeight: 3 }}>
                    {progress !== undefined && (
                        <LinearProgress
                            variant="determinate"
                            value={Math.min(progress, 100)}
                        />
                    )}
                </Box>
            </Stack>
        </Card>
    );
}

export default function AccountPage() {

    const pageSx = {
        width: "100%",
        px: { xs: 2, md: 0 },
        py: { xs: 3, md: 5 },
    };

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

    const navigate = useNavigate();

    const { config } = useServerConfig();
    const { success, error } = useNotification();
    const { updateKeys, keys, exportKey } = useAuth();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("");
    const [numberTransfers, setNumberTransfers] = useState(0);

    const [dialogMode, setDialogMode] = useState<Mode | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleRotateKeys(currentPassword: string) {
        try {

            const result = await generateNewKeys(username, currentPassword, exportKey!);

            if (!result.success) {
                throw new Error(result.message || errors.errorRotateKeys);
            }

            updateKeys({
                exportKey: exportKey!,
                keys: result.keys!,
            });

            success(result.message);

        } catch (e) {
            error(e instanceof Error ? e.message : errors.errorRotateKeys);
        }
    }

    async function handleChangePassword(currentPassword: string, newPassword: string) {
        try {

            const result = await changePassword(username, currentPassword, newPassword, keys!);

            if (!result.success) {
                throw new Error(result.message || errors.errorChangePassword);
            }

            updateKeys({
                exportKey: result.exportKey!,
                keys: result.keys!,
            });

            success(result.message);

        } catch (e) {
            error(e instanceof Error ? e.message : errors.errorChangePassword);
        }
    }

    async function handleDeleteAccount() {
        try {

            const result = await deleteAccountAPI(username);

            if (result !== 204) {
                throw new Error(errors.errorDeleteAccount);
            }

            success(strings.msgAccountDeleted);

            // wait 1 second to show success message before logging out
            await new Promise(resolve => setTimeout(resolve, 2000));

            navigate("/logout", { replace: true });

        } catch (e) {
            error(e instanceof Error ? e.message : errors.errorDeleteAccount);
        }
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
                <Box sx={pageSx}>
                    <Stack spacing={4} sx={contentCardSx}>

                        <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                            <Avatar
                                sx={{
                                    width: 92,
                                    height: 92,
                                    fontSize: 40,
                                    fontWeight: 700,
                                    letterSpacing: 1,
                                    color: "#ffffff",
                                    background: "linear-gradient(135deg, #E906E5 10%, #4158d0 100%)",
                                    boxShadow: "0 10px 22px rgba(65, 88, 208, 0.25)",
                                }}
                            >
                                {username?.[0]?.toUpperCase()}
                            </Avatar>

                            <Box>
                                {(username && email) ?
                                    <>
                                        <Typography variant="h6">{username}</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {email}
                                        </Typography>
                                    </>
                                    : (
                                        <Typography variant="h6">Loading...</Typography>
                                    )
                                }
                            </Box>
                        </Box>

                        <Divider />

                        <Stack spacing={3}>

                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                <Typography variant="h5">
                                    Plan Overview
                                </Typography>

                                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                    <Chip
                                        label={role === "premium" ? "Premium Plan" : "Free Plan"}
                                        color={role === "premium" ? "primary" : "default"}
                                    />
                                    {role !== "premium" && (
                                        <Button
                                            size="small"
                                            variant="contained"
                                            onClick={() => navigate("/pricing")}
                                        >
                                            Upgrade
                                        </Button>
                                    )}
                                </Box>
                            </Box>

                            {!config ? (
                                <Typography variant="body2">
                                    Loading plan limits...
                                </Typography>
                            ) : (

                                <Grid container spacing={3} mt={1}>

                                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                        <PlanLimitCard
                                            icon={<SyncAltIcon color="primary" fontSize="large" />}
                                            title="Monthly Transfers"
                                            value={`${numberTransfers} / ${role === "premium" ? config.max_transfer_month_connected_premium : config.max_transfer_month_connected}`}
                                            progress={(numberTransfers / (role === "premium" ? config.max_transfer_month_connected_premium : config.max_transfer_month_connected)) * 100}
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                        <PlanLimitCard
                                            icon={<ScheduleIcon color="primary" fontSize="large" />}
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
                                            icon={<StorageIcon color="primary" fontSize="large" />}
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
                                            icon={<DownloadIcon color="primary" fontSize="large" />}
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
                        </Stack>

                        <Divider />

                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: { xs: "column", md: "row" },
                                gap: 2,
                                alignItems: { md: "center" },
                                justifyContent: "space-between",
                            }}
                        >
                            <Box>
                                <Typography variant="h5">
                                    Rotate Keys
                                </Typography>
                                <Typography variant="body2" color="text.primary" sx={{ mt: 1 }}>
                                    Generate new encryption and signing keys.
                                </Typography>
                            </Box>
                            <Button
                                sx={{ mt: { xs: 2, md: 0 }, alignSelf: { xs: "flex-start", md: "center" }, maxWidth: 200 }}
                                size="small"
                                variant="contained"
                                startIcon={<RefreshIcon />}
                                onClick={() => setDialogMode("rotateKeys")}
                            >
                                Rotate Keys
                            </Button>
                        </Box>

                        <Divider />

                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: { xs: "column", md: "row" },
                                gap: 2,
                                alignItems: { md: "center" },
                                justifyContent: "space-between",
                            }}
                        >
                            <Box>
                                <Typography variant="h5">
                                    Change Password
                                </Typography>
                                <Typography variant="body2" color="text.primary" sx={{ mt: 1 }}>
                                    Update your account password.
                                </Typography>
                            </Box>
                            <Button
                                sx={{ mt: { xs: 2, md: 0 }, alignSelf: { xs: "flex-start", md: "center" }, maxWidth: 200 }}
                                size="small"
                                variant="contained"
                                startIcon={<DialpadIcon />}
                                onClick={() => setDialogMode("changePassword")}
                            >
                                Change Password
                            </Button>
                        </Box>

                        <Divider />

                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: { xs: "column", md: "row" },
                                gap: 2,
                                alignItems: { md: "center" },
                                justifyContent: "space-between",
                            }}
                        >
                            <Box>
                                <Typography variant="h5" color="error">
                                    Delete Account
                                </Typography>
                                <Typography variant="body2" color="text.primary" sx={{ mt: 1 }}>
                                    Deleting your account will permanently remove all your data, including current transfers.
                                    <br />
                                    This information cannot be recovered once your account is deleted.

                                    This action cannot be undone.
                                </Typography>
                            </Box>
                            <Button
                                sx={{ mt: { xs: 2, md: 0 }, alignSelf: { xs: "flex-start", md: "center" }, maxWidth: 200 }}
                                size="small"
                                color="error"
                                variant="contained"
                                startIcon={<DeleteIcon />}
                                onClick={() => setDialogMode("deleteAccount")}
                            >
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
                                    await handleRotateKeys(currentPassword);
                                }

                                setDialogMode(null);
                            } finally {
                                setLoading(false);
                            }
                        }}
                    />
                </Box>
            }
        />
    );
}
