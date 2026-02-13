import * as React from 'react';
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { styled, useTheme, createTheme, ThemeProvider, type Theme, type CSSObject } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar, { type AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LogoutIcon from '@mui/icons-material/Logout';
import AddBoxIcon from '@mui/icons-material/AddBox';

import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { Button } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import SendIcon from '@mui/icons-material/Send';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import Container from "@mui/material/Container";
import Link from '@mui/material/Link';

import { useAuth } from "../hooks/useAuth";
import { logoutProcess } from '../handlers/crypto';
import { frontendUrl } from '../handlers/config';
import { Boy } from '@mui/icons-material';

const headerHeight = "65px";
const logoMarginTop = '-10px';
const logoWidth = "200px";

const leftBarWidth = "220px";

const footerHeight = "270px";
const footerMinAboutWidth = "300px";
const footerMinLinkWidth = "220px";
const footerMinResourceWidth = "200px";
const footerMinLegalWidth = "200px";

const defaultTheme = createTheme({
    palette: {
        primary: {
            light: "#E906E5",
            main: "#E906E5",
            dark: "#E906E5",
            contrastText: "#fff",
        },
        secondary: {
            light: "#000000",
            main: "#000000",
            dark: "#000000",
            contrastText: "#f5f5f5",
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                containedPrimary: {
                    "&:hover": {
                        backgroundColor: "#a813a8",
                    },
                },
            },
        },
    },
});

function Footer({ isLoggedIn }: { isLoggedIn: boolean }) {
    return (
        <Box
            sx={{
                backgroundColor: "#534f4fff",
                color: "#fff",
                pt: 6,
                pb: 4,
                px: 4,
            }}
        >
            <Container maxWidth="xl">
                <Box
                    sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        justifyContent: "space-between",
                        gap: 4,
                        marginLeft: isLoggedIn ? leftBarWidth : "0px",
                    }}
                >
                    {/* About */}
                    <Box sx={{ minWidth: footerMinAboutWidth, flex: 1 }}>
                        <Typography variant="h6" gutterBottom>
                            JustTransfer
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                            JustTransfer is a secure, open-source file transfer service designed for privacy-conscious users. We use end-to-end encryption to ensure your files are protected at all times.
                        </Typography>
                    </Box>

                    {/* Links */}
                    <Box sx={{ minWidth: footerMinLinkWidth }}>
                        <Typography variant="subtitle1" gutterBottom>
                            Links
                        </Typography>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                            <Link href="/" color="inherit" underline="hover">
                                Home
                            </Link>
                            <Link href="/register" color="inherit" underline="hover">
                                Create Account
                            </Link>
                            <Link href="/login" color="inherit" underline="hover">
                                Login
                            </Link>
                        </Box>
                    </Box>

                    {/* Resources */}
                    <Box sx={{ minWidth: footerMinResourceWidth }}>
                        <Typography variant="subtitle1" gutterBottom>
                            Ressources
                        </Typography>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                            <Link
                                href="https://github.com/JustinFerrara14"
                                target="_blank"
                                rel="noopener"
                                color="inherit"
                                underline="hover"
                            >
                                GitHub
                            </Link>
                            <Link
                                href="#"
                                color="inherit"
                                underline="hover"
                            >
                                Documentation
                            </Link>
                            <Link
                                href="mailto:contact@justtransfer.com"
                                color="inherit"
                                underline="hover"
                            >
                                Contact
                            </Link>
                        </Box>
                    </Box>

                    {/* Legal */}
                    <Box sx={{ minWidth: footerMinLegalWidth }}>
                        <Typography variant="subtitle1" gutterBottom>
                            Legal
                        </Typography>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                            <Link href="#" color="inherit" underline="hover">
                                Terms of Service
                            </Link>
                            <Link href="#" color="inherit" underline="hover">
                                Privacy Policy
                            </Link>
                            <Link href="#" color="inherit" underline="hover">
                                Term of Use
                            </Link>
                        </Box>
                    </Box>
                </Box>

                {/* Divider */}
                <Divider
                    sx={{
                        backgroundColor: "#333",
                        my: 4,
                        marginLeft: isLoggedIn ? "150px" : "-70px",
                        transition: "margin-left 0.3s"
                    }}
                />

                {/* Bottom */}
                <Typography
                    variant="body2"
                    align="center"
                    sx={{ opacity: 0.6 }}
                >
                    © {new Date().getFullYear()} JustTransfer — Open Source & Secure File Transfer
                </Typography>
            </Container>
        </Box>
    );
}

export default function Layout({ title, content }: { title: string; content: React.ReactNode }) {

    const navigate = useNavigate();
    const { logout } = useAuth();
    const theme = useTheme();

    const { username } = useAuth();
    const isLoggedIn = !!username;

    return (
        <ThemeProvider theme={defaultTheme}>
            <Box sx={{
                display: "flex",
                minHeight: "100vh",
                flexDirection: "column",
            }}>

                {/* HEADER */}
                <Box
                    sx={{
                        width: "100%",
                        boxSizing: "border-box",
                        height: headerHeight,
                        display: "flex",
                        alignItems: "center",
                        px: 4,
                        py: 2,
                        borderBottom: "1px solid #e0e0e0",
                        backgroundColor: "#fff",
                        position: "fixed",
                        zIndex: 1100,  // Make sure the header is above everything else
                    }}
                >

                    {/* Logo */}
                    <Box
                        component="img"
                        src="/JustTransfer.png"
                        alt="Logo"
                        sx={{
                            height: "auto",
                            width: logoWidth,
                            cursor: "pointer",
                            marginTop: logoMarginTop,
                        }}
                        onClick={() => navigate(isLoggedIn ? "/new-transfer" : "/")}
                    />

                    {/* Title */}
                    <Typography
                        variant="h6"
                        fontWeight="bold"
                        sx={{ ml: 6 }}
                    >
                        {title}
                    </Typography>

                    <Box sx={{
                        marginLeft: "auto",
                        marginRight: 4,
                        display: "flex",
                        gap: 4,
                    }}>
                        {!isLoggedIn && (
                            <>
                                <Button color="secondary" onClick={() => navigate("/register")} sx={{ ":hover": { color: "#E906E5", backgroundColor: "transparent" } }}>
                                    Create account
                                </Button>
                                <Button color="primary" variant='contained' onClick={() => navigate("/login")} sx={{}}>
                                    Login
                                </Button>
                            </>
                        )}
                    </Box>
                </Box>

                {/* CONTENT AREA */}
                <Box
                    sx={{
                        flexGrow: 1,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "top",
                    }}
                >

                    {/* LEFT SIDEBAR */}
                    {isLoggedIn && (
                        < Box
                            sx={{
                                width: leftBarWidth,
                                backgroundColor: isLoggedIn ? "#ffffff" : "#ffffff",
                                color: "white",
                                display: "flex",
                                flexDirection: "column",
                                p: 2,
                                position: "fixed",
                                height: `calc(100% - ${headerHeight} - 30px)`,
                                left: 0,
                                top: headerHeight,
                            }}
                        >

                            {/* Menu */}
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    flexGrow: 1,
                                }}
                            >
                                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, justifyContent: "space-between" }}>
                                    <Button
                                        startIcon={<AddBoxIcon />}
                                        fullWidth
                                        size="large"
                                        color="secondary"
                                        onClick={() => navigate("/new-transfer")}
                                        sx={{ justifyContent: "flex-start", textTransform: 'none', fontSize: '1.2rem' }}
                                    >
                                        New Transfer
                                    </Button>
                                    <Button
                                        startIcon={<CloudDownloadIcon />}
                                        fullWidth
                                        size="large"
                                        color="secondary"
                                        onClick={() => navigate("/inbox")}
                                        sx={{ justifyContent: "flex-start", textTransform: 'none', fontSize: '1.2rem' }}
                                    >
                                        Inbox
                                    </Button>
                                    <Button
                                        startIcon={<SendIcon />}
                                        fullWidth
                                        size="large"
                                        color="secondary"
                                        onClick={() => navigate("/transfers")}
                                        sx={{ justifyContent: "flex-start", textTransform: 'none', fontSize: '1.2rem' }}
                                    >
                                        Transfers
                                    </Button>
                                </Box>

                                {/* Bottom section */}
                                <Box sx={{
                                    marginTop: "auto",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 2,
                                    borderTop: "1px solid #444",
                                    pt: 2,
                                }}>
                                    <Button
                                        startIcon={<AccountCircleIcon sx={{ iconSize: 0 }} />}
                                        fullWidth
                                        size="large"
                                        color="secondary"
                                        onClick={() => navigate("/account")}
                                        sx={{ justifyContent: "flex-start", textTransform: 'none', fontSize: '1.2rem' }}
                                    >
                                        Account
                                    </Button>

                                    <Button
                                        startIcon={<LogoutIcon />}
                                        fullWidth
                                        size="large"
                                        color="secondary"
                                        onClick={async () => {
                                            await logoutProcess();
                                            logout();
                                        }}
                                        sx={{ justifyContent: "flex-start", textTransform: 'none', fontSize: '1.2rem' }}
                                    >
                                        Logout
                                    </Button>
                                </Box>
                            </Box>
                        </Box>
                    )}

                    <Box sx={{
                        flexGrow: 1,
                        flexDirection: "column",
                        alignContent: "center",
                        display: "flex",
                        backgroundColor: (theme) =>
                            theme.palette.mode === "light"
                                ? theme.palette.grey[100]
                                : theme.palette.grey[900],
                        borderRadius: 2,
                        p: 8,
                        minHeight: `calc(100vh - ${headerHeight} - 60px)`,
                    }} >

                        {/* MAIN CONTENT */}
                        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }} >
                            {content}
                        </Container>

                    </Box>
                </Box>

                {/* Footer*/}
                <Footer isLoggedIn={isLoggedIn} />
            </Box>
        </ThemeProvider >
    );
}