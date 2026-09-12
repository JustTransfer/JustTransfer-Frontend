import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { useTranslation } from "react-i18next";

import { useNotification } from "../hooks/useNotificationContext";
import Layout from "../components/layout";
import { requestResetPasswordAPI } from "../handlers/api";


export default function ResetPasswordRequestPage() {

    const { t } = useTranslation(["auth", "errors", "common"]);

    const cardSx = {
        width: "100%",
        maxWidth: 520,
        textAlign: "center",
        borderRadius: 4,
        border: "1px solid #f1e7ee",
        boxShadow: "0 18px 40px rgba(83, 24, 60, 0.12)",
        backgroundColor: "#ffffff",
        p: { xs: 3, md: 5 },
    };

    const { success, error } = useNotification();

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(form);
        const data = {
            email: formData.get("email"),
        };

        try {
            await requestResetPasswordAPI(data.email as string);
            success(t("common:msgPasswordRequested"));

        } catch (e) {
            error(e instanceof Error ? e.message : t("errors:errorPasswordResetRequestFailed"));
        }
    }

    return (
        <Layout
            content={
                <Box
                    sx={{
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        flex: 1,
                        alignItems: "center",
                        justifyContent: "center",
                        py: { xs: 4, md: 6 },
                    }}
                >
                    <Paper elevation={0} sx={cardSx}>
                        <Typography variant="h4" sx={{ mb: 2, fontWeight: "bold", color: "#2b0f1f" }}>
                            {t("auth:resetTitle")}
                        </Typography>

                        <Typography variant="body1" sx={{ mb: 3, color: "#6e5a69" }}>
                            {t("auth:resetRequestDescription")}
                        </Typography>

                        <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 3 }} onSubmit={handleSubmit}>
                            <TextField label={t("auth:email")} name="email" type="email" variant="outlined" fullWidth required />
                            <Button type="submit" variant="contained" sx={{ mt: 2 }}>
                                {t("auth:sendResetEmail")}
                            </Button>
                        </Box>
                    </Paper>
                </ Box>

            } />
    );
}
