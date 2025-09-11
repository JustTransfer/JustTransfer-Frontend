import { Box, Typography } from "@mui/material";

import Layout from "../components/layout";

export default function Transfers() {
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
                    Transfers Page
                </Typography>
            </Box>
        } />
    );
}