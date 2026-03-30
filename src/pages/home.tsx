import React, { useState, useRef } from "react";
import { Box, Typography, TextField, Paper, Button, Alert } from "@mui/material";
import { Link } from "react-router-dom";

import { useServerConfig } from "../hooks/useServerConfig";
import Layout from "../components/layout";
import { sendMessageAnonymous } from "../handlers/crypto_anonymous";
import { formatSize } from "../handlers/utils";

import * as errors from "../messages/errors";
import * as strings from "../messages/strings";

import FileTransferFormSelect from "../components/FileTransferFormSelect";

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

          <FileTransferFormSelect
            type="anonymous"
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
              // still required by the type, even if unused
              maxFileSize: 0,
              maxDownloads: 0,
              maxLifetime: 0,
              onSubmit: async () => { },
            }}
          />
        </Box>

        <Typography variant="body2" color="text.secondary">
          To make an direct transfer, please{" "}
          <Link to="/login">login</Link>.
        </Typography>
      </ Box>
    } />
  );
}