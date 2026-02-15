import React from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Box, Container, Typography, Button } from "@mui/material";


import * as strings from "../messages/strings";
import * as errors from "../messages/errors";

import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import Layout from "../components/layout";
import { Link } from "react-router-dom";

export default function Error() {
    return (
        <Layout title="Error" content={
            <Container
                maxWidth="sm"
                style={{ textAlign: "center", marginTop: "5rem" }}
            >
                <Box display="flex" flexDirection="column" alignItems="center">
                    <ErrorOutlineIcon style={{ fontSize: 80, color: "#f44336" }} />
                    <Typography variant="h3" component="h1" gutterBottom>
                        Oops! {errors.errorPageNotFound}
                    </Typography>
                    <Button variant="contained" href="/">
                        {strings.btnBackToHome}
                    </Button>
                </Box>
            </ Container>
        } />
    );
}