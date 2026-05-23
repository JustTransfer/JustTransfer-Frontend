import React from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { Box, Typography, Button, Chip } from "@mui/material";

import UploadIcon from '@mui/icons-material/Upload';
import LinkIcon from '@mui/icons-material/Link';
import DownloadIcon from '@mui/icons-material/Download';

import { useServerConfig } from "../hooks/useServerConfig";
import Layout from "../components/layout";
import { sendMessageAnonymous } from "../handlers/crypto_anonymous";
import { formatSize } from "../handlers/utils";

import FileTransferFormSelect from "../components/FileTransferFormSelect";

export default function HomePage() {
    const navigate = useNavigate();
    const { config } = useServerConfig();

    const maxWidthPage = 1400;
    const sectionPaddingX = { xs: 2, md: 4 };

    const anonymousLimits = {
        maxFileSize: config?.max_file_size_anonymous || 0,
        maxDownloads: config?.max_downloads_anonymous || 0,
        maxLifetime: config?.max_lifetime_anonymous || 0,
    };

    const connectedLimits = {
        maxFileSize: config?.max_file_size_connected || 0,
        maxDownloads: config?.max_downloads_connected || 0,
        maxLifetime: config?.max_lifetime_connected || 0,
    };

    const premiumLimits = {
        maxFileSize: config?.max_file_size_connected_premium || 0,
        maxDownloads: config?.max_downloads_connected_premium || 0,
        maxLifetime: config?.max_lifetime_connected_premium || 0,
    };

    return (
        <Layout title="Home" content={
            <Box
                sx={{
                    flex: 1,
                    width: "100%",
                    backgroundColor: "transparent",
                    display: "flex",
                    flexDirection: "column",
                    gap: { xs: 3, md: 4 },
                    py: { xs: 3, md: 0 },
                }}
            >
                <Box
                    sx={{
                        mx: "auto",
                        width: "100%",
                        maxWidth: maxWidthPage,
                        borderRadius: 4,
                        overflow: "hidden",
                        boxShadow: "0 18px 40px rgba(83, 24, 60, 0.12)",
                        px: sectionPaddingX,
                        pt: { xs: 6, md: 6 },
                        pb: { xs: 6, md: 6 },
                        background: "radial-gradient(1200px 500px at 15% -10%, #ffa6da 0%, #fff7fb 45%, #ffffff 100%)",
                    }}
                >
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: { xs: "1fr", md: "1.1fr 0.9fr" },
                            gap: { xs: 4, md: 6 },
                            alignItems: "center",
                        }}
                    >
                        <Box>
                            <Typography
                                variant="h3"
                                sx={{
                                    fontWeight: 700,
                                    letterSpacing: "-0.02em",
                                    mb: 2,
                                    color: "#2b0f1f",
                                }}
                            >
                                Send large files securely - no compromises.
                            </Typography>
                            <Typography variant="body1" sx={{ color: "#5a4454", mb: 3, maxWidth: 520 }}>
                                Anonymous transfers up to {formatSize(anonymousLimits.maxFileSize)} with {anonymousLimits.maxDownloads} downloads and {anonymousLimits.maxLifetime}-day expiry. Share a secure link in seconds.
                            </Typography>
                            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 3 }}>
                                <Chip label="No account needed" size="small" />
                                <Chip label="End-to-end encryption" size="small" />
                                <Chip label="Auto-delete" size="small" />
                            </Box>
                            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                                <Button variant="contained" href="#how-it-works">
                                    See how it works
                                </Button>
                                <Button variant="outlined" onClick={() => navigate("/login")}>
                                    Login for direct transfer
                                </Button>
                            </Box>
                        </Box>

                        <Box
                            id="transfer-form"
                            sx={{
                                backgroundColor: "#ffffff",
                                borderRadius: 3,
                                p: { xs: 2.5, md: 3 },
                                boxShadow: "0 24px 60px rgba(119, 41, 93, 0.15)",
                                border: "1px solid #f0dbea",
                            }}
                        >
                            <FileTransferFormSelect
                                type="anonymous"
                                showIntro={false}
                                propsLink={{
                                    maxFileSize: anonymousLimits.maxFileSize,
                                    maxDownloads: anonymousLimits.maxDownloads,
                                    maxLifetime: anonymousLimits.maxLifetime,
                                    onSubmit: async (data, onProgress) => {
                                        const result = await sendMessageAnonymous(
                                            data.password,
                                            data.file.name,
                                            data.file,
                                            data.lifetime,
                                            data.maxDownloads,
                                            onProgress
                                        );
                                        return result.link;
                                    },
                                }}
                                propsDirect={{
                                    // still required by the type, even if unused
                                    maxFileSize: 0,
                                    maxDownloads: 0,
                                    maxLifetime: 0,
                                    onSubmit: async () => { },
                                }}
                            />
                            <Typography variant="body2" sx={{ color: "#7a6474", mt: 2 }}>
                                Direct transfers require an account. <RouterLink to="/register">Create an account</RouterLink> or <RouterLink to="/login">log in</RouterLink>.
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                <Box
                    id="how-it-works"
                    sx={{
                        width: "100%",
                        maxWidth: maxWidthPage,
                        mx: "auto",
                        py: 9,
                        px: sectionPaddingX,
                        backgroundColor: "#ffffff",
                        borderRadius: 4,
                        border: "1px solid #f1e7ee",
                        boxShadow: "0 18px 40px rgba(83, 24, 60, 0.08)",
                    }}
                >
                    <Box sx={{ maxWidth: maxWidthPage, mx: "auto", textAlign: "center", mb: 6 }}>
                        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                            How a secure transfer works
                        </Typography>
                        <Typography variant="body1" sx={{ color: "#7a6474", fontSize: "1.05rem" }}>
                            Upload, share a link, and download with your password.
                        </Typography>
                    </Box>
                    <Box sx={{ maxWidth: maxWidthPage, mx: "auto", display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: 3.5 }}>
                        <Box sx={{ p: 4, borderRadius: 4, border: "1px solid #f1e7ee", backgroundColor: "#ffffff" }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2.5 }}>
                                <Box sx={{ width: 46, height: 46, borderRadius: "50%", backgroundColor: "#fbe3f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <UploadIcon color="primary" sx={{ fontSize: 24 }} />
                                </Box>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>1. Upload</Typography>
                            </Box>
                            <Typography variant="body1" color="text.secondary" sx={{ fontSize: "1.02rem" }}>
                                Select a file and add a password for encryption.
                            </Typography>
                        </Box>
                        <Box sx={{ p: 4, borderRadius: 4, border: "1px solid #f1e7ee", backgroundColor: "#ffffff" }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2.5 }}>
                                <Box sx={{ width: 46, height: 46, borderRadius: "50%", backgroundColor: "#fbe3f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <LinkIcon color="primary" sx={{ fontSize: 24 }} />
                                </Box>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>2. Share</Typography>
                            </Box>
                            <Typography variant="body1" color="text.secondary" sx={{ fontSize: "1.02rem" }}>
                                Share the encrypted link with anyone.
                            </Typography>
                        </Box>
                        <Box sx={{ p: 4, borderRadius: 4, border: "1px solid #f1e7ee", backgroundColor: "#ffffff" }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2.5 }}>
                                <Box sx={{ width: 46, height: 46, borderRadius: "50%", backgroundColor: "#fbe3f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <DownloadIcon color="primary" sx={{ fontSize: 24 }} />
                                </Box>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>3. Download</Typography>
                            </Box>
                            <Typography variant="body1" color="text.secondary" sx={{ fontSize: "1.02rem" }}>
                                Recipients unlock the file using your password.
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                <Box
                    sx={{
                        width: "100%",
                        maxWidth: maxWidthPage,
                        mx: "auto",
                        py: 8,
                        px: sectionPaddingX,
                        backgroundColor: "#fff7fb",
                        borderRadius: 4,
                        border: "1px solid #f1e7ee",
                        boxShadow: "0 18px 40px rgba(83, 24, 60, 0.08)",
                    }}
                >
                    <Box sx={{ textAlign: "center", mb: 4 }}>
                        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                            Built-in privacy protections
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#7a6474" }}>
                            Encryption, anonymous sharing, and automatic expiry are always on.
                        </Typography>
                    </Box>
                    <Box
                        sx={{
                            maxWidth: maxWidthPage,
                            mx: "auto",
                            p: { xs: 3, md: 4 },
                            borderRadius: 4,
                            border: "1px solid #eac9dc",
                            background: "linear-gradient(135deg, #ffffff 0%, #fff0f8 100%)",
                            boxShadow: "0 18px 50px rgba(83, 24, 60, 0.14)",
                        }}
                    >
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2, mb: 3 }}>
                            <Box>
                                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>Encrypted by default</Typography>
                                <Typography variant="body1" sx={{ color: "#5a4454", mb: 2 }}>
                                    Files are encrypted on your device before they leave it.
                                </Typography>
                            </Box>
                            <Button
                                variant="outlined"
                                href="https://justtransfer.github.io/"
                                target="_blank"
                                rel="noreferrer"
                                sx={{
                                    borderColor: "#c992b6",
                                    color: "#7b1451",
                                    backgroundColor: "#fff",
                                    px: 2.5,
                                    py: 1,
                                    fontWeight: 700,
                                    boxShadow: "0 10px 26px rgba(83, 24, 60, 0.12)",
                                    "&:hover": { borderColor: "#b57aa1", backgroundColor: "#fff7fb" },
                                }}
                            >
                                Read the whitepaper
                            </Button>
                        </Box>
                        <Box sx={{ display: "grid", gap: 2 }}>
                            <Box sx={{ display: "flex", gap: 2 }}>
                                <Box sx={{ color: "primary.main", fontWeight: 700 }}>✓</Box>
                                <Box>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>End-to-end encryption</Typography>
                                    <Typography variant="body2" color="text.secondary">Files are encrypted on your device.</Typography>
                                </Box>
                            </Box>
                            <Box sx={{ display: "flex", gap: 2 }}>
                                <Box sx={{ color: "primary.main", fontWeight: 700 }}>✓</Box>
                                <Box>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>No account required</Typography>
                                    <Typography variant="body2" color="text.secondary">Share anonymously with a simple link.</Typography>
                                </Box>
                            </Box>
                            <Box sx={{ display: "flex", gap: 2 }}>
                                <Box sx={{ color: "primary.main", fontWeight: 700 }}>✓</Box>
                                <Box>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Auto-deletion</Typography>
                                    <Typography variant="body2" color="text.secondary">Links expire after your chosen lifetime.</Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </Box>

                <Box
                    sx={{
                        width: "100%",
                        maxWidth: maxWidthPage,
                        mx: "auto",
                        py: 8,
                        px: sectionPaddingX,
                        backgroundColor: "#ffffff",
                        borderRadius: 4,
                        border: "1px solid #f1e7ee",
                        boxShadow: "0 18px 40px rgba(83, 24, 60, 0.08)",
                    }}
                >
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 4, textAlign: "center" }}>
                        Choose your transfer style
                    </Typography>
                    <Box sx={{ maxWidth: maxWidthPage, mx: "auto", display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" }, gap: 3 }}>
                        <Box sx={{ p: 3.5, borderRadius: 4, border: "1px solid #e3c3d6", background: "linear-gradient(135deg, #ffffff 0%, #ffeef7 100%)", boxShadow: "0 18px 48px rgba(83, 24, 60, 0.16)" }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: "primary.main" }}>
                                Link transfer
                            </Typography>
                            <Typography variant="body2" sx={{ color: "#6e5a69", mb: 2 }}>
                                Share a secure link with password protection and download limits.
                            </Typography>
                            <Typography variant="body2" color="text.secondary">Best for quick, anonymous sharing.</Typography>
                        </Box>
                        <Box sx={{ p: 3.5, borderRadius: 4, border: "1px solid #cf9fbe", background: "linear-gradient(135deg, #ffe2f2 0%, #ffffff 100%)", boxShadow: "0 22px 60px rgba(83, 24, 60, 0.2)" }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: "primary.main" }}>
                                Direct transfer
                            </Typography>
                            <Typography variant="body2" sx={{ color: "#6e5a69", mb: 2 }}>
                                Send directly to users with notifications and transfer history.
                            </Typography>
                            <Button size="small" variant="outlined" onClick={() => navigate("/login")}>
                                Login to use direct transfer
                            </Button>
                        </Box>
                    </Box>
                </Box>

                <Box
                    sx={{
                        width: "100%",
                        maxWidth: maxWidthPage,
                        mx: "auto",
                        py: 8,
                        px: sectionPaddingX,
                        backgroundColor: "#fff7fb",
                        borderRadius: 4,
                        border: "1px solid #f1e7ee",
                        boxShadow: "0 18px 40px rgba(83, 24, 60, 0.08)",
                    }}
                >
                    <Box sx={{ textAlign: "center", mb: 4 }}>
                        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                            Plans and pricing
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#7a6474" }}>
                            Free link transfers today. Premium plans launch soon.
                        </Typography>
                    </Box>
                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(4, 1fr)" }, gap: 2, maxWidth: maxWidthPage, mx: "auto" }}>
                        <Box sx={{ p: 3.5, border: "1px solid #dfbcd1", borderRadius: 4, textAlign: "center", background: "linear-gradient(160deg, #ffffff 0%, #ffedf7 100%)", boxShadow: "0 18px 46px rgba(83, 24, 60, 0.16)" }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Link Transfer</Typography>
                            <Typography variant="h4" sx={{ color: "primary.main", fontWeight: 700, mb: 2 }}>$0</Typography>
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2, minHeight: 120 }}>
                                <Typography variant="body2">✓ {formatSize(anonymousLimits.maxFileSize)} max file size</Typography>
                                <Typography variant="body2">✓ {anonymousLimits.maxLifetime} day storage</Typography>
                                <Typography variant="body2">✓ {anonymousLimits.maxDownloads} max downloads per transfer</Typography>
                            </Box>
                            <Button variant="outlined" fullWidth size="small" href="#transfer-form">
                                Get Started
                            </Button>
                        </Box>

                        <Box sx={{ p: 3.5, border: "1px solid #dfbcd1", borderRadius: 4, textAlign: "center", background: "linear-gradient(160deg, #ffffff 0%, #ffedf7 100%)", boxShadow: "0 18px 46px rgba(83, 24, 60, 0.16)" }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Starter</Typography>
                            <Typography variant="h4" sx={{ color: "primary.main", fontWeight: 700, mb: 2 }}>$0</Typography>
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2, minHeight: 120 }}>
                                <Typography variant="body2">✓ {formatSize(connectedLimits.maxFileSize)} max file size</Typography>
                                <Typography variant="body2">✓ {connectedLimits.maxLifetime} day storage</Typography>
                                <Typography variant="body2">✓ {connectedLimits.maxDownloads} max downloads per transfer</Typography>
                            </Box>
                            <Button variant="outlined" fullWidth size="small" onClick={() => navigate("/register")}>
                                Get Started
                            </Button>
                        </Box>

                        <Box
                            sx={{
                                p: 3.5,
                                border: "1px solid #c992b6",
                                borderRadius: 4,
                                textAlign: "center",
                                position: "relative",
                                background: "linear-gradient(160deg, #ffd8ee 0%, #ffffff 100%)",
                                boxShadow: "0 24px 64px rgba(83, 24, 60, 0.22)",
                            }}
                        >
                            <Chip label="RECOMMENDED" size="small" sx={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", backgroundColor: "primary.main", color: "white" }} />
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Professional</Typography>
                            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, mb: 2 }}>
                                <Chip label="Launching soon" size="small" color="primary" />
                            </Box>
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2, minHeight: 120 }}>
                                <Typography variant="body2">✓ {formatSize(premiumLimits.maxFileSize)} max file size</Typography>
                                <Typography variant="body2">✓ {premiumLimits.maxLifetime} day storage</Typography>
                                <Typography variant="body2">✓ {premiumLimits.maxDownloads} max downloads per transfer</Typography>
                            </Box>
                            <Button variant="contained" fullWidth size="small" onClick={() => navigate("/register")}>
                                Get Started
                            </Button>
                        </Box>

                        <Box sx={{ p: 3.5, border: "1px solid #dfbcd1", borderRadius: 4, textAlign: "center", background: "linear-gradient(160deg, #ffffff 0%, #ffedf7 100%)", boxShadow: "0 18px 46px rgba(83, 24, 60, 0.16)" }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Enterprise</Typography>
                            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, mb: 2 }}>
                                <Chip label="Launching soon" size="small" color="primary" />
                            </Box>
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2, minHeight: 120 }}>
                                <Typography variant="body2">✓ Priority support</Typography>
                                <Typography variant="body2">✓ Team collaboration</Typography>
                            </Box>
                            <Button variant="outlined" fullWidth size="small" onClick={() => navigate("/contact-sales")}>
                                Contact Sales
                            </Button>
                        </Box>
                    </Box>
                </Box>

                <Box
                    sx={{
                        width: "100%",
                        maxWidth: maxWidthPage,
                        mx: "auto",
                        py: 4,
                        px: sectionPaddingX,
                        background: "linear-gradient(135deg, #3d0b2b 0%, #7b1451 50%, #d02c8b 100%)",
                        borderRadius: 4,
                        border: "1px solid #f1e7ee",
                        boxShadow: "0 18px 40px rgba(83, 24, 60, 0.08)",
                    }}
                >
                    <Box
                        sx={{
                            maxWidth: maxWidthPage,
                            mx: "auto",
                            p: { xs: 3, md: 5 },
                            borderRadius: 4,
                            color: "#fff",
                            textAlign: "center",
                        }}
                    >
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                            Ready to transfer?
                        </Typography>
                        <Typography variant="body1" sx={{ opacity: 0.9, mb: 3 }}>
                            Start a secure link transfer in seconds or create an account for direct transfers.
                        </Typography>
                        <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
                            <Button variant="contained" color="secondary" href="#transfer-form">
                                Get started free
                            </Button>
                            <Button variant="outlined" sx={{ color: "#fff", borderColor: "rgba(255,255,255,0.5)" }} onClick={() => navigate("/register")}>
                                Create account
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Box>
        } />
    );
}
