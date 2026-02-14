import {
    Box,
    Typography,
    Button,
    Stack,
    Divider
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import DialpadIcon from "@mui/icons-material/Dialpad";

import Layout from "../components/layout";

export default function AccountPage() {
    return (
        <Layout
            title="Account Settings"
            content={
                <Box sx={{ py: 6, px: 20 }}>
                    <Stack spacing={4} sx={{ width: "100%" }}>

                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            <Typography variant="h5">
                                Account Information
                            </Typography>
                            <Typography variant="body2" color="text.primary" sx={{ mt: 1 }}>
                                Username: TODO
                            </Typography>
                            <Typography variant="body2" color="text.primary" sx={{ mt: 1 }}>
                                Email Address: TODO
                            </Typography>
                            <Typography variant="body2" color="text.primary" sx={{ mt: 1 }}>
                                Account status: TODO
                            </Typography>
                        </Box>

                        <Divider />

                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            <Typography variant="h5">
                                Rotate Keys
                            </Typography>
                            <Typography variant="body2" color="text.primary" sx={{ mt: 1 }}>
                                Generate new encryption and signing keys.
                            </Typography>
                            <Button sx={{ mt: 2, maxWidth: 200 }} size="small" variant="contained" startIcon={<RefreshIcon />}>
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
                            <Button sx={{ mt: 2, maxWidth: 200 }} size="small" variant="contained" startIcon={<DialpadIcon />}>
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
                            <Button sx={{ mt: 2, maxWidth: 200 }} size="small" color="error" variant="contained" startIcon={<DeleteIcon />}>
                                Delete Account
                            </Button>
                        </Box>

                    </ Stack>
                </ Box>
            }
        />
    );
}
