import { useNavigate } from "react-router";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";

import { useServerConfig } from "../hooks/useServerConfig";
import { formatSize } from "../handlers/utils";
import { emailAddress } from "../handlers/config";

export type Plan = "user" | "premium";

export type PricingProps = {
    isLoggedIn: boolean;
    currentPlan?: Plan;
    onSelectPlan?: (plan: Plan) => void;
};


export default function Pricing({ isLoggedIn, currentPlan, onSelectPlan }: PricingProps) {

    const navigate = useNavigate();
    const { config } = useServerConfig();

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
        boxShadow: "0 18px 46px rgba(83, 24, 60, 0.16)",
        position: "relative",
        flex: { xs: "1 1 100%", sm: "1 1 280px", lg: "1 1 0" },
        minWidth: 0,
    };

    const highlightedTileSx = {
        ...normalTileSx,
        position: "relative",
        border: "1px solid #c992b6",
        background: "linear-gradient(160deg, #ffd8ee 0%, #ffffff 100%)",
        boxShadow: "0 24px 64px rgba(83, 24, 60, 0.22)",
    };

    const linkLimits = {
        maxFileSize: config?.max_file_size_link,
        maxDownloads: config?.max_downloads_link,
        maxLifetime: config?.max_lifetime_link,
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

    const isCurrentPlan = (plan: Plan) => currentPlan === plan;

    const currentPlanChipSx = {
        alignSelf: "center",
        px: 1,
        fontWeight: 600,
        letterSpacing: "0.02em",
        backgroundColor: "#fff1f8",
        border: "1px solid #e7bfd7",
        color: "#7a4a66",
    };

    // Logged-out users to register page, logged-in users to checkout for selected plan
    const handlePlanAction = (plan: Plan) => {
        if (!isLoggedIn) {
            navigate("/register");
            return;
        }
        onSelectPlan?.(plan);
    };

    const planButtonLabel = (plan: Plan) => {
        if (!isLoggedIn) {
            return "Get Started";
        }
        return plan === "user" ? "Switch to Free" : "Upgrade to Premium";
    };

    return (
        <Box
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
            }}
        >
            <Box sx={{ textAlign: "center", mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    Plans and pricing
                </Typography>
                <Typography variant="body2" sx={{ color: "#7a6474" }}>
                    Free link transfers today. Upgrade anytime for more storage and longer retention.
                </Typography>
            </Box>
            <Box
                sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "center",
                    alignItems: "stretch",
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
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Link Transfer
                        </Typography>
                        <Box sx={priceRowSx}>
                            <Typography variant="h4" sx={{ color: "primary.main", fontWeight: 700 }}>
                                Free
                            </Typography>
                        </Box>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, minHeight: 120 }}>
                            <Typography variant="body2">Maximum file size: {renderLimitValue(linkLimits.maxFileSize, formatSize)}</Typography>
                            <Typography variant="body2">Files available for {renderLimitValue(linkLimits.maxLifetime)} days</Typography>
                            <Typography variant="body2">{renderLimitValue(linkLimits.maxDownloads)} downloads per transfer</Typography>
                        </Box>
                    </Box>
                    {
                        !isLoggedIn && (
                            <Button variant="outlined" fullWidth size="small" onClick={() => navigate("/register")} sx={{ mt: "auto" }}>
                                Get Started
                            </Button>
                        )
                    }
                </Box>

                <Box
                    sx={normalTileSx}
                >
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1, flexGrow: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Free Account
                        </Typography>
                        <Box sx={priceRowSx}>
                            <Typography variant="h4" sx={{ color: "primary.main", fontWeight: 700 }}>
                                {connectedLimits.price ? `${renderLimitValue(connectedLimits.price)} CHF / month` : "Free"}
                            </Typography>
                        </Box>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, minHeight: 120 }}>
                            <Typography variant="body2">Maximum file size: {renderLimitValue(connectedLimits.maxFileSize, formatSize)}</Typography>
                            <Typography variant="body2">Files available for {renderLimitValue(connectedLimits.maxLifetime)} days</Typography>
                            <Typography variant="body2">{renderLimitValue(connectedLimits.maxDownloads)} downloads per transfer</Typography>
                        </Box>
                        {isCurrentPlan("user") && (
                            <Chip label="Current plan" size="small" sx={currentPlanChipSx} />
                        )}
                    </Box>
                    {
                        !isCurrentPlan("user") && (
                            <Button
                                variant="contained"
                                fullWidth
                                size="small"
                                onClick={() => handlePlanAction("user")}
                                sx={{ mt: "auto" }}
                            >
                                {planButtonLabel("user")}
                            </Button>
                        )
                    }
                </Box>

                <Box
                    sx={highlightedTileSx}
                >
                    <Chip label="RECOMMENDED" size="small" sx={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", backgroundColor: "primary.main", color: "white" }} />
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1, flexGrow: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Premium Account
                        </Typography>
                        <Box sx={priceRowSx}>
                            <Typography variant="h4" sx={{ color: "primary.main", fontWeight: 700 }}>
                                {renderLimitValue(premiumLimits.price)} CHF / month
                            </Typography>
                        </Box>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, minHeight: 120 }}>
                            <Typography variant="body2">Maximum file size: {renderLimitValue(premiumLimits.maxFileSize, formatSize)}</Typography>
                            <Typography variant="body2">Files available for {renderLimitValue(premiumLimits.maxLifetime)} days</Typography>
                            <Typography variant="body2">{renderLimitValue(premiumLimits.maxDownloads)} downloads per transfer</Typography>
                        </Box>
                        {isCurrentPlan("premium") && (
                            <Chip label="Current plan" size="small" sx={currentPlanChipSx} />
                        )}
                    </Box>
                    {
                        !isCurrentPlan("premium") && (
                            <Button
                                variant="contained"
                                fullWidth
                                size="small"
                                onClick={() => handlePlanAction("premium")}
                                sx={{ mt: "auto" }}
                            >
                                {planButtonLabel("premium")}
                            </Button>
                        )
                    }
                </Box>

                <Box
                    sx={normalTileSx}
                >
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1, flexGrow: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Enterprise
                        </Typography>
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