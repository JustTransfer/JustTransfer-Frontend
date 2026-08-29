import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import Layout from "../components/layout";
import Pricing from "../components/Pricing";

import { useAuth } from "../hooks/useAuth";
import { useNotification } from "../hooks/useNotificationContext";
import { createSubscriptionCheckoutAPI, cancelSubscriptionAPI, getAccountInfoAPI } from "../handlers/api";
import type { PricingProps } from "../components/Pricing";


export default function PricingPage() {

    const navigate = useNavigate();
    const { role } = useAuth();
    const { error, success } = useNotification();
    const [searchParams, setSearchParams] = useSearchParams();
    const [cancelling, setCancelling] = useState(false);
    const [currentPeriodEnd, setCurrentPeriodEnd] = useState<string | null>(null);

    async function fetchPeriodEnd() {
        try {
            const accountInfo = await getAccountInfoAPI();
            setCurrentPeriodEnd(accountInfo.current_period_end ?? null);
        } catch {
            // Non-critical: pricing page still works without this
        }
    }

    useEffect(() => {
        fetchPeriodEnd();
    }, []);

    useEffect(() => {
        const status = searchParams.get("subscription");
        if (status === "failed") {
            error("Your payment could not be processed. Please try again.");
        } else if (status === "cancelled") {
            error("Checkout was cancelled.");
        }
        if (status) {
            searchParams.delete("subscription");
            setSearchParams(searchParams, { replace: true });
        }
    }, []);

    async function handleSelectPlan(plan: "user" | "premium") {
        try {
            if (plan === "user") {
                setCancelling(true);
                await cancelSubscriptionAPI();

                const accountInfo = await getAccountInfoAPI();
                const periodEnd = accountInfo.current_period_end ?? null;
                setCurrentPeriodEnd(periodEnd);

                const formatted = periodEnd
                    ? new Date(periodEnd).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                    })
                    : null;

                success(
                    formatted
                        ? `Your subscription is set to cancel. You'll keep Premium access until ${formatted}.`
                        : "Your subscription is set to cancel at the end of the billing period."
                );
                return;
            }

            const checkoutUrl = await createSubscriptionCheckoutAPI(plan);
            window.location.href = checkoutUrl; // Stripe Checkout Session URL
        } catch (e) {
            error(e instanceof Error ? e.message : "Failed to update subscription");
        } finally {
            setCancelling(false);
        }
    }

    const props: PricingProps = {
        isLoggedIn: true,
        currentPlan:
            role === "admin" ? "premium"
                : role === "premium" ? "premium"
                    : role === "user" ? "user"
                        : undefined,
        currentPeriodEnd,
        onSelectPlan: handleSelectPlan,
    };

    return (
        <Layout
            content={
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "center" }}>
                    <Box sx={{ width: "86%" }}>
                        <Button
                            size="small"
                            variant="contained"
                            onClick={() => navigate("/account")}
                            disabled={cancelling}
                            sx={{
                                mt: { xs: 4, md: 0 },
                            }}
                        >
                            <ArrowBackIcon sx={{ mr: 1 }} />
                            Account
                        </Button>
                    </Box>

                    <Pricing {...props} />
                </Box>
            }
        />
    );
}