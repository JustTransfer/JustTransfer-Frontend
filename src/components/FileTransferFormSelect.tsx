import React, { useState } from "react";
import { Box, Button } from "@mui/material";

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

    const [selectedType, setSelectedType] = useState<"anonymous" | "connected">(
        type === "connected" ? "connected" : "anonymous"
    );

    // If type is "both", allow to switch between "anonymous" and "connected". Otherwise, set selectedType to the provided type and disable switching.
    const handleTypeChange = (newType: "anonymous" | "connected") => {
        if (type === "both") {
            setSelectedType(newType);
        }
    };

    return (
        <Box sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            width: "100%",
            mb: 1,
        }}>

            <Box sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
                width: 450,
                mb: 1,
            }}>
                <Button
                    variant="contained"
                    onClick={() => handleTypeChange("anonymous")}
                    sx={{
                        mt: 2,
                        width: "50%",
                        backgroundColor: selectedType === "anonymous" ? "primary.main" : "grey.400",
                    }}
                >
                    Link Transfer
                </Button>
                <Button
                    variant="contained"
                    onClick={() => handleTypeChange("connected")}
                    sx={{
                        mt: 2,
                        width: "50%",
                        backgroundColor: selectedType === "connected" ? "primary.main" : "grey.400",
                    }}
                >
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
