import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import Layout from "../components/layout";
import Pricing from "../components/Pricing";

import { useAuth } from "../hooks/useAuth";
import { useNotification } from "../hooks/useNotificationContext";
import { createSubscriptionCheckoutAPI } from "../handlers/api";
import type { PricingProps } from "../components/Pricing";


export default function PricingPage() {

    const navigate = useNavigate();
    const { role } = useAuth();
    const { error, success } = useNotification();
    const [searchParams, setSearchParams] = useSearchParams();

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
                // Free tier — no payment. This should cancel any active premium subscription instead (separate endpoint, see below).
                // await cancelSubscriptionAPI();
                success("You've been switched to the free plan. TODO not working.");
                return;
            }

            const checkoutUrl = await createSubscriptionCheckoutAPI(plan);
            window.location.href = checkoutUrl;
        } catch (e) {
            error(e instanceof Error ? e.message : "Failed to update subscription");
        }
    }


    const props: PricingProps = {
        isLoggedIn: true,
        currentPlan:
            role === "admin" ? "premium"
                : role === "premium" ? "premium"
                    : role === "user" ? "user"
                        : undefined,
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