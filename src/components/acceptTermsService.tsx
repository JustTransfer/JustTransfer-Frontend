import { Link as RouterLink } from "react-router-dom";
import React, { useState } from "react";

import { Checkbox, Box, Link } from "@mui/material";

interface AcceptTermsServiceProps {
    accepted: boolean;
    onChange: (accepted: boolean) => void;
}

export default function AcceptTermsService({
    accepted,
    onChange,
}: AcceptTermsServiceProps) {

    return (
        <Box sx={{ width: "100%" }}>
            <Checkbox
                color="primary"
                onChange={(e) => onChange(e.target.checked)}
                checked={accepted}
            />
            I accept the <Link component={RouterLink} to="/terms">Terms of Service</Link>
        </Box>
    );
}