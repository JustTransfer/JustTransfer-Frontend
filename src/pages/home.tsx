import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, TextField, Button, Alert, Divider, Chip } from "@mui/material";
import { Link } from "react-router-dom";

import UploadIcon from '@mui/icons-material/Upload';
import LinkIcon from '@mui/icons-material/Link';
import DownloadIcon from '@mui/icons-material/Download';

import { useServerConfig } from "../hooks/useServerConfig";
import Layout from "../components/layout";
import { sendMessageAnonymous } from "../handlers/crypto_anonymous";
import { formatSize } from "../handlers/utils";

import * as errors from "../messages/errors";
import * as strings from "../messages/strings";

import FileTransferFormSelect from "../components/FileTransferFormSelect";

export default function HomePage() {

  const navigate = useNavigate();
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

        {/* TODO modify and update the above text */}

        {/* How It Works Section */}
        <Box sx={{ width: "100%", py: 6, px: { xs: 2, md: 4 } }}>

          <Typography variant="h5" sx={{ fontWeight: "600", mb: 4, textAlign: "center" }}>
            How It Works
          </Typography>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: 4 }}>
            <Box sx={{ textAlign: "center" }}>
              <Box sx={{
                width: 50,
                height: 50,
                borderRadius: "50%",
                backgroundColor: "primary.main",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                fontWeight: "bold",
                mx: "auto",
                mb: 2
              }}>
                <UploadIcon />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: "600", mb: 1 }}>Upload</Typography>
              <Typography variant="body2" color="text.secondary">
                Select your file and add a password to secure it
              </Typography>
            </Box>
            <Box sx={{ textAlign: "center" }}>
              <Box sx={{
                width: 50,
                height: 50,
                borderRadius: "50%",
                backgroundColor: "primary.main",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                fontWeight: "bold",
                mx: "auto",
                mb: 2
              }}>
                <LinkIcon />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: "600", mb: 1 }}>Share</Typography>
              <Typography variant="body2" color="text.secondary">
                Copy the link and share it with recipients
              </Typography>
            </Box>
            <Box sx={{ textAlign: "center" }}>
              <Box sx={{
                width: 50,
                height: 50,
                borderRadius: "50%",
                backgroundColor: "primary.main",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                fontWeight: "bold",
                mx: "auto",
                mb: 2
              }}>
                <DownloadIcon />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: "600", mb: 1 }}>Download</Typography>
              <Typography variant="body2" color="text.secondary">
                Recipients download with the password you set
              </Typography>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ width: "100%", my: 2 }} />

        {/* Privacy Section */}
        <Box sx={{ width: "100%", py: 6, px: { xs: 2, md: 4 } }}>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 4, alignItems: "center", maxWidth: 1000, mx: "auto" }}>
            <Box>
              <Box sx={{ width: "100%", height: 300, backgroundColor: "#f5f5f5", borderRadius: 2, mb: 2 }}>
                {/* Placeholder for image */}
              </Box>
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: "600", mb: 2 }}>Privacy is our DNA</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                We believe file sharing should be private and secure. All transfers are encrypted end-to-end, ensuring your data remains completely protected.
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Box sx={{ color: "primary.main", fontWeight: "bold" }}>✓</Box>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: "600" }}>End-to-End Encryption</Typography>
                    <Typography variant="body2" color="text.secondary">All files are encrypted on your device</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Box sx={{ color: "primary.main", fontWeight: "bold" }}>✓</Box>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: "600" }}>No Account Required</Typography>
                    <Typography variant="body2" color="text.secondary">Share anonymously with a simple link</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Box sx={{ color: "primary.main", fontWeight: "bold" }}>✓</Box>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: "600" }}>Auto-Deletion</Typography>
                    <Typography variant="body2" color="text.secondary">Files are automatically deleted after expiration</Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ width: "100%", my: 2 }} />

        {/* Link vs Direct Transfer Section */}
        <Box sx={{ width: "100%", py: 6, px: { xs: 2, md: 4 } }}>
          <Typography variant="h5" sx={{ fontWeight: "600", mb: 4, textAlign: "center" }}>
            Link vs Direct Transfer
          </Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" }, gap: 3, maxWidth: 900, mx: "auto" }}>
            <Box sx={{ p: 3, border: "1px solid #e0e0e0", borderRadius: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: "600", mb: 3, color: "primary.main" }}>
                📎 Link Transfer
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Box sx={{ color: "primary.main", fontWeight: "bold", flexShrink: 0 }}>✓</Box>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: "600" }}>Shareable Link</Typography>
                    <Typography variant="body2" color="text.secondary">Generate a secure link to share with anyone</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Box sx={{ color: "primary.main", fontWeight: "bold", flexShrink: 0 }}>✓</Box>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: "600" }}>Download Controls</Typography>
                    <Typography variant="body2" color="text.secondary">Limit downloads and set expiration times</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Box sx={{ color: "primary.main", fontWeight: "bold", flexShrink: 0 }}>✓</Box>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: "600" }}>No Account Needed</Typography>
                    <Typography variant="body2" color="text.secondary">Share anonymously with a simple link</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Box sx={{ color: "primary.main", fontWeight: "bold", flexShrink: 0 }}>✓</Box>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: "600" }}>Password Protected</Typography>
                    <Typography variant="body2" color="text.secondary">Add password for extra security</Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
            <Box sx={{ p: 3, border: "2px solid", borderColor: "primary.main", borderRadius: 2, backgroundColor: "#fafafa" }}>
              <Typography variant="h6" sx={{ fontWeight: "600", mb: 3, color: "primary.main" }}>
                🔗 Direct Transfer
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Box sx={{ color: "primary.main", fontWeight: "bold", flexShrink: 0 }}>✓</Box>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: "600" }}>User-to-User Transfer</Typography>
                    <Typography variant="body2" color="text.secondary">Send directly to specific users</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Box sx={{ color: "primary.main", fontWeight: "bold", flexShrink: 0 }}>✓</Box>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: "600" }}>Real-time Notifications</Typography>
                    <Typography variant="body2" color="text.secondary">Recipients get notified instantly</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Box sx={{ color: "primary.main", fontWeight: "bold", flexShrink: 0 }}>✓</Box>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: "600" }}>Transfer History</Typography>
                    <Typography variant="body2" color="text.secondary">Track all your transfers in one place</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Box sx={{ color: "primary.main", fontWeight: "bold", flexShrink: 0 }}>✓</Box>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: "600" }}>Advanced Features</Typography>
                    <Typography variant="body2" color="text.secondary">Resume failed transfers and more</Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ width: "100%", my: 2 }} />

        {/* Pricing Section */}
        <Box sx={{ width: "100%", py: 6, px: { xs: 2, md: 4 } }}>
          <Typography variant="h5" sx={{ fontWeight: "600", mb: 4, textAlign: "center" }}>
            Simple, Transparent Pricing
          </Typography>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(4, 1fr)" }, gap: 2, maxWidth: 1000, mx: "auto" }}>

            {/* Anonymous Transfer Plan */}
            <Box sx={{ p: 3, border: "1px solid #e0e0e0", borderRadius: 2, textAlign: "center" }}>
              <Typography variant="h6" sx={{ fontWeight: "600", mb: 1 }}>Link Transfer</Typography>
              <Typography variant="h4" sx={{ color: "primary.main", fontWeight: "bold", mb: 2 }}>$0</Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2, minHeight: 120 }}>
                <Typography variant="body2">✓ {formatSize(config?.max_file_size_anonymous || 0)} max file size</Typography>
                <Typography variant="body2">✓ {config?.max_lifetime_anonymous} day storage</Typography>
                <Typography variant="body2">✓ {config?.max_downloads_anonymous} max downloads per transfers</Typography>
              </Box>
              <Button variant="outlined" fullWidth size="small" onClick={() => navigate("/")}>
                Get Started
              </Button>
            </Box>

            {/* Connected Transfer Plan */}
            <Box sx={{ p: 3, border: "1px solid #e0e0e0", borderRadius: 2, textAlign: "center" }}>
              <Typography variant="h6" sx={{ fontWeight: "600", mb: 1 }}>Starter</Typography>
              <Typography variant="h4" sx={{ color: "primary.main", fontWeight: "bold", mb: 2 }}>$0</Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2, minHeight: 120 }}>
                <Typography variant="body2">✓ {formatSize(config?.max_file_size_connected || 0)} max file size</Typography>
                <Typography variant="body2">✓ {config?.max_lifetime_connected} day storage</Typography>
                <Typography variant="body2">✓ {config?.max_downloads_connected} max downloads per transfers</Typography>
              </Box>
              <Button variant="outlined" fullWidth size="small" onClick={() => navigate("/register")}>
                Get Started
              </Button>
            </Box>

            {/* Professional Plan */}
            <Box sx={{
              p: 3,
              border: "2px solid",
              borderColor: "primary.main",
              borderRadius: 2,
              textAlign: "center",
              transform: "scale(1.05)",
              position: "relative",
              zIndex: 1,
              backgroundColor: "#fafafa"
            }}>
              <Chip label="RECOMMENDED" size="small" sx={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", backgroundColor: "primary.main", color: "white" }} />
              <Typography variant="h6" sx={{ fontWeight: "600", mb: 1 }}>Professional</Typography>
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, mb: 2 }}>
                <Chip label="Launching soon" size="small" color="primary" />
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2, minHeight: 120 }}>
                <Typography variant="body2">✓ {formatSize(config?.max_file_size_connected_premium || 0)} max file size</Typography>
                <Typography variant="body2">✓ {config?.max_lifetime_connected_premium} day storage</Typography>
                <Typography variant="body2">✓ {config?.max_downloads_connected_premium} max downloads per transfers</Typography>
              </Box>
              <Button variant="contained" fullWidth size="small" onClick={() => navigate("/register")}>
                Get Started
              </Button>
            </Box>

            {/* Enterprise Plan */}
            <Box sx={{ p: 3, border: "1px solid #e0e0e0", borderRadius: 2, textAlign: "center" }}>
              <Typography variant="h6" sx={{ fontWeight: "600", mb: 1 }}>Enterprise</Typography>
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, mb: 2 }}>
                <Chip label="Launching soon" size="small" color="primary" />
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2, minHeight: 120 }}>
                <Typography variant="body2">✓ Priority support</Typography>
                <Typography variant="body2">✓ Team collaboration</Typography>
              </Box>
              <Button variant="outlined" fullWidth size="small" onClick={() => navigate("/contact-sales")}>
                Contact Sales
              </Button>
            </Box>
          </Box>
        </Box>
      </ Box>
    } />
  );
}