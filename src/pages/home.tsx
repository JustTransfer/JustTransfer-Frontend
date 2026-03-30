import React, { useState, useRef } from "react";
import { Box, Typography, TextField, Paper, Button, Alert } from "@mui/material";
import { Link } from "react-router-dom";

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
        gap: 2,
      }}>

        <Box sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 6,
        }}>
          <Box sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 2,
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
          <FileTransferForm
            type="anonymous"
            maxFileSize={config?.max_file_size_anonymous!}
            maxDownloads={config?.max_downloads_anonymous!}
            maxLifetime={config?.max_lifetime_anonymous!}
            onSubmit={async (data, onProgress) => {
              const result = await sendMessageAnonymous(
                data.password!,
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

        <Typography variant="body2" color="text.secondary">
          To make an account transfer, please{" "}
          <Link to="/login">login</Link>.
        </Typography>
      </ Box>
    } />
  );
}