import { Box, Typography, AppBar, Toolbar, Button, TextField, Paper } from "@mui/material";

export default function Header() {
    return (
        <AppBar position="static" sx={{ bgcolor: "white", color: "black" }}>
            <Toolbar sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="h5" sx={{ fontWeight: "bold" }} onClick={() => { window.location.href = '/'; }} style={{ cursor: 'pointer' }}>
                    GoGoTransfert
                </Typography>

                {/* Right side menu */}
                <Box sx={{ display: "flex", gap: 2 }}>
                    <Button variant="contained" sx={{ bgcolor: "#bb17c4", "&:hover": { bgcolor: "#a50fb3" } }} onClick={() => { window.location.href = '/create-account'; }}>
                        Create an account
                    </Button>
                    <Button variant="text" sx={{ alignSelf: "center", cursor: "pointer", color: "black" }} onClick={() => { window.location.href = '/login'; }}>
                        Sign in
                    </Button>
                </Box>
            </Toolbar>
        </AppBar >
    );
}