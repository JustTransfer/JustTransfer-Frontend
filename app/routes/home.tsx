import type { Route } from "./+types/home";
import { Box, Typography, IconButton, Paper, AppBar, Toolbar, Button } from "@mui/material";
import AddBoxIcon from '@mui/icons-material/AddBox';
import Header from "~/components/header";
import Footer from "~/components/footer";

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
      <Header />

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

      <Footer />
    </Box>
  );
}
