import { Box, Typography } from "@mui/material";

import Layout from "../components/layout";

export default function AccountPage() {
    return (
        <Layout title="Account" content={
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