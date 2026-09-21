import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { useTranslation } from "react-i18next";

import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import Layout from "../components/layout";

export default function Error() {
    const { t } = useTranslation(["auth", "errors", "common"]);

    return (
        <Layout
            content={
                <Box
                    sx={{
                        maxWidth: 550,
                        mx: "auto",
                        py: { xs: 2.5, md: 4 }
                    }}>
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            textAlign: "center",
                            borderRadius: 4,
                            border: "1px solid #f1e7ee",
                            boxShadow: "0 18px 40px rgba(83, 24, 60, 0.12)",
                            backgroundColor: "#ffffff",
                            p: { xs: 2, md: 3 },
                        }}
                    >
                        <ErrorOutlineOutlinedIcon style={{ fontSize: 72, color: "#d32f2f" }} />
                        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700, color: "#2b0f1f", fontSize: { xs: "1.75rem", md: "2.5rem" } }}>
                            {t("auth:oops")}<br />{t("errors:errorPageNotFound")}
                        </Typography>
                        <Typography variant="body1" sx={{ color: "#6e5a69", mb: 3 }}>
                            {t("auth:pageUnavailable")}
                        </Typography>
                        <Button variant="contained" href="/">
                            {t("common:btnBackToHome")}
                        </Button>
                    </Box>
                </ Box>
            } />
    );
}