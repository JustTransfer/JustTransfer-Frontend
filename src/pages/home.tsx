import React, { useState, useRef } from "react";
import { Box, Typography, TextField, Paper, Button, Snackbar, Alert } from "@mui/material";
import { type SnackbarCloseReason } from '@mui/material/Snackbar';
import { type SelectChangeEvent } from '@mui/material/Select';
import AddBoxIcon from '@mui/icons-material/AddBox';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import LinearProgress, { LinearProgressProps } from '@mui/material/LinearProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import { useServerConfig } from "../hooks/useServerConfig";
import Layout from "../components/layout";
import { sendMessageAnonymous } from "../handlers/crypto_anonymous";
import { formatSize } from "../handlers/utils";

import * as errors from "../messages/errors";
import * as strings from "../messages/strings";

export default function HomePage() {

  const { config } = useServerConfig();

  const maxFileSizeAnonymous = config?.max_file_size_anonymous ?? 0;
  const maxDownloadsAnonymous = config?.max_downloads_anonymous ?? 0;
  const maxLifetimeAnonymous = config?.max_lifetime_anonymous ?? 0;


  const [errorFile, setErrorFile] = useState(false);
  const [errorMaxDownloads, setErrorMaxDownloads] = useState(false);
  const [errorLifetime, setErrorLifetime] = useState(false);
  const [errorPassphrase, setErrorPassphrase] = useState("");
  const [error, setError] = useState("");
  const [openError, setOpenError] = useState(false);

  const [success, setSuccess] = useState("");
  const [openSuccess, setOpenSuccess] = useState(false);

  const [isSending, setIsSending] = useState(false);
  const [progress, setProgress] = useState(0);

  const [openDialog, setOpenDialog] = useState(false);
  const [link, setLink] = useState("");

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setLink("");
    setSelectedFile(null);
    setProgress(0);
    setIsSending(false);

    // Reset the form fields
    formRef.current?.reset();
  }

  function LinearProgressWithLabel(props: LinearProgressProps & { value: number }) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
        <Box sx={{ width: '100%', mr: 1 }}>
          <LinearProgress variant="determinate" {...props} />
        </Box>
        <Box sx={{ minWidth: 35 }}>
          <Typography
            variant="body2"
            sx={{ color: 'text.secondary' }}
          >{`${Math.round(props.value)}%`}</Typography>
        </Box>
      </Box>
    );
  }

  function handleIconClick() {
    fileInputRef.current?.click(); // ouvre le sélecteur de fichiers
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];

      console.log("Selected file size:", file.size);
      console.log("Max file size allowed:", maxFileSizeAnonymous);

      if (maxFileSizeAnonymous && file.size > maxFileSizeAnonymous) {
        setError(`File too large. Maximum allowed size is ${formatSize(maxFileSizeAnonymous)}.`);
        setOpenError(true);
        return;
      }

      setSelectedFile(file);
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
      setErrorFile(true);
      setError(errors.errorFileNotSelected);
      setOpenError(true);
      return;
    }

    const data = {
      passphrase: formData.get("passphrase"),
      confirmPassphrase: formData.get("confirmPassphrase"),
      maxDownloads: formData.get("maxDownloads"),
      lifetime: formData.get("lifetime"),
      file: formData.get("file"),
    };

    const downloads = Number(data.maxDownloads);
    const lifetime = Number(data.lifetime);

    let hasError = false;

    // Reset all field errors first
    setErrorPassphrase("");
    setErrorMaxDownloads(false);
    setErrorLifetime(false);

    // Passphrase validation
    if (data.passphrase !== data.confirmPassphrase) {
      setErrorPassphrase(errors.errorPassphraseMismatch);
      hasError = true;
    }


    // Downloads validation
    if (downloads <= 0) {
      setErrorMaxDownloads(true);
      hasError = true;
    } else if (
      maxDownloadsAnonymous !== undefined &&
      downloads > maxDownloadsAnonymous
    ) {
      setErrorMaxDownloads(true);
      hasError = true;
    }

    // Lifetime validation
    if (lifetime <= 0) {
      setErrorLifetime(true);
      hasError = true;
    } else if (
      maxLifetimeAnonymous !== undefined &&
      lifetime > maxLifetimeAnonymous
    ) {
      setErrorLifetime(true);
      hasError = true;
    }

    if (hasError) {
      setError("Please correct the highlighted fields.");
      setOpenError(true);
      return;
    }

    setErrorMaxDownloads(false);
    setErrorLifetime(false);

    try {
      setIsSending(true);
      setProgress(0);
      const result = await sendMessageAnonymous(data.passphrase as string, selectedFile!.name, selectedFile!, Number(data.lifetime), Number(data.maxDownloads), (percent: number) => {
        setProgress(percent);
      });

      setLink(result.link);

      setSuccess(strings.msgFileUploaded);
      setOpenSuccess(true);

      setTimeout(() => {
        setIsSending(false);
        setProgress(0);
        setOpenDialog(true);
      }, 100);

    } catch (e) {
      setError("An error occurred: " + (e instanceof Error ? e.message : errors.errorUnknown));
      setOpenError(true);
      setIsSending(false);
      setProgress(0);
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
          Make a new anonymous transfer here!
        </Typography>

        <Paper elevation={4} sx={{ p: 4, borderRadius: 3, width: 500, textAlign: "center" }}>
          <Box component="form" sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }} onSubmit={handleSubmit} ref={formRef}>

            <Typography variant="h6">
              Click to add a file to transfer.
            </Typography>

            <AddBoxIcon sx={{ color: "primary.main", transform: "scale(4)", "&:hover": { cursor: "pointer", transform: "scale(4.1)" }, marginBottom: 3, marginTop: 3 }} onClick={handleIconClick} />

            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleFileChange}
            />


            {selectedFile && (
              <Typography variant="body2" color="text.secondary">
                {selectedFile.name} ({formatSize(selectedFile.size)})
              </Typography>
            ) || (
                <Typography variant="body2" color="text.secondary" sx={{ color: errorFile ? "error.main" : "text.secondary" }}>
                  No file selected.
                </Typography>
              )}

            <TextField label="Passphrase" name="passphrase" type="password" variant="outlined" fullWidth required />
            <TextField label="Confirm Passphrase" name="confirmPassphrase" type="password" variant="outlined" fullWidth required
              error={!!errorPassphrase}
              helperText={errorPassphrase}
            />

            <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 2, width: "100%" }}>
              <TextField label="Max Downloads" name="maxDownloads" type="number" InputProps={{ inputProps: { min: 0, max: 100 } }} variant="outlined" fullWidth required
                helperText={maxDownloadsAnonymous ? `Maximum allowed: ${maxDownloadsAnonymous}` : ""}
                error={!!errorMaxDownloads}
              />
              <TextField label="Lifetime" name="lifetime" type="number" InputProps={{ inputProps: { min: 0, max: 100 } }} variant="outlined" fullWidth required
                helperText={maxLifetimeAnonymous ? `Maximum allowed: ${maxLifetimeAnonymous} days` : ""}
                error={!!errorLifetime}
              />
            </Box>

            {isSending ? (
              <LinearProgressWithLabel value={progress} />
            ) : (
              <Button type="submit" variant="contained" sx={{ mt: 2 }} fullWidth>
                Send
              </Button>
            )}
          </Box>
        </Paper>

        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            {"Your link transfer is ready!"}
          </DialogTitle>
          <DialogContent sx={{ minWidth: 600, display: 'flex', alignItems: 'center', gap: 2 }}>
            <TextField id="outlined-basic" label="Link" variant="outlined" value={link} fullWidth margin="dense" />
            <ContentCopyIcon sx={{ color: "primary.main", "&:hover": { cursor: "pointer" } }} onClick={() => {
              navigator.clipboard.writeText(link);
              setSuccess(strings.msgLinkCopied);
              setOpenSuccess(true);
            }} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              navigator.clipboard.writeText(link);
              window.open(link, '_blank', 'noopener,noreferrer');
            }}>
              Open link
            </Button>
            <Button onClick={handleCloseDialog} autoFocus>
              Close
            </Button>
          </DialogActions>
        </Dialog>

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
