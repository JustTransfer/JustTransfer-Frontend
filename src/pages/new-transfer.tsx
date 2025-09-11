import React, { useState, useRef } from "react";
import { Box, Typography, TextField, Paper, Button, Snackbar, Alert } from "@mui/material";
import { type SnackbarCloseReason } from '@mui/material/Snackbar';
import { type SelectChangeEvent } from '@mui/material/Select';
import AddBoxIcon from '@mui/icons-material/AddBox';

import Layout from "../components/layout";
import { sendMessage } from "../handlers/crypto";


export default function NewTransfer() {
    const [error, setError] = useState("");
    const [openError, setOpenError] = useState(false);

    const [success, setSuccess] = useState("");
    const [openSuccess, setOpenSuccess] = useState(false);

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    function handleIconClick() {
        fileInputRef.current?.click(); // ouvre le sélecteur de fichiers
    }

    function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        if (event.target.files && event.target.files[0]) {
            setSelectedFile(event.target.files[0]);
        }
    }

    const handleClose = (event?: React.SyntheticEvent | Event, reason?: SnackbarCloseReason,) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpenError(false);
        setOpenSuccess(false);
    };


    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(form);

        if (selectedFile) {
            formData.append("file", selectedFile);
        } else {
            setError("Please select a file to upload.");
            setOpenError(true);
            return;
        }

        const data = {
            receiver: formData.get("receiver"),
            maxDownloads: formData.get("maxDownloads"),
            lifetime: formData.get("lifetime"),
            file: formData.get("file"),
        };

        try {
            await sendMessage(data.receiver as string, selectedFile!.name, selectedFile!, Number(data.lifetime), Number(data.maxDownloads));

            setSuccess("File sent successfully!");
            setOpenSuccess(true);
        } catch (e) {
            setError("An error occurred while sending the file.");
            setOpenError(true);
            return;
        }
    }

    return (
        <Layout title="Home" content={
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
                    Make a new transfer here!
                </Typography>

                <Paper elevation={4} sx={{ p: 6, borderRadius: 3, width: 500, textAlign: "center" }}>
                    <Box component="form" sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }} onSubmit={handleSubmit}>

                        <AddBoxIcon sx={{ color: "primary.main", transform: "scale(4)", "&:hover": { cursor: "pointer", transform: "scale(4.1)" }, marginBottom: 4 }} onClick={handleIconClick} />

                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: "none" }}
                            onChange={handleFileChange}
                        />


                        {selectedFile && (
                            <Typography variant="body2" color="text.secondary">
                                {selectedFile.name}
                            </Typography>
                        )}

                        <TextField label="Receiver" name="receiver" type="text" variant="outlined" fullWidth required />

                        <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 2, width: "100%" }}>
                            <TextField label="Max Downloads" name="maxDownloads" type="number" InputProps={{ inputProps: { min: 0, max: 100 } }} variant="outlined" fullWidth required />
                            <TextField label="Lifetime" name="lifetime" type="number" InputProps={{ inputProps: { min: 0, max: 100 } }} variant="outlined" fullWidth required />
                        </Box>

                        <Button type="submit" variant="contained" sx={{ mt: 2 }} fullWidth>
                            Send
                        </Button>
                    </Box>
                </Paper>

                <Snackbar anchorOrigin={{ vertical: "bottom", horizontal: "right" }} open={openSuccess} autoHideDuration={2000} onClose={handleClose}>
                    <Alert
                        severity="success"
                        variant="filled"
                        sx={{ width: '100%' }}
                    >
                        {success}
                    </Alert>
                </Snackbar>
                <Snackbar anchorOrigin={{ vertical: "bottom", horizontal: "right" }} open={openError} autoHideDuration={2000} onClose={handleClose}>
                    <Alert
                        severity="error"
                        variant="filled"
                        sx={{ width: '100%' }}
                    >
                        {error}
                    </Alert>
                </Snackbar>
            </Box>
        } />
    );
}