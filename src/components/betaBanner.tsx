import { Alert, Box } from "@mui/material";

export default function BetaBanner({ isSmallScreen }: { isSmallScreen: boolean }) {
    return (
        <Box sx={{ width: "100%" }}>
            <Alert
                severity="warning"
                sx={{
                    borderRadius: 0,
                    justifyContent: "center",
                    fontWeight: 500,
                    py: isSmallScreen ? 0 : 0.5,
                    px: isSmallScreen ? 1 : 4,
                    fontSize: isSmallScreen ? "0.8rem" : "0.9rem",
                    "& .MuiAlert-icon": {
                        fontSize: isSmallScreen ? "1rem" : "1.25rem",
                        mr: isSmallScreen ? 0.5 : 1,
                    },
                    "& .MuiAlert-message": {
                        py: isSmallScreen ? 0.5 : 1,
                    },
                }}
            >
                {isSmallScreen ?
                    "Beta: features may change or be unstable."
                    :
                    "This platform is currently in beta. Some features may change or be unstable."
                }
            </Alert>
        </Box>
    );
}