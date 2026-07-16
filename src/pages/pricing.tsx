import { useNavigate } from "react-router-dom";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import Layout from "../components/layout";
import Pricing from "../components/Pricing";

import { useAuth } from "../hooks/useAuth";
import type { PricingProps } from "../components/Pricing";


export default function PricingPage() {

    const navigate = useNavigate();
    const { role } = useAuth();

    const props: PricingProps = {
        isLoggedIn: true,
        currentPlan:
            role === "admin" ? "premium"
                : role === "premium" ? "premium"
                    : role === "user" ? "user"
                        : undefined,
    };

    return (
        <Layout
            title="Pricing"
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