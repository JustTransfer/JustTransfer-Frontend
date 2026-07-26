import { useState } from "react";
import Box from "@mui/material/Box";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import LinkIcon from '@mui/icons-material/Link';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

import { useNotification } from "../hooks/useNotificationContext";
import FileTransferForm from "./FileTransferForm";

type FileTransferFormPropsSelect = {
    type: "both" | "link" | "connected";
    propsLink: Omit<Extract<FileTransferFormProps, { type: "link" }>, "type">;
    propsDirect: Omit<Extract<FileTransferFormProps, { type: "connected" }>, "type">;
    showIntro?: boolean;
};

type LinkSubmit = (
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
        type: "link";
        maxFileSize: number;
        maxDownloads: number;
        maxLifetime: number;
        onSubmit: LinkSubmit;
    }
    | {
        type: "connected";
        maxFileSize: number;
        maxDownloads: number;
        maxLifetime: number;
        onSubmit: ConnectedSubmit;
    };

export default function FileTransferFormSelect({
    type,
    propsLink,
    propsDirect,
}: FileTransferFormPropsSelect) {

    const { warning } = useNotification();

    const [selectedType, setSelectedType] = useState<"link" | "connected">(
        type === "both" ? "connected" : type
    );

    // If type is "both", allow to switch between "link" and "connected". Otherwise, set selectedType to the provided type and disable switching.
    const handleTypeChange = (newType: "link" | "connected") => {

        if (newType === selectedType) {
            return;
        }

        if (type === "both") {
            setSelectedType(newType);
        } else {
            warning("Log in to access this feature.");
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

            <ToggleButtonGroup
                value={selectedType}
                exclusive
                fullWidth
                onChange={(_, value) => {
                    if (!value) return;
                    handleTypeChange(value);
                }}
                sx={{
                    mt: 2,
                    width: "100%",
                }}
            >
                <ToggleButton value="link" sx={{
                    "&.Mui-selected": {
                        bgcolor: "primary.main",
                        color: "primary.contrastText",

                        "&:hover": {
                            bgcolor: "primary.dark",
                        },
                    },
                }}>
                    <LinkIcon sx={{ mr: 1 }} />
                    Link Transfer
                </ToggleButton>

                <ToggleButton value="connected"
                    sx={{
                        "&.Mui-selected": {
                            bgcolor: "primary.main",
                            color: "primary.contrastText",

                            "&:hover": {
                                bgcolor: "primary.dark",
                            },
                        },
                    }}
                >
                    <PersonAddIcon sx={{ mr: 1, transform: "scaleX(-1)" }} />
                    Direct Transfer
                </ToggleButton>
            </ToggleButtonGroup>

            {/* Render the appropriate form based on selectedType */}

            {
                selectedType === "link" && (
                    <FileTransferForm
                        type="link"
                        maxFileSize={propsLink.maxFileSize}
                        maxDownloads={propsLink.maxDownloads}
                        maxLifetime={propsLink.maxLifetime}
                        onSubmit={propsLink.onSubmit}
                    />
                )
            }

            {
                selectedType === "connected" && (
                    <FileTransferForm
                        type="connected"
                        maxFileSize={propsDirect.maxFileSize}
                        maxDownloads={propsDirect.maxDownloads}
                        maxLifetime={propsDirect.maxLifetime}
                        onSubmit={propsDirect.onSubmit}
                    />
                )
            }

        </Box >
    );
}
