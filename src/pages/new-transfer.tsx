import { useState, useEffect } from "react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";

import { useServerConfig } from "../hooks/useServerConfig";
import Layout from "../components/layout";
import { addSavedTransfer } from "../handlers/crypto";
import { sendMessageLink } from "../handlers/crypto_link";
import FileTransferForm from "../components/FileTransferForm";
import { useAuth } from "../hooks/useAuth";

export default function NewTransfer() {
    const maxWidthPage = 1400;
    const { config } = useServerConfig();
    const { role, exportKey, getLatestKeys } = useAuth();

    const [keys, setKeys] = useState<any>(null);

    const maxFileSize = role === "premium" ? config?.max_file_size_connected_premium! : config?.max_file_size_connected!;
    const maxDownloads = role === "premium" ? config?.max_downloads_connected_premium! : config?.max_downloads_connected!;
    const maxLifetime = role === "premium" ? config?.max_lifetime_connected_premium! : config?.max_lifetime_connected!;

    async function sendTransfer(
        fileName: string,
        file: File,
        lifetime: number,
        maxDownloads: number,
        password: string,
        privateKeySign: string | undefined,
        isSigned: boolean,
        keyId: string | undefined,
        onProgress: (percent: number) => void,
        receiver_email?: string
    ): Promise<string> {

        const result = await sendMessageLink(
            fileName,
            file,
            lifetime,
            maxDownloads,
            isSigned,
            keyId,
            privateKeySign,
            password,
            onProgress,
            receiver_email
        );

        // Save the transfer to account's saved transfers
        await addSavedTransfer(result.id, result.password, exportKey!, result.auth_key);

        return result.link;
    }

    useEffect(() => {
        const fetchKeys = async () => {
            try {
                const latestKeys = await getLatestKeys();
                setKeys(latestKeys);
            } catch (err) {
                console.error("Failed to fetch latest keys:", err);
            }
        };

        fetchKeys();
    }, [getLatestKeys]);

    return (
        <Layout
            content={
                <Box
                    sx={{
                        flex: 1,
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: { xs: 3, md: 4 },
                        py: { xs: 3, md: 4 },
                    }}
                >
                    <Box
                        sx={{
                            width: "100%",
                            maxWidth: maxWidthPage,
                            mx: "auto",
                            borderRadius: 4,
                            border: "1px solid #f1e7ee",
                            boxShadow: "0 18px 40px rgba(83, 24, 60, 0.08)",
                            background: "radial-gradient(1200px 500px at 15% -10%, #ffa6da 0%, #fff7fb 45%, #ffffff 100%)",
                            p: { xs: 2.5, md: 4 },
                        }}
                    >
                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: { xs: "1fr", md: "1.05fr 0.95fr" },
                                gap: { xs: 4, md: 6 },
                                alignItems: "start",
                            }}
                        >
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "flex-start",
                                    justifyContent: "center",
                                    mt: { xs: 0, md: 15, lg: 25 },
                                }}
                            >
                                <Typography
                                    variant="h3"
                                    sx={{
                                        fontSize: {
                                            xs: "2.5rem",   // ~h5
                                            sm: "3rem",     // ~h4
                                        },
                                        fontWeight: 700,
                                        letterSpacing: "-0.02em",
                                        mb: { xs: 1, sm: 2 },
                                        color: "#2b0f1f",
                                    }}
                                >
                                    Send files with end-to-end encryption.
                                </Typography>
                                <Typography variant="body1" sx={{ color: "#5a4454", maxWidth: 520 }}>
                                    Create secure links or send directly to a user account. Transfers stay encrypted and auto-expire.
                                </Typography>
                            </Box>

                            <Box
                                sx={{
                                    backgroundColor: "#ffffff",
                                    borderRadius: 3,
                                    p: 2,
                                    boxShadow: "0 24px 60px rgba(119, 41, 93, 0.15)",
                                    border: "1px solid #f0dbea",
                                }}
                            >
                                {config ? (
                                    <FileTransferForm
                                        type="connected"
                                        maxFileSize={maxFileSize}
                                        maxDownloads={maxDownloads}
                                        maxLifetime={maxLifetime}
                                        onSubmit={async (data, onProgress) => {
                                            return await sendTransfer(
                                                data.file.name,
                                                data.file,
                                                data.lifetime,
                                                data.maxDownloads,
                                                data.password,
                                                keys.sign_private_key,
                                                data.isSigned,
                                                keys.id,
                                                onProgress,
                                                data.receiver_email
                                            )
                                        }}
                                    />
                                ) : (
                                    <Box
                                        sx={{
                                            height: "100%",
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            minHeight: 700,
                                        }}
                                    >
                                        <CircularProgress />
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    </Box>
                </Box>
            } />
    );
}