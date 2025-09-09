import { Box, Typography } from "@mui/material";


export default function Transfers() {
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
                Transfers Page
            </Typography>
        </Box>
    );
}