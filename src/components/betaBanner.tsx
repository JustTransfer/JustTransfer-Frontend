import { Alert, Box } from "@mui/material";

export default function BetaBanner() {
    return (
        <Box sx={{ width: "100%" }}>
            <Alert
                severity="warning"
                sx={{
                    borderRadius: 0,
                    justifyContent: "center",
                    fontWeight: 500,
                }}
            >
                This platform is currently in beta. Some features may change or be unstable.
            </Alert>
        </Box>
    );
}