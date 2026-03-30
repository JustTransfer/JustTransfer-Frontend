import React, { useState } from "react";
import { Box, Typography, Button } from "@mui/material";
import LinkIcon from '@mui/icons-material/Link';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

import { useNotification } from "../hooks/useNotificationContext";
import * as errors from "../messages/errors";
import FileTransferForm from "./FileTransferForm";

type FileTransferFormPropsSelect = {
    type: "both" | "anonymous" | "connected";
    propsLink: Omit<Extract<FileTransferFormProps, { type: "anonymous" }>, "type">;
    propsDirect: Omit<Extract<FileTransferFormProps, { type: "connected" }>, "type">;
};

type AnonymousSubmit = (
    data: {
        password: string;
        file: File;
        lifetime: number;
        maxDownloads: number;
    },
    onProgress: (percent: number) => void
) => Promise<string | void>;

type ConnectedSubmit = (
    data: {
        receiver: string;
        file: File;
        lifetime: number;
        maxDownloads: number;
    },
    onProgress: (percent: number) => void
) => Promise<string | void>;

type FileTransferFormProps =
    | {
        type: "anonymous";
        maxFileSize: number;
        maxDownloads: number;
        maxLifetime: number;
        onSubmit: AnonymousSubmit;
    }
    | {
        type: "connected";
        maxFileSize: number;
        maxDownloads: number;
        maxLifetime: number;
        onSubmit: ConnectedSubmit;
    };

export default function FileTransferFormSelect({ type, propsLink, propsDirect }: FileTransferFormPropsSelect) {

    const { warning } = useNotification();

    const [selectedType, setSelectedType] = useState<"anonymous" | "connected">(
        type === "both" ? "connected" : type
    );

    // If type is "both", allow to switch between "anonymous" and "connected". Otherwise, set selectedType to the provided type and disable switching.
    const handleTypeChange = (newType: "anonymous" | "connected") => {

        if (newType === selectedType) {
            return;
        }

        if (type === "both") {
            setSelectedType(newType);
        } else {
            warning("Login to access this feature.");
        }
    };

    return (
        <Box sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            width: "100%",
            mb: 1,
        }}>

            <Box sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: 2,
                mb: 2,
            }}>
                <Typography variant="h3">
                    <Box component="span" fontWeight="bold">
                        Transfer{" "}
                    </Box>
                    <Box component="span" fontWeight="bold" color="primary.main">
                        Securely!
                    </Box>
                </Typography>
                <Typography
                    variant="h6"
                    color="text.secondary"
                    textAlign="center"
                    sx={{ lineHeight: 1.3 }}
                >
                    Open source end-to-end encrypted<br />file transfers.
                </Typography>
            </Box>

            <Box sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
                width: "100%",
                maxWidth: 510,
                mb: 0.5,
            }}>
                <Button
                    variant="contained"
                    onClick={() => handleTypeChange("anonymous")}
                    sx={{
                        mt: 2,
                        width: "50%",
                        backgroundColor: selectedType === "anonymous" ? "primary.main" : "grey.400",
                        gap: 2,
                    }}
                >
                    <LinkIcon />
                    Link Transfer
                </Button>
                <Button
                    variant="contained"
                    onClick={() => handleTypeChange("connected")}
                    sx={{
                        mt: 2,
                        width: "50%",
                        backgroundColor: selectedType === "connected" ? "primary.main" : "grey.400",
                        gap: 2,
                    }}
                >
                    <PersonAddIcon sx={{ transform: "scaleX(-1)" }} />
                    Direct Transfer
                </Button>
            </Box>

            {/* Render the appropriate form based on selectedType */}

            {selectedType === "anonymous" && (
                <FileTransferForm
                    type="anonymous"
                    maxFileSize={propsLink.maxFileSize}
                    maxDownloads={propsLink.maxDownloads}
                    maxLifetime={propsLink.maxLifetime}
                    onSubmit={propsLink.onSubmit}
                />
            )}

            {selectedType === "connected" && (
                <FileTransferForm
                    type="connected"
                    maxFileSize={propsDirect.maxFileSize}
                    maxDownloads={propsDirect.maxDownloads}
                    maxLifetime={propsDirect.maxLifetime}
                    onSubmit={propsDirect.onSubmit}
                />
            )}

        </Box>
    );
}
