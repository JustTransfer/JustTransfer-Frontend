import Layout from "../components/layout";
import Pricing from "../components/Pricing";

import { useAuth } from "../hooks/useAuth";
import { PricingProps } from "../components/Pricing";

import * as errors from "../messages/errors";
import * as strings from "../messages/strings";

export default function PricingPage() {

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
            title="Account Settings"
            content={
                <Pricing {...props} />
            }
        />
    );
}