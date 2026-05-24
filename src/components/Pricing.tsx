import { useNavigate } from "react-router-dom";

import { Box, Typography, Button, Stack, Divider, Avatar, Card, CardContent, LinearProgress, Grid, Chip } from "@mui/material";

import { useServerConfig } from "../hooks/useServerConfig";
import { formatSize } from "../handlers/utils";
import { emailAddress } from "../handlers/config";


export default function Pricing({ isLoggedIn }: { isLoggedIn: boolean }) {

    const navigate = useNavigate();
    const { config } = useServerConfig();

    const buttonText = isLoggedIn ? "Upgrade Account" : "Get Started";
    const buttonAction = isLoggedIn ? () => navigate("/account") : () => navigate("/register");

    const isLoadingLimits = !config;

    const maxWidthPage = 1400;
    const sectionPaddingX = { xs: 2, md: 4 };

    const priceRowSx = {
        minHeight: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    };

    const normalTileSx = {
        p: 3.5,
        border: "1px solid #dfbcd1",
        borderRadius: 4,
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "linear-gradient(160deg, #ffffff 0%, #ffedf7 100%)",
        boxShadow: "0 18px 46px rgba(83, 24, 60, 0.16)"
    };

    const highlightedTileSx = {
        ...normalTileSx,
        position: "relative",
        border: "1px solid #c992b6",
        background: "linear-gradient(160deg, #ffd8ee 0%, #ffffff 100%)",
        boxShadow: "0 24px 64px rgba(83, 24, 60, 0.22)",
    };

    const anonymousLimits = {
        maxFileSize: config?.max_file_size_anonymous,
        maxDownloads: config?.max_downloads_anonymous,
        maxLifetime: config?.max_lifetime_anonymous,
    };

    const connectedLimits = {
        price: config?.price_connected,
        maxFileSize: config?.max_file_size_connected,
        maxDownloads: config?.max_downloads_connected,
        maxLifetime: config?.max_lifetime_connected,
    };

    const premiumLimits = {
        price: config?.price_premium,
        maxFileSize: config?.max_file_size_connected_premium,
        maxDownloads: config?.max_downloads_connected_premium,
        maxLifetime: config?.max_lifetime_connected_premium,
    };

    const renderLimitValue = (value: number | undefined, formatter?: (value: number) => string) => {
        if (isLoadingLimits || value === undefined) {
            return "...";
        }

        return formatter ? formatter(value) : value;
    };

    return (
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
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "repeat(4, 1fr)" },
                    gap: 2,
                    maxWidth: maxWidthPage,
                    mx: "auto",
                    mb: 2,
                }}
            >
                <Box
                    sx={normalTileSx}
                >
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1, flexGrow: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>Link Transfer</Typography>
                        <Box sx={priceRowSx}>
                            <Typography variant="h4" sx={{ color: "primary.main", fontWeight: 700 }}>
                                Free
                            </Typography>
                        </Box>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, minHeight: 120 }}>
                            <Typography variant="body2">Transfer files up to {renderLimitValue(anonymousLimits.maxFileSize, formatSize)}</Typography>
                            <Typography variant="body2">Files available for {renderLimitValue(anonymousLimits.maxLifetime)} days</Typography>
                            <Typography variant="body2">Up to {renderLimitValue(anonymousLimits.maxDownloads)} downloads per transfer</Typography>
                        </Box>
                    </Box>
                    <Button variant="outlined" fullWidth size="small" onClick={buttonAction} sx={{ mt: "auto" }}>
                        {buttonText}
                    </Button>
                </Box>

                <Box
                    sx={normalTileSx}
                >
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1, flexGrow: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>Starter</Typography>
                        <Box sx={priceRowSx}>
                            <Typography variant="h4" sx={{ color: "primary.main", fontWeight: 700 }}>
                                {renderLimitValue(connectedLimits.price)} CHF / month
                            </Typography>
                        </Box>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, minHeight: 120 }}>
                            <Typography variant="body2">Transfer files up to {renderLimitValue(connectedLimits.maxFileSize, formatSize)}</Typography>
                            <Typography variant="body2">Files available for {renderLimitValue(connectedLimits.maxLifetime)} days</Typography>
                            <Typography variant="body2">Up to {renderLimitValue(connectedLimits.maxDownloads)} downloads per transfer</Typography>
                        </Box>
                    </Box>
                    <Button variant="contained" fullWidth size="small" onClick={buttonAction} sx={{ mt: "auto" }}>
                        {buttonText}
                    </Button>
                </Box>

                <Box
                    sx={highlightedTileSx}
                >
                    <Chip label="RECOMMENDED" size="small" sx={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", backgroundColor: "primary.main", color: "white" }} />
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1, flexGrow: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>Professional</Typography>
                        <Box sx={priceRowSx}>
                            <Typography variant="h4" sx={{ color: "primary.main", fontWeight: 700 }}>
                                {renderLimitValue(premiumLimits.price)} CHF / month
                            </Typography>
                        </Box>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, minHeight: 120 }}>
                            <Typography variant="body2">Transfer files up to {renderLimitValue(premiumLimits.maxFileSize, formatSize)}</Typography>
                            <Typography variant="body2">Files available for {renderLimitValue(premiumLimits.maxLifetime)} days</Typography>
                            <Typography variant="body2">Up to {renderLimitValue(premiumLimits.maxDownloads)} downloads per transfer</Typography>
                        </Box>
                    </Box>
                    <Chip label="Launching soon" color="primary" sx={{ mt: "auto" }} />
                </Box>

                <Box
                    sx={normalTileSx}
                >
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1, flexGrow: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>Enterprise</Typography>
                        <Box sx={priceRowSx}>
                            <Chip label="Launching soon" size="small" color="primary" />
                        </Box>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, minHeight: 120 }}>
                            <Typography variant="body2">Dedicated priority support</Typography>
                            <Typography variant="body2">Flexible custom transfer limits</Typography>
                            <Typography variant="body2">Optional dedicated infrastructure</Typography>
                        </Box>
                    </Box>
                    <Button variant="outlined" fullWidth size="small" href={`mailto:${emailAddress}`} sx={{ mt: "auto" }}>
                        Contact Sales
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}