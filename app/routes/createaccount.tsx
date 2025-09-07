import { Box, Typography, Button, TextField, Paper } from "@mui/material";
import Header from "~/components/header";
import Footer from "~/components/footer";

export default function CreateAccountPage() {
    return (
        <Box
            sx={{
                height: "100vh",
                width: "100vw",
                display: "flex",
                flexDirection: "column",
            }}
        >
            <Header />

            {/* Create Account form */}
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
                        Create Account
                    </Typography>

                    <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        <TextField
                            label="Email"
                            type="email"
                            variant="outlined"
                            fullWidth
                            required
                            sx={{
                                "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                    borderColor: "#bb17c4",
                                },
                                "& .MuiInputLabel-root.Mui-focused": {
                                    color: "#bb17c4",
                                },
                            }}
                        />
                        <TextField
                            label="Password"
                            type="password"
                            variant="outlined"
                            fullWidth
                            required
                            sx={{
                                "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                    borderColor: "#bb17c4",
                                },
                                "& .MuiInputLabel-root.Mui-focused": {
                                    color: "#bb17c4",
                                },
                            }}
                        />
                        <TextField
                            label="Confirm Password"
                            type="password"
                            variant="outlined"
                            fullWidth
                            required
                            sx={{
                                "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                    borderColor: "#bb17c4",
                                },
                                "& .MuiInputLabel-root.Mui-focused": {
                                    color: "#bb17c4",
                                },
                            }}
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            sx={{
                                mt: 2,
                                bgcolor: "#bb17c4",
                                "&:hover": { bgcolor: "#a50fb3" },
                            }}
                        >
                            Create Account
                        </Button>
                    </Box>
                </Paper>
            </Box>

            <Footer />
        </Box>
    );
}
