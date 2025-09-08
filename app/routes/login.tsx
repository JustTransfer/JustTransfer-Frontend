import { Box, Typography, Button, TextField, Paper } from "@mui/material";

export default function LoginPage() {
    return (
        <Box
            sx={{
                height: "100vh",
                width: "100vw",
                display: "flex",
                flexDirection: "column",
            }}
        >
            <Box
                sx={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Paper elevation={4} sx={{ p: 6, borderRadius: 3, width: 400, textAlign: "center" }}>
                    <Typography variant="h4" sx={{ mb: 4, fontWeight: "bold", color: "black" }}>
                        Login
                    </Typography>

                    <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        <TextField label="Email" type="email" variant="outlined" fullWidth required />
                        <TextField label="Password" type="password" variant="outlined" fullWidth required />
                        <Button type="submit" variant="contained" sx={{ mt: 2 }}>
                            Login
                        </Button>
                    </Box>
                </Paper>
            </Box>
        </Box>
    );
}