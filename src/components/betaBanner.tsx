import { Alert, Box } from "@mui/material";

export default function BetaBanner() {
    return (
        <Alert
            severity="warning"
            icon={false}
            sx={{
                borderRadius: 0,
                justifyContent: "center",
                fontWeight: 500,

                py: 0,
                px: 1,
                fontSize: { xs: "0.8rem", md: "0.9rem" },

                "& .MuiAlert-message": {
                    py: 1,
                },
            }}
        >

            <Box component="span" sx={{ display: { xs: "inline", lg: "none" } }}>
                Beta website
            </Box>

            <Box component="span" sx={{ display: { xs: "none", lg: "inline" } }}>
                This platform is currently in beta. Some features may change or be unstable.
            </Box>
        </Alert>
    );
}