
import Layout from "../components/layout";
import Pricing from "../components/Pricing";

import * as errors from "../messages/errors";
import * as strings from "../messages/strings";

export default function PricingPage() {

    return (
        <Layout
            title="Account Settings"
            content={
                <Pricing />
            }
        />
    );
}