import { Box, Typography } from "@mui/material";

export default function Footer() {
    return (
        <Box
            component="footer"
            sx={{
                bgcolor: "#f5f5f5",
                py: 2,
                textAlign: "center",
                borderTop: "1px solid #ddd",
            }}
        >
            <Typography variant="body2" color="textSecondary">
                © {new Date().getFullYear()} GoGoTransfert. All rights reserved.
            </Typography>
        </Box>
    );
}