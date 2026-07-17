import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";

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

            <Box component="span">
                Beta website
            </Box>
        </Alert >
    );
}