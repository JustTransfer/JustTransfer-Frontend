import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";

import Layout from "../components/layout";

export default function AccountPage() {

    useEffect(() => {
        const storedKeys = {
            username: sessionStorage.getItem("username"),
            exportKey: sessionStorage.getItem("exportKey"),
            sessionKey: sessionStorage.getItem("sessionKey"),
            PrivateKeyEnc: sessionStorage.getItem("PrivateKeyEnc"),
            PublicKeyEnc: sessionStorage.getItem("PublicKeyEnc"),
            PrivateKeySign: sessionStorage.getItem("PrivateKeySign"),
            PublicKeySign: sessionStorage.getItem("PublicKeySign"),
        };

        // Redirect to login if any key is missing
        if (
            !storedKeys.username ||
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
        <Layout title="Home" content={
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
        } />
    );
}