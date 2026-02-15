import React, { useState, useRef } from "react";
import { Box, Typography, TextField, Paper, Button, Alert } from "@mui/material";


import { useServerConfig } from "../hooks/useServerConfig";
import Layout from "../components/layout";
import { sendMessage } from "../handlers/crypto";
import { formatSize } from "../handlers/utils";

import * as errors from "../messages/errors";
import * as strings from "../messages/strings";

import FileTransferForm from "../components/FileTransferForm";
import { useAuth } from "../hooks/useAuth";

export default function NewTransfer() {
    const { config } = useServerConfig();

    const { role } = useAuth();

    const maxFileSize = role === "premium" ? config?.max_file_size_connected_premium! : config?.max_file_size_connected!;
    const maxDownloads = role === "premium" ? config?.max_downloads_connected_premium! : config?.max_downloads_connected!;
    const maxLifetime = role === "premium" ? config?.max_lifetime_connected_premium! : config?.max_lifetime_connected!;

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

                <Typography variant="h3">
                    Make a new account transfer here!
                </Typography>

                <FileTransferForm
                    type="connected"
                    maxFileSize={maxFileSize!}
                    maxDownloads={maxDownloads}
                    maxLifetime={maxLifetime}
                    onSubmit={async (data, onProgress) => {
                        await sendMessage(
                            data.receiver!,
                            data.file.name,
                            data.file,
                            data.lifetime,
                            data.maxDownloads,
                            onProgress
                        );
                    }}
                />
            </Box>
        } />
    );
}