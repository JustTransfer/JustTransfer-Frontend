import React from "react";
import { Box, Container, Typography, Button } from "@mui/material";


import * as strings from "../messages/strings";
import * as errors from "../messages/errors";

import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import Layout from "../components/layout";
import { Link } from "react-router-dom";

export default function Error() {
    return (
        <Layout title="Error" content={
            <Container maxWidth="sm" sx={{ py: { xs: 4, md: 8 } }}>
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        textAlign: "center",
                        borderRadius: 4,
                        border: "1px solid #f1e7ee",
                        boxShadow: "0 18px 40px rgba(83, 24, 60, 0.12)",
                        backgroundColor: "#ffffff",
                        p: { xs: 3, md: 5 },
                    }}
                >
                    <ErrorOutlineOutlinedIcon style={{ fontSize: 72, color: "#d32f2f" }} />
                    <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700, color: "#2b0f1f" }}>
                        Oops! {errors.errorPageNotFound}
                    </Typography>
                    <Typography variant="body1" sx={{ color: "#6e5a69", mb: 3 }}>
                        The page you are looking for is not available.
                    </Typography>
                    <Button variant="contained" href="/">
                        {strings.btnBackToHome}
                    </Button>
                </Box>
            </ Container>
        } />
    );
}