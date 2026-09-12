import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";

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
    currentPeriodEnd?: string | null;
    onSelectPlan?: (plan: Plan) => void;
    headingId?: string;
};


export default function Pricing({ isLoggedIn, currentPlan, currentPeriodEnd, onSelectPlan, headingId }: PricingProps) {

    const { t } = useTranslation("pricing");

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

    // Only meaningful while still on premium
    const isCancelling = currentPlan === "premium" && !!currentPeriodEnd;

    const formattedPeriodEnd = currentPeriodEnd
        ? new Date(currentPeriodEnd).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
        : null;

    const currentPlanChipSx = {
        alignSelf: "center",
        px: 1,
        fontWeight: 600,
        letterSpacing: "0.02em",
        backgroundColor: "#fff1f8",
        border: "1px solid #e7bfd7",
        color: "#7a4a66",
    };

    const cancellingChipSx = {
        alignSelf: "center",
        px: 1,
        fontWeight: 600,
        letterSpacing: "0.02em",
        backgroundColor: "#fff4e5",
        border: "1px solid #f0c987",
        color: "#8a5a00",
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
            return t("getStarted");
        }
        return plan === "user" ? t("switchFree") : t("upgradePremium");
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
                <Typography id={headingId} variant="h4" component="h2" sx={{ fontWeight: 700, mb: 1 }}>
                    {t("pageTitle")}
                </Typography>
                <Typography variant="body2" sx={{ color: "#7a6474" }}>
                    {t("pageSubtitle")}
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
                        <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                            {t("linkTransfer")}
                        </Typography>
                        <Box sx={priceRowSx}>
                            <Typography variant="h4" sx={{ color: "primary.main", fontWeight: 700 }}>
                                {t("free")}
                            </Typography>
                        </Box>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, minHeight: 120 }}>
                            <Typography variant="body2">{t("maximumFileSize", { value: renderLimitValue(linkLimits.maxFileSize, formatSize) })}</Typography>
                            <Typography variant="body2">{t("availableDays", { value: renderLimitValue(linkLimits.maxLifetime) })}</Typography>
                            <Typography variant="body2">{t("downloads", { value: renderLimitValue(linkLimits.maxDownloads) })}</Typography>
                        </Box>
                    </Box>
                    {
                        !isLoggedIn && (
                            <Button variant="outlined" fullWidth size="small" onClick={() => navigate("/register")} sx={{ mt: "auto" }}>
                                {t("getStarted")}
                            </Button>
                        )
                    }
                </Box>

                <Box
                    sx={normalTileSx}
                >
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1, flexGrow: 1 }}>
                        <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                            {t("freeAccount")}
                        </Typography>
                        <Box sx={priceRowSx}>
                            <Typography variant="h4" sx={{ color: "primary.main", fontWeight: 700 }}>
                                {connectedLimits.price ? `${renderLimitValue(connectedLimits.price)} ${t("perMonth")}` : t("free")}
                            </Typography>
                        </Box>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, minHeight: 120 }}>
                            <Typography variant="body2">{t("maximumFileSize", { value: renderLimitValue(connectedLimits.maxFileSize, formatSize) })}</Typography>
                            <Typography variant="body2">{t("availableDays", { value: renderLimitValue(connectedLimits.maxLifetime) })}</Typography>
                            <Typography variant="body2">{t("downloads", { value: renderLimitValue(connectedLimits.maxDownloads) })}</Typography>
                        </Box>
                        {isCancelling && (
                            <Chip label={t("starts", { date: formattedPeriodEnd })} size="small" sx={cancellingChipSx} />
                        )}
                        {isCurrentPlan("user") && (
                            <Chip label={t("currentPlan")} size="small" sx={currentPlanChipSx} />
                        )}
                    </Box>
                    {
                        !isCurrentPlan("user") && !isCancelling && (
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
                    {
                        isCancelling && (
                            <Typography variant="caption" sx={{ mt: "auto", pt: 1, color: "text.secondary" }}>
                                {t("moveAutomatically")}
                            </Typography>
                        )
                    }
                </Box>

                <Box
                    sx={highlightedTileSx}
                >
                    <Chip label={t("recommended")} size="small" sx={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", backgroundColor: "primary.main", color: "white" }} />
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1, flexGrow: 1 }}>
                        <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                            {t("premiumAccount")}
                        </Typography>
                        <Box sx={priceRowSx}>
                            <Typography variant="h4" sx={{ color: "primary.main", fontWeight: 700 }}>
                                {renderLimitValue(premiumLimits.price)} {t("perMonth")}
                            </Typography>
                        </Box>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, minHeight: 120 }}>
                            <Typography variant="body2">{t("maximumFileSize", { value: renderLimitValue(premiumLimits.maxFileSize, formatSize) })}</Typography>
                            <Typography variant="body2">{t("availableDays", { value: renderLimitValue(premiumLimits.maxLifetime) })}</Typography>
                            <Typography variant="body2">{t("downloads", { value: renderLimitValue(premiumLimits.maxDownloads) })}</Typography>
                        </Box>
                        {isCancelling && (
                            <Chip label={t("ends", { date: formattedPeriodEnd })} size="small" sx={cancellingChipSx} />
                        )}
                        {isCurrentPlan("premium") && (
                            <Chip label={t("currentPlan")} size="small" sx={currentPlanChipSx} />
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
                        <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                            {t("enterprise")}
                        </Typography>
                        <Box sx={priceRowSx}>
                            <Chip label={t("launchingSoon")} size="small" color="primary" />
                        </Box>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, minHeight: 120 }}>
                            <Typography variant="body2">{t("prioritySupport")}</Typography>
                            <Typography variant="body2">{t("customLimits")}</Typography>
                            <Typography variant="body2">{t("dedicatedInfrastructure")}</Typography>
                        </Box>
                    </Box>
                    <Button variant="outlined" fullWidth size="small" href={`mailto:${emailAddress}`} sx={{ mt: "auto" }}>
                        {t("contactSales")}
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}