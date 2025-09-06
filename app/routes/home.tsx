import type { Route } from "./+types/home";
import { Box, Typography, IconButton, Paper, AppBar, Toolbar, Button } from "@mui/material";
import AddBoxIcon from '@mui/icons-material/AddBox';

export default function HomePage() {
  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <AppBar position="static" sx={{ bgcolor: "white", color: "black" }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            GoGoTransfert
          </Typography>

          {/* Right side menu */}
          <Box sx={{ display: "flex", gap: 2 }}>
            <Typography variant="body1" sx={{ alignSelf: "center", cursor: "pointer", color: "#bb17c4" }}>
              Create an account
            </Typography>
            <Typography variant="body1" sx={{ alignSelf: "center", cursor: "pointer" }}>
              Sign in
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
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
          Upload your files here
        </Typography>

        <AddBoxIcon sx={{ color: "#bb17c4", transform: "scale(4)", "&:hover": { cursor: "pointer", transform: "scale(4.1)" } }} />
      </Box>
    </Box>
  );
}
