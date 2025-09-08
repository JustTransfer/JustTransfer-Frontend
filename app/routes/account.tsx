import type { Route } from "./+types/account";
import { Box, Typography } from "@mui/material";

export default function AccountPage() {
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