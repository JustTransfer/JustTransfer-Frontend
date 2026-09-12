import { useNavigate } from "react-router";
import { useState, useEffect } from "react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import UploadIcon from '@mui/icons-material/Upload';
import LinkIcon from '@mui/icons-material/Link';
import DownloadIcon from '@mui/icons-material/Download';
import NoAccountsIcon from '@mui/icons-material/NoAccounts';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

import { useServerConfig } from "../hooks/useServerConfig";
import Layout from "../components/layout";
import { addSavedTransfer } from "../handlers/crypto";
import { sendMessageLink } from "../handlers/crypto_link";
import Pricing from "../components/Pricing";
import Faq from "../components/Faq";
import CompetitorComparison from "../components/CompetitorComparison";
import { useAuth } from "../hooks/useAuth";
import { trackEvent, AnalyticsEvent, bucketFileSize } from "../handlers/analytics";
import { useTranslation } from "react-i18next";

import FileTransferForm from "../components/FileTransferForm";

const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "JustTransfer",
    url: "https://justtransfer.ch",
    logo: "https://justtransfer.ch/JustTransfer.webp",
    description: "Open-source, end-to-end encrypted file transfer service based in Switzerland.",
    sameAs: [
        "https://github.com/JustTransfer/",
    ],
};

export default function HomePage() {
    const { t } = useTranslation("home");
    const navigate = useNavigate();
    const { config } = useServerConfig();
    const { role, exportKey, getLatestKeys } = useAuth();

    const [keys, setKeys] = useState<any>(null);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

    const maxWidthPage = 1400;
    const sectionPaddingX = { xs: 2, md: 4 };

    const maxFileSize = role === "premium" ? config?.max_file_size_connected_premium! : config?.max_file_size_connected!;
    const maxDownloads = role === "premium" ? config?.max_downloads_connected_premium! : config?.max_downloads_connected!;
    const maxLifetime = role === "premium" ? config?.max_lifetime_connected_premium! : config?.max_lifetime_connected!;

    useEffect(() => {
        setIsLoggedIn(!!exportKey);

        const fetchKeys = async () => {
            try {
                const latestKeys = await getLatestKeys();
                setKeys(latestKeys);
            } catch (err) {
                console.error("Failed to fetch latest keys:", err);
            }
        };

        if (exportKey) {
            fetchKeys();
        }
    }, [getLatestKeys]);

    return (
        <Layout
            content={
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
                    <script
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
                    />

                    {/* Hero section */}
                    <Box
                        component="section"
                        aria-labelledby="hero-heading"
                        sx={{
                            mx: "auto",
                            width: "100%",
                            maxWidth: maxWidthPage,
                            borderRadius: 4,
                            overflow: "hidden",
                            boxShadow: "0 18px 40px rgba(83, 24, 60, 0.12)",
                            px: sectionPaddingX,
                            pt: 4,
                            pb: 4,
                            background: "radial-gradient(1200px 500px at 15% -10%, #ffa6da 0%, #fff7fb 45%, #ffffff 100%)",
                        }}
                    >
                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: { xs: "1fr", md: "1.1fr 0.9fr" },
                                gap: { xs: 4, md: 6 },
                                alignItems: "start",
                            }}
                        >
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    mt: { xs: 0, md: 25 },
                                    gap: { xs: 2, md: 3 },
                                }}
                            >
                                <Typography
                                    id="hero-heading"
                                    variant="h1"
                                    component="h1"
                                    sx={{
                                        letterSpacing: "-0.02em",
                                        lineHeight: { xs: 1, md: 1.2 },
                                        color: "#2b0f1f",
                                        fontSize: {
                                            xs: "2.5rem",   // ~h5
                                            sm: "3rem",     // ~h4
                                        },
                                        fontWeight: 700,
                                    }}
                                >
                                    {t("heroTitle")}
                                    <br />
                                    - <Box component="span" sx={{ color: "primary.main" }}> {t("heroAccent")}</Box>
                                </Typography>
                                <Typography variant="body1" sx={{ color: "#5a4454", maxWidth: 520 }}>
                                    {t("heroSubtitle")}
                                </Typography>

                                {/* Feature highlights */}
                                <Box sx={{
                                    display: { xs: "none", sm: "flex" },
                                    gap: 1.25,
                                    flexWrap: "wrap"
                                }}>
                                    {[
                                        { icon: <LockOutlinedIcon sx={{ fontSize: 18 }} />, label: t("encryption") },
                                        { icon: <NoAccountsIcon sx={{ fontSize: 18 }} />, label: t("noAccountNeeded") },
                                        { icon: <Box component="span" sx={{ fontSize: 16, lineHeight: 1 }}>🇨🇭</Box>, label: t("basedSwitzerland") },
                                    ].map((item) => (
                                        <Box
                                            key={item.label}
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 0.75,
                                                px: 1.5,
                                                py: 0.75,
                                                borderRadius: 2,
                                                backgroundColor: "#fbe3f0",
                                            }}
                                        >
                                            {item.icon}
                                            <Typography variant="body2" sx={{ color: "#2b0f1f" }}>
                                                {item.label}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                            </Box>

                            <Box
                                id="transfer-form"
                                sx={{
                                    backgroundColor: "#ffffff",
                                    borderRadius: 3,
                                    p: 2,
                                    boxShadow: "0 24px 60px rgba(119, 41, 93, 0.15)",
                                    border: "1px solid #f0dbea",
                                }}
                            >
                                {config ? (
                                    isLoggedIn ? (
                                        <FileTransferForm
                                            type="connected"
                                            maxFileSize={maxFileSize}
                                            maxDownloads={maxDownloads}
                                            maxLifetime={maxLifetime}
                                            onSubmit={async (data, onProgress) => {
                                                const result = await sendMessageLink(
                                                    data.file.name,
                                                    data.file,
                                                    data.lifetime,
                                                    data.maxDownloads,
                                                    data.isSigned,
                                                    keys.id,
                                                    keys.sign_private_key,
                                                    data.password,
                                                    onProgress,
                                                    data.receiver_email
                                                );

                                                await addSavedTransfer(result.id, result.password, exportKey!, result.auth_key);

                                                trackEvent(AnalyticsEvent.TRANSFER_CREATED, {
                                                    type: "account",
                                                    signed: data.isSigned,
                                                    file_size: bucketFileSize(data.file.size),
                                                    has_recipient_email: !!data.receiver_email,
                                                });

                                                return result.link;
                                            }}
                                        />

                                    ) : (
                                        <FileTransferForm
                                            type="link"
                                            maxFileSize={config.max_file_size_link}
                                            maxDownloads={config.max_downloads_link}
                                            maxLifetime={config.max_lifetime_link}
                                            onSubmit={async (data: any, onProgress: any) => {
                                                const result = await sendMessageLink(
                                                    data.file.name,
                                                    data.file,
                                                    data.lifetime,
                                                    data.maxDownloads,
                                                    false,
                                                    undefined,
                                                    undefined,
                                                    data.password,
                                                    onProgress
                                                );

                                                trackEvent(AnalyticsEvent.TRANSFER_CREATED, {
                                                    type: "guest",
                                                    file_size: bucketFileSize(data.file.size),
                                                });

                                                return result.link;
                                            }}
                                        />
                                    )
                                ) : (
                                    <Box
                                        sx={{
                                            height: "100%",
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            minHeight: 700,
                                        }}
                                    >
                                        <CircularProgress />
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    </Box>

                    {/* How it works section */}
                    <Box
                        component="section"
                        id="how-it-works"
                        aria-labelledby="how-it-works-heading"
                        sx={{
                            width: "100%",
                            maxWidth: maxWidthPage,
                            mx: "auto",
                            py: { xs: 4, md: 6 },
                            px: sectionPaddingX,
                            backgroundColor: "#ffffff",
                            borderRadius: 4,
                            border: "1px solid #f1e7ee",
                            boxShadow: "0 18px 40px rgba(83, 24, 60, 0.08)",
                        }}
                    >
                        <Box sx={{ maxWidth: maxWidthPage, mx: "auto", textAlign: "center", mb: 6 }}>
                            <Typography id="how-it-works-heading" variant="h4" component="h2" sx={{ fontWeight: 700, mb: 1 }}>
                                {t("howTitle")}
                            </Typography>
                            <Typography variant="body1" sx={{ color: "#7a6474", fontSize: "1.05rem" }}>
                                {t("howSubtitle")}
                            </Typography>
                        </Box>
                        <Box sx={{ maxWidth: maxWidthPage, mx: "auto", display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: 3.5 }}>
                            <Box sx={{ p: 4, borderRadius: 4, border: "1px solid #f1e7ee", backgroundColor: "#ffffff" }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2.5 }}>
                                    <Box sx={{ width: 46, height: 46, borderRadius: "50%", backgroundColor: "#fbe3f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <UploadIcon color="primary" sx={{ fontSize: 24 }} />
                                    </Box>
                                    <Typography variant="h6" component="h3" sx={{ fontWeight: 700 }}>{t("upload")}</Typography>
                                </Box>
                                <Typography variant="body1" color="text.secondary" sx={{ fontSize: "1.02rem" }}>
                                    {t("uploadText")}
                                </Typography>
                            </Box>
                            <Box sx={{ p: 4, borderRadius: 4, border: "1px solid #f1e7ee", backgroundColor: "#ffffff" }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2.5 }}>
                                    <Box sx={{ width: 46, height: 46, borderRadius: "50%", backgroundColor: "#fbe3f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <LinkIcon color="primary" sx={{ fontSize: 24 }} />
                                    </Box>
                                    <Typography variant="h6" component="h3" sx={{ fontWeight: 700 }}>{t("share")}</Typography>
                                </Box>
                                <Typography variant="body1" color="text.secondary" sx={{ fontSize: "1.02rem" }}>
                                    {t("shareText")}
                                </Typography>
                            </Box>
                            <Box sx={{ p: 4, borderRadius: 4, border: "1px solid #f1e7ee", backgroundColor: "#ffffff" }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2.5 }}>
                                    <Box sx={{ width: 46, height: 46, borderRadius: "50%", backgroundColor: "#fbe3f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <DownloadIcon color="primary" sx={{ fontSize: 24 }} />
                                    </Box>
                                    <Typography variant="h6" component="h3" sx={{ fontWeight: 700 }}>{t("download")}</Typography>
                                </Box>
                                <Typography variant="body1" color="text.secondary" sx={{ fontSize: "1.02rem" }}>
                                    {t("downloadText")}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>

                    {/* Privacy section */}
                    <Box
                        component="section"
                        aria-labelledby="privacy-heading"
                        sx={{
                            width: "100%",
                            maxWidth: maxWidthPage,
                            mx: "auto",
                            py: { xs: 4, md: 6 },
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
                                <Typography id="privacy-heading" variant="h4" component="h2" sx={{ fontWeight: 700, mb: 1.5, color: "#2b0f1f" }}>
                                    {t("privacyTitle")}
                                </Typography>
                                <Typography variant="body1" sx={{ color: "#6f5164", mb: 3 }}>
                                    {t("privacyText")}
                                </Typography>
                                <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mb: 3 }}>
                                    <Chip label={t("noTracking")} size="small" sx={{ backgroundColor: "#fff", border: "1px solid #ebc7dc" }} />
                                    <Chip label={t("clientEncryption")} size="small" sx={{ backgroundColor: "#fff", border: "1px solid #ebc7dc" }} />
                                    <Chip label={t("expiryControls")} size="small" sx={{ backgroundColor: "#fff", border: "1px solid #ebc7dc" }} />
                                </Box>
                                <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                                    <Button
                                        variant="contained"
                                        href="https://justtransfer.github.io/"
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        {t("readWhitepaper")}
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        href="https://github.com/JustTransfer/"
                                        target="_blank"
                                    >
                                        {t("viewGithub")}
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
                                            title: t("encryption"),
                                            body: t("uploadText"),
                                        },
                                        {
                                            title: t("noAccountNeeded"),
                                            body: t("guestText"),
                                        },
                                        {
                                            title: t("autoDeletion"),
                                            body: t("autoDeletionText"),
                                        },
                                        {
                                            title: t("openSource"),
                                            body: t("openSourceText"),
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
                                                <Typography variant="subtitle2" component="h3" sx={{ fontWeight: 700, color: "#2b0f1f" }}>
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

                    {/* Guest vs Account section */}
                    <Box
                        component="section"
                        aria-labelledby="guest-vs-account-heading"
                        sx={{
                            width: "100%",
                            maxWidth: maxWidthPage,
                            mx: "auto",
                            py: { xs: 4, md: 6 },
                            px: sectionPaddingX,
                            backgroundColor: "#ffffff",
                            borderRadius: 4,
                            border: "1px solid #f1e7ee",
                            boxShadow: "0 18px 40px rgba(83, 24, 60, 0.08)",
                        }}
                    >
                        <Typography id="guest-vs-account-heading" variant="h4" component="h2" sx={{ fontWeight: 700, mb: 1, textAlign: "center" }}>
                            {t("guestTitle")}
                        </Typography>
                        <Typography
                            variant="body1"
                            sx={{ color: "#7a6474", mb: 5, textAlign: "center", maxWidth: 520, mx: "auto" }}
                        >
                            {t("guestSubtitle")}
                        </Typography>
                        <Box sx={{ maxWidth: maxWidthPage, mx: "auto", display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" }, gap: 3 }}>
                            <Box sx={{ p: 3.5, borderRadius: 4, border: "1px solid #e3c3d6", background: "linear-gradient(135deg, #ffffff 0%, #ffeef7 100%)", boxShadow: "0 18px 48px rgba(83, 24, 60, 0.16)" }}>
                                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                                    <Typography variant="subtitle1" component="h3" sx={{ fontWeight: 700, color: "primary.main" }}>
                                        {t("guestTransfer")}
                                    </Typography>
                                    <Chip label={t("noAccount")} size="small" sx={{ backgroundColor: "#fff", border: "1px solid #e9cddd" }} />
                                </Box>
                                <Typography variant="body2" sx={{ color: "#6e5a69", mb: 2, maxWidth: { xs: "100%", sm: 360 } }}>
                                    {t("guestText")}
                                </Typography>
                                <Box sx={{ display: "grid", gap: 1.25, mb: 2.5, maxWidth: { xs: "100%", sm: 360 } }}>
                                    <Box>
                                        <Typography variant="caption" sx={{ textTransform: "uppercase", letterSpacing: "0.08em", color: "#9a7f8f" }}>
                                            {t("included")}
                                        </Typography>
                                        <Box component="ul" sx={{ color: "#5f4b58", m: 0, pl: 2, display: "grid", gap: 0.6 }}>
                                            <Typography component="li" variant="body2">{t("guestFeatures.0")}</Typography>
                                            <Typography component="li" variant="body2">{t("guestFeatures.1")}</Typography>
                                            <Typography component="li" variant="body2">{t("guestFeatures.2")}</Typography>
                                        </Box>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" sx={{ textTransform: "uppercase", letterSpacing: "0.08em", color: "#9a7f8f" }}>
                                            {t("bestFor")}
                                        </Typography>
                                        <Box component="ul" sx={{ color: "#5f4b58", m: 0, pl: 2, display: "grid", gap: 0.6 }}>
                                            <Typography component="li" variant="body2">{t("guestBest.0")}</Typography>
                                            <Typography component="li" variant="body2">{t("guestBest.1")}</Typography>
                                        </Box>
                                    </Box>
                                </Box>
                                <Button size="small" variant="contained" href="#transfer-form">
                                    {t("startTransfer")}
                                </Button>
                            </Box>
                            <Box sx={{ p: 3.5, borderRadius: 4, border: "1px solid #cf9fbe", background: "linear-gradient(135deg, #ffe2f2 0%, #ffffff 100%)", boxShadow: "0 22px 60px rgba(83, 24, 60, 0.2)" }}>
                                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                                    <Typography variant="subtitle1" component="h3" sx={{ fontWeight: 700, color: "primary.main" }}>
                                        {t("accountTransfer")}
                                    </Typography>
                                    <Chip label={t("account")} size="small" sx={{ backgroundColor: "#fff", border: "1px solid #e9cddd" }} />
                                </Box>
                                <Typography variant="body2" sx={{ color: "#6e5a69", mb: 2, maxWidth: { xs: "100%", sm: 360 } }}>
                                    {t("accountText")}
                                </Typography>
                                <Box sx={{ display: "grid", gap: 1.25, mb: 2.5, maxWidth: { xs: "100%", sm: 360 } }}>
                                    <Box>
                                        <Typography variant="caption" sx={{ textTransform: "uppercase", letterSpacing: "0.08em", color: "#9a7f8f" }}>
                                            {t("included")}
                                        </Typography>
                                        <Box component="ul" sx={{ color: "#5f4b58", m: 0, pl: 2, display: "grid", gap: 0.6 }}>
                                            <Typography component="li" variant="body2">{t("accountFeatures.0")}</Typography>
                                            <Typography component="li" variant="body2">{t("accountFeatures.1")}</Typography>
                                            <Typography component="li" variant="body2">{t("accountFeatures.2")}</Typography>
                                            <Typography component="li" variant="body2">{t("accountFeatures.3")}</Typography>
                                        </Box>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" sx={{ textTransform: "uppercase", letterSpacing: "0.08em", color: "#9a7f8f" }}>
                                            {t("bestFor")}
                                        </Typography>
                                        <Box component="ul" sx={{ color: "#5f4b58", m: 0, pl: 2, display: "grid", gap: 0.6 }}>
                                            <Typography component="li" variant="body2">{t("accountBest.0")}</Typography>
                                            <Typography component="li" variant="body2">{t("accountBest.1")}</Typography>
                                        </Box>
                                    </Box>
                                </Box>
                                <Button size="small" variant="outlined" onClick={() => navigate("/register")}>
                                    {t("createFreeAccount")}
                                </Button>
                            </Box>
                        </Box>
                    </Box>

                    {/* Pricing section */}
                    <Box component="section" aria-labelledby="pricing-heading">
                        <Pricing isLoggedIn={false} headingId="pricing-heading" />
                    </Box>

                    {/* Comparison table */}
                    <Box component="section" aria-labelledby="comparison-heading">
                        <CompetitorComparison headingId="comparison-heading" />
                    </Box>

                    {/* FAQ */}
                    <Box component="section" aria-labelledby="faq-heading">
                        <Faq headingId="faq-heading" />
                    </Box>

                    {/* Call to action */}
                    <Box
                        component="section"
                        aria-labelledby="cta-heading"
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
                            <Typography id="cta-heading" variant="h5" component="h2" sx={{ fontWeight: 700, mb: 1 }}>
                                {t("ctaTitle")}
                            </Typography>
                            <Typography variant="body1" sx={{ opacity: 0.9, mb: 3 }}>
                                {t("ctaText")}
                            </Typography>
                            <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
                                <Button variant="contained" color="secondary" href="#transfer-form">
                                    {t("getStarted")}
                                </Button>
                                <Button variant="outlined" sx={{ color: "#fff", borderColor: "rgba(255,255,255,0.5)" }} onClick={() => navigate("/register")}>
                                    {t("createAccount")}
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            } />
    );
}