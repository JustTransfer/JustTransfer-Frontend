import React, { useState, useRef, useEffect } from "react";
import { Box, Typography, TextField, Paper, Button, Alert } from "@mui/material";


import { useServerConfig } from "../hooks/useServerConfig";
import Layout from "../components/layout";
import { sendMessage } from "../handlers/crypto";
import { sendMessageAnonymous } from "../handlers/crypto_anonymous";
import { formatSize } from "../handlers/utils";

import * as errors from "../messages/errors";
import * as strings from "../messages/strings";

import FileTransferFormSelect from "../components/FileTransferFormSelect";
import { useAuth } from "../hooks/useAuth";
import { get } from "http";

export default function NewTransfer() {
    const { config } = useServerConfig();
    const { username, role, getLatestKeys } = useAuth();

    const [keys, setKeys] = useState<any>(null);

    const maxFileSize = role === "premium" ? config?.max_file_size_connected_premium! : config?.max_file_size_connected!;
    const maxDownloads = role === "premium" ? config?.max_downloads_connected_premium! : config?.max_downloads_connected!;
    const maxLifetime = role === "premium" ? config?.max_lifetime_connected_premium! : config?.max_lifetime_connected!;

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
        <Layout title="New Transfer" content={
            <Box sx={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: 10,
            }}>

                <FileTransferFormSelect
                    type="both"
                    propsLink={{
                        maxFileSize: config?.max_file_size_anonymous!,
                        maxDownloads: config?.max_downloads_anonymous!,
                        maxLifetime: config?.max_lifetime_anonymous!,
                        onSubmit: async (data, onProgress) => {
                            const result = await sendMessageAnonymous(
                                data.password,
                                data.file.name,
                                data.file,
                                data.lifetime,
                                data.maxDownloads,
                                onProgress
                            );
                            return result.link;
                        },
                    }}
                    propsDirect={{
                        maxFileSize: maxFileSize,
                        maxDownloads: maxDownloads,
                        maxLifetime: maxLifetime,
                        onSubmit: async (data, onProgress) => {
                            await sendMessage(
                                username!,
                                keys.enc_private_key,
                                keys.sign_private_key,
                                data.receiver!,
                                data.file.name,
                                data.file,
                                data.lifetime,
                                data.maxDownloads,
                                onProgress
                            );
                        }
                    }}
                />
            </Box>
        } />
    );
}