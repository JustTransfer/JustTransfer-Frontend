import type { Route } from "./+types/account";
import { useEffect, useState } from "react";

import { Box, Typography } from "@mui/material";

export default function AccountPage() {

    useEffect(() => {
        const storedKeys = {
            exportKey: sessionStorage.getItem("exportKey"),
            sessionKey: sessionStorage.getItem("sessionKey"),
            PrivateKeyEnc: sessionStorage.getItem("PrivateKeyEnc"),
            PublicKeyEnc: sessionStorage.getItem("PublicKeyEnc"),
            PrivateKeySign: sessionStorage.getItem("PrivateKeySign"),
            PublicKeySign: sessionStorage.getItem("PublicKeySign"),
        };

        // Redirect to login if any key is missing
        if (
            !storedKeys.exportKey ||
            !storedKeys.sessionKey ||
            !storedKeys.PrivateKeyEnc ||
            !storedKeys.PublicKeyEnc ||
            !storedKeys.PrivateKeySign ||
            !storedKeys.PublicKeySign
        ) {
            window.location.href = "/login";
        }
    }, []);

    return (
        <Box
            sx={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: 10,
            }}
        >
            <Typography variant="h3">
                Account Page
            </Typography>
        </Box>
    );
}