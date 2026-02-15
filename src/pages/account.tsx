import { useEffect, useState } from "react";
import { Box, Typography, Button, Stack, Divider, Avatar } from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import DialpadIcon from "@mui/icons-material/Dialpad";

import { useNotification } from "../hooks/useNotificationContext";
import Layout from "../components/layout";
import { getAccountInfoAPI } from "../handlers/api";

export default function AccountPage() {

    const { success, error } = useNotification();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("");

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
