import { useEffect, useState } from "react";
import { Box, Typography, Button, Stack, Divider, Avatar, Card, CardContent, LinearProgress } from "@mui/material";
import StorageIcon from "@mui/icons-material/Storage";
import DownloadIcon from "@mui/icons-material/Download";
import ScheduleIcon from "@mui/icons-material/Schedule";

import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import DialpadIcon from "@mui/icons-material/Dialpad";
import SyncAltIcon from '@mui/icons-material/SyncAlt';

import { useServerConfig } from "../hooks/useServerConfig";
import { useNotification } from "../hooks/useNotificationContext";
import Layout from "../components/layout";
import { getAccountInfoAPI } from "../handlers/api";
import { formatSize } from "../handlers/utils";

function PlanLimitCard({
    icon,
    title,
    value,
    unit
}: {
    icon: React.ReactNode;
    title: string;
    value: string | number;
    unit?: string;
}) {
    return (
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                    {icon}

                    <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                            {title}
                        </Typography>

                        <Typography variant="h6">
                            {value} {unit && <Typography variant="caption" color="text.secondary">{unit}</Typography>}
                        </Typography>
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
}

export default function AccountPage() {

    const { config } = useServerConfig();
    const { success, error } = useNotification();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("");
    const [numberTransfers, setNumberTransfers] = useState(0);

    async function handleRotateKeys() {
        error("Key rotation is not implemented yet.");
    }

    async function handleChangePassword() {
        error("Password change is not implemented yet.");
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
                            <Typography variant="h5">
                                {role === "premium" ? "Premium Plan Limits" : "Free Plan Limits"}
                            </Typography>

                            {!config ? (
                                <Typography variant="body2">
                                    Loading plan limits...
                                </Typography>
                            ) : (

                                <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                    <Stack spacing={3}>
                                        <Typography variant="h6">Account Limits</Typography>

                                        <PlanLimitCard
                                            icon={<SyncAltIcon color="primary" />}
                                            title="Maximum Number of Transfers"
                                            value={
                                                role === "premium"
                                                    ? config.max_transfer_connected_premium
                                                    : config.max_transfer_connected
                                            }
                                        />

                                        <Box>
                                            <Typography variant="body1">
                                                {numberTransfers} / {role === "premium" ? config.max_transfer_connected_premium : config.max_transfer_connected} transfers used
                                            </Typography>

                                            <LinearProgress
                                                variant="determinate"
                                                value={
                                                    (numberTransfers / (role === "premium" ? config.max_transfer_connected_premium : config.max_transfer_connected)) * 100
                                                }
                                                sx={{ mt: 1 }}
                                            />
                                        </Box>

                                        <PlanLimitCard
                                            icon={<ScheduleIcon color="primary" />}
                                            title="Maximum Transfer Lifetime"
                                            value={
                                                role === "premium"
                                                    ? config.max_lifetime_connected_premium
                                                    : config.max_lifetime_connected
                                            }
                                            unit="Days"
                                        />
                                    </Stack>

                                    <Stack spacing={3}>
                                        <Typography variant="h6">Per Transfer Limits</Typography>

                                        <PlanLimitCard
                                            icon={<StorageIcon color="primary" />}
                                            title="Maximum File Size"
                                            value={
                                                role === "premium"
                                                    ? formatSize(config.max_file_size_connected_premium)
                                                    : formatSize(config.max_file_size_connected)
                                            }
                                        />

                                        <PlanLimitCard
                                            icon={<DownloadIcon color="primary" />}
                                            title="Maximum Downloads"
                                            value={
                                                role === "premium"
                                                    ? config.max_downloads_connected_premium
                                                    : config.max_downloads_connected
                                            }
                                            unit="downloads"
                                        />
                                    </Stack>
                                </Box>
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
                            <Button sx={{ mt: 2, maxWidth: 200 }} size="small" variant="contained" startIcon={<RefreshIcon />} onClick={handleRotateKeys}>
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
                            <Button sx={{ mt: 2, maxWidth: 200 }} size="small" variant="contained" startIcon={<DialpadIcon />} onClick={handleChangePassword}>
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
                            <Button sx={{ mt: 2, maxWidth: 200 }} size="small" color="error" variant="contained" startIcon={<DeleteIcon />} onClick={handleDeleteAccount}>
                                Delete Account
                            </Button>
                        </Box>

                    </ Stack>
                </ Box>
            }
        />
    );
}
