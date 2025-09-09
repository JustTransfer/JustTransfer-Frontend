import { Box, Typography } from "@mui/material";


export default function Inbox() {
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
                Inbox page
            </Typography>
        </Box>
    );
};