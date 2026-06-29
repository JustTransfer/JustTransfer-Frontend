import React, { useEffect, useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { Box, Typography, Button, Chip } from "@mui/material";
import ReactMarkdown from "react-markdown";

import Layout from "../components/layout";



export default function TermsService() {
    const [terms, setTerms] = useState("");

    useEffect(() => {
        let isActive = true;

        fetch(`${process.env.PUBLIC_URL}/termsService.md`)
            .then((response) => response.text())
            .then((markdown) => {
                if (isActive) {
                    setTerms(markdown);
                }
            });

        return () => {
            isActive = false;
        };
    }, []);

    return (
        <Layout title="Home" content={

            <Box
                sx={{
                    maxWidth: 900,
                    mx: "auto",
                    py: 4,
                    "& h1": { mt: 4, mb: 2 },
                    "& h2": { mt: 3, mb: 2 },
                    "& h3": { mt: 2, mb: 1 },
                    "& p": { mb: 2 },
                    "& ul": { pl: 3, mb: 2 },
                    "& li": { mb: 0.5 },
                }}
            >
                <ReactMarkdown>
                    {terms}
                </ReactMarkdown>
            </Box>

        } />
    );
}