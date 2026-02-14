import React, { useState, useRef } from "react";
import { Box, Typography, TextField, Paper, Button, Snackbar, Alert } from "@mui/material";

import { useServerConfig } from "../hooks/useServerConfig";
import Layout from "../components/layout";
import { sendMessageAnonymous } from "../handlers/crypto_anonymous";
import { formatSize } from "../handlers/utils";

import * as errors from "../messages/errors";
import * as strings from "../messages/strings";

import FileTransferForm from "../components/FileTransferForm";

export default function HomePage() {
  const { config } = useServerConfig();
  return (
    <Layout title="Home" content={
      <Box sx={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 10,
      }}>
        <Typography variant="h3">
          Make a new anonymous transfer here!
        </Typography>
        <FileTransferForm
          type="anonymous"
          maxFileSize={config?.max_file_size_anonymous!}
          maxDownloads={config?.max_downloads_anonymous!}
          maxLifetime={config?.max_lifetime_anonymous!}
          onSubmit={async (data, onProgress) => {
            const result = await sendMessageAnonymous(
              data.passphrase!,
              data.file.name,
              data.file,
              data.lifetime,
              data.maxDownloads,
              onProgress
            );
            return result.link; // return string for the link
          }}
        />
      </Box>
    } />
  );
}