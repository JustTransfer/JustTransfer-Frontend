import { Box, Typography } from "@mui/material";
import AddBoxIcon from '@mui/icons-material/AddBox';

export default function HomePage() {
  return (
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
      <AddBoxIcon sx={{ color: "primary.main", transform: "scale(4)", "&:hover": { cursor: "pointer", transform: "scale(4.1)" } }} />
    </Box>
  );
}
