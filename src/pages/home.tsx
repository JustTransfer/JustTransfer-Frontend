import { useNavigate, Link as RouterLink } from "react-router-dom";
import { Box, Typography, Button, Chip } from "@mui/material";

import UploadIcon from '@mui/icons-material/Upload';
import LinkIcon from '@mui/icons-material/Link';
import DownloadIcon from '@mui/icons-material/Download';

import { useServerConfig } from "../hooks/useServerConfig";
import Layout from "../components/layout";
import { sendMessageAnonymous } from "../handlers/crypto_anonymous";
import { formatSize } from "../handlers/utils";
import Pricing from "../components/Pricing";

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

    /*const connectedLimits = {
        maxFileSize: config?.max_file_size_connected || 0,
        maxDownloads: config?.max_downloads_connected || 0,
        maxLifetime: config?.max_lifetime_connected || 0,
    };

    const premiumLimits = {
        maxFileSize: config?.max_file_size_connected_premium || 0,
        maxDownloads: config?.max_downloads_connected_premium || 0,
        maxLifetime: config?.max_lifetime_connected_premium || 0,
    };*/

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
                        pt: { xs: 6, md: 4 },
                        pb: { xs: 6, md: 4 },
                        background: "radial-gradient(1200px 500px at 15% -10%, #ffa6da 0%, #fff7fb 45%, #ffffff 100%)",
                    }}
                >
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: { xs: "1fr", md: "1.1fr 0.9fr" },
                            gap: { xs: 4, md: 6 },
                            alignItems: "start",
                            ml: 2,
                        }}
                    >
                        <Box
                            sx={{
                                mt: { xs: 0, md: 32 },
                            }}
                        >
                            <Typography
                                variant="h3"
                                sx={{
                                    fontWeight: 700,
                                    letterSpacing: "-0.02em",
                                    mb: 2,
                                    color: "#2b0f1f",
                                }}
                            >
                                Send large files securely
                                <br />
                                - no compromises.
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
                                <Button
                                    variant="contained"
                                    onClick={() => {
                                        document.getElementById("how-it-works")?.scrollIntoView({
                                            behavior: "smooth",
                                            block: "start",
                                        });
                                    }}
                                >
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
                                p: { xs: 2.5, md: 2 },
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
                                            data.file.name,
                                            data.file,
                                            data.lifetime,
                                            data.maxDownloads,
                                            data.password,
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
                            <Typography variant="body2" sx={{ color: "#7a6474", mt: 2, textAlign: "center" }}>
                                Direct transfers require an account. <RouterLink to="/register">Create an account</RouterLink> or <RouterLink to="/login">log in</RouterLink>.
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {/* How it works section */}
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

                {/* Privacy section */}
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
                        position: "relative",
                        overflow: "hidden",
                        "&::before": {
                            content: '""',
                            position: "absolute",
                            width: 320,
                            height: 320,
                            borderRadius: "50%",
                            background: "radial-gradient(circle, rgba(255, 168, 214, 0.32) 0%, rgba(255, 168, 214, 0) 70%)",
                            top: -120,
                            right: -140,
                        },
                        "&::after": {
                            content: '""',
                            position: "absolute",
                            width: 260,
                            height: 260,
                            borderRadius: "50%",
                            background: "radial-gradient(circle, rgba(255, 214, 240, 0.45) 0%, rgba(255, 214, 240, 0) 70%)",
                            bottom: -140,
                            left: -120,
                        },
                    }}
                >
                    <Box
                        sx={{
                            position: "relative",
                            zIndex: 1,
                            maxWidth: maxWidthPage,
                            mx: "auto",
                            display: "grid",
                            gridTemplateColumns: { xs: "1fr", md: "1.05fr 0.95fr" },
                            gap: { xs: 4, md: 6 },
                            alignItems: "center",
                        }}
                    >
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1.5, color: "#2b0f1f" }}>
                                Built-in privacy protections
                            </Typography>
                            <Typography variant="body1" sx={{ color: "#6f5164", mb: 3 }}>
                                Zero-knowledge encryption, anonymous sharing, and automatic expiry keep your data private from upload to download.
                            </Typography>
                            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mb: 3 }}>
                                <Chip label="No tracking" size="small" sx={{ backgroundColor: "#fff", border: "1px solid #ebc7dc" }} />
                                <Chip label="Client-side encryption" size="small" sx={{ backgroundColor: "#fff", border: "1px solid #ebc7dc" }} />
                                <Chip label="Expiry controls" size="small" sx={{ backgroundColor: "#fff", border: "1px solid #ebc7dc" }} />
                            </Box>
                            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                                <Button
                                    variant="contained"
                                    href="https://justtransfer.github.io/"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    Read the whitepaper
                                </Button>
                                <Button
                                    variant="outlined"
                                    href="https://github.com/JustTransfer/"
                                    target="_blank"
                                >
                                    View on GitHub
                                </Button>
                            </Box>
                        </Box>

                        <Box
                            sx={{
                                p: { xs: 2.5, md: 3 },
                                borderRadius: 4,
                                border: "1px solid #eac9dc",
                                background: "linear-gradient(135deg, #ffffff 0%, #fff0f8 100%)",
                                boxShadow: "0 18px 50px rgba(83, 24, 60, 0.14)",
                            }}
                        >
                            <Box
                                sx={{
                                    display: "grid",
                                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                                    gap: 2,
                                }}
                            >
                                {[
                                    {
                                        title: "End-to-end encryption",
                                        body: "Files are encrypted on your device before upload.",
                                    },
                                    {
                                        title: "No account required",
                                        body: "Share anonymously with a simple link.",
                                    },
                                    {
                                        title: "Auto-deletion",
                                        body: "Links expire after your chosen lifetime or download limit.",
                                    },
                                    {
                                        title: "Open source",
                                        body: "Our code is public and auditable.",
                                    },
                                ].map((item) => (
                                    <Box
                                        key={item.title}
                                        sx={{
                                            p: 2,
                                            borderRadius: 3,
                                            border: "1px solid #f0d6e6",
                                            backgroundColor: "#ffffff",
                                            display: "flex",
                                            gap: 1.5,
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: 34,
                                                height: 34,
                                                borderRadius: "50%",
                                                backgroundColor: "#fbe3f0",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                color: "#7b1451",
                                                fontWeight: 700,
                                                flexShrink: 0,
                                            }}
                                        >
                                            ✓
                                        </Box>
                                        <Box>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#2b0f1f" }}>
                                                {item.title}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: "#6f5164" }}>
                                                {item.body}
                                            </Typography>
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    </Box>
                </Box>

                {/* Link vs Direct transfer section */}
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
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, textAlign: "center" }}>
                        Choose your transfer style
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{ color: "#7a6474", mb: 5, textAlign: "center", maxWidth: 520, mx: "auto" }}
                    >
                        Compare the experience and who each flow is built for.
                    </Typography>
                    <Box sx={{ maxWidth: maxWidthPage, mx: "auto", display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" }, gap: 3 }}>
                        <Box sx={{ p: 3.5, borderRadius: 4, border: "1px solid #e3c3d6", background: "linear-gradient(135deg, #ffffff 0%, #ffeef7 100%)", boxShadow: "0 18px 48px rgba(83, 24, 60, 0.16)" }}>
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "primary.main" }}>
                                    Link transfer
                                </Typography>
                                <Chip label="No account" size="small" sx={{ backgroundColor: "#fff", border: "1px solid #e9cddd" }} />
                            </Box>
                            <Typography variant="body2" sx={{ color: "#6e5a69", mb: 2, maxWidth: { xs: "100%", sm: 360 } }}>
                                Share a secure link with password protection and flexible download settings.
                            </Typography>
                            <Box sx={{ display: "grid", gap: 1.25, mb: 2.5, maxWidth: { xs: "100%", sm: 360 } }}>
                                <Box>
                                    <Typography variant="caption" sx={{ textTransform: "uppercase", letterSpacing: "0.08em", color: "#9a7f8f" }}>
                                        Key features
                                    </Typography>
                                    <Box component="ul" sx={{ color: "#5f4b58", m: 0, pl: 2, display: "grid", gap: 0.6 }}>
                                        <Typography component="li" variant="body2">
                                            Password required
                                        </Typography>
                                        <Typography component="li" variant="body2">
                                            Shareable links
                                        </Typography>
                                        <Typography component="li" variant="body2">
                                            Flexible expiry and download limits
                                        </Typography>
                                        <Typography component="li" variant="body2">
                                            Anonymous sharing
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box>
                                    <Typography variant="caption" sx={{ textTransform: "uppercase", letterSpacing: "0.08em", color: "#9a7f8f" }}>
                                        Best for
                                    </Typography>
                                    <Box component="ul" sx={{ color: "#5f4b58", m: 0, pl: 2, display: "grid", gap: 0.6 }}>
                                        <Typography component="li" variant="body2">
                                            One-to-many sharing
                                        </Typography>
                                        <Typography component="li" variant="body2">
                                            External recipients
                                        </Typography>
                                        <Typography component="li" variant="body2">
                                            Guest transfers
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                            <Button size="small" variant="contained" href="#transfer-form">
                                Start link transfer
                            </Button>
                        </Box>
                        <Box sx={{ p: 3.5, borderRadius: 4, border: "1px solid #cf9fbe", background: "linear-gradient(135deg, #ffe2f2 0%, #ffffff 100%)", boxShadow: "0 22px 60px rgba(83, 24, 60, 0.2)" }}>
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "primary.main" }}>
                                    Direct transfer
                                </Typography>
                                <Chip label="Account required" size="small" sx={{ backgroundColor: "#fff", border: "1px solid #e9cddd" }} />
                            </Box>
                            <Typography variant="body2" sx={{ color: "#6e5a69", mb: 2, maxWidth: { xs: "100%", sm: 360 } }}>
                                Send directly to users without sharing links or passwords.
                            </Typography>
                            <Box sx={{ display: "grid", gap: 1.25, mb: 2.5, maxWidth: { xs: "100%", sm: 360 } }}>
                                <Box>
                                    <Typography variant="caption" sx={{ textTransform: "uppercase", letterSpacing: "0.08em", color: "#9a7f8f" }}>
                                        Features
                                    </Typography>
                                    <Box component="ul" sx={{ color: "#5f4b58", m: 0, pl: 2, display: "grid", gap: 0.6 }}>
                                        <Typography component="li" variant="body2">
                                            No password required
                                        </Typography>
                                        <Typography component="li" variant="body2">
                                            No links - send directly to user accounts
                                        </Typography>
                                        <Typography component="li" variant="body2">
                                            Flexible expiry and download limits
                                        </Typography>
                                        <Typography component="li" variant="body2">
                                            Authenticated sharing
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box>
                                    <Typography variant="caption" sx={{ textTransform: "uppercase", letterSpacing: "0.08em", color: "#9a7f8f" }}>
                                        Best for
                                    </Typography>
                                    <Box component="ul" sx={{ color: "#5f4b58", m: 0, pl: 2, display: "grid", gap: 0.6 }}>
                                        <Typography component="li" variant="body2">
                                            One-to-one sharing
                                        </Typography>
                                        <Typography component="li" variant="body2">
                                            Known recipients
                                        </Typography>
                                        <Typography component="li" variant="body2">
                                            Frequent transfers
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                            <Button size="small" variant="outlined" onClick={() => navigate("/login")}>
                                Login to use direct transfer
                            </Button>
                        </Box>
                    </Box>
                </Box>

                {/* Pricing section */}
                <Pricing isLoggedIn={false} />

                {/* Call to action */}
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
                                Get started
                            </Button>
                            <Button variant="outlined" sx={{ color: "#fff", borderColor: "rgba(255,255,255,0.5)" }} onClick={() => navigate("/register")}>
                                Create account
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Box >
        } />
    );
}
