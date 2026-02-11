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

import { logout } from '../handlers/crypto';
import { frontendUrl } from '../handlers/config';
import { Boy } from '@mui/icons-material';

const drawerWidth = 240;

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
                        marginLeft: isLoggedIn ? "240px" : "0px",
                    }}
                >
                    {/* About */}
                    <Box sx={{ minWidth: 250, flex: 1 }}>
                        <Typography variant="h6" gutterBottom>
                            JustTransfer
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                            JustTransfer is a secure, open-source file transfer service designed for privacy-conscious users. We use end-to-end encryption to ensure your files are protected at all times.
                        </Typography>
                    </Box>

                    {/* Links */}
                    <Box sx={{ minWidth: 200 }}>
                        <Typography variant="subtitle1" gutterBottom>
                            Links
                        </Typography>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                            <Link href="/register" color="inherit" underline="hover">
                                Create Account
                            </Link>
                            <Link href="/login" color="inherit" underline="hover">
                                Login
                            </Link>
                        </Box>
                    </Box>

                    {/* Resources */}
                    <Box sx={{ minWidth: 200 }}>
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
                    <Box sx={{ minWidth: 200 }}>
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


const defaultTheme = createTheme({
    palette: {
        primary: {
            light: "#E906E5",
            main: "#E906E5",
            dark: "#E906E5",
            contrastText: "#fff",
        },
        secondary: {
            light: "#8b1472",
            main: "#8b1472",
            dark: "#6e1b6c",
            contrastText: "#f5f5f5",
        },
    },
});


const openedMixin = (theme: Theme): CSSObject => ({
    width: drawerWidth,
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
});

const closedMixin = (theme: Theme): CSSObject => ({
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: `calc(${theme.spacing(7)} + 1px)`,
    [theme.breakpoints.up('sm')]: {
        width: `calc(${theme.spacing(8)} + 1px)`,
    },
});

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
}));

interface AppBarProps extends MuiAppBarProps {
    open?: boolean;
}

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme }) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    variants: [
        {
            props: ({ open }) => open,
            style: {
                marginLeft: drawerWidth,
                width: `calc(100% - ${drawerWidth}px)`,
                transition: theme.transitions.create(['width', 'margin'], {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.enteringScreen,
                }),
            },
        },
    ],
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme }) => ({
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        variants: [
            {
                props: ({ open }) => open,
                style: {
                    ...openedMixin(theme),
                    '& .MuiDrawer-paper': openedMixin(theme),
                },
            },
            {
                props: ({ open }) => !open,
                style: {
                    ...closedMixin(theme),
                    '& .MuiDrawer-paper': closedMixin(theme),
                },
            },
        ],
    }),
);

export default function Layout({ title, content }: { title: string; content: React.ReactNode }) {

    const navigate = useNavigate();
    const theme = useTheme();
    const [open, setOpen] = React.useState(false);
    const [isLoggedIn, setIsLoggedIn] = React.useState(false);

    const handleDrawerOpen = () => {
        setOpen(true);
    };

    const handleDrawerClose = () => {
        setOpen(false);
    };

    useEffect(() => {
        const storedKeys = {
            username: sessionStorage.getItem("username"),
            exportKey: sessionStorage.getItem("exportKey"),
            PrivateKeyEnc: sessionStorage.getItem("PrivateKeyEnc"),
            PublicKeyEnc: sessionStorage.getItem("PublicKeyEnc"),
            PrivateKeySign: sessionStorage.getItem("PrivateKeySign"),
            PublicKeySign: sessionStorage.getItem("PublicKeySign"),
        };

        // Redirect to login if any key is missing
        if (
            storedKeys.username &&
            storedKeys.exportKey &&
            storedKeys.PrivateKeyEnc &&
            storedKeys.PublicKeyEnc &&
            storedKeys.PrivateKeySign &&
            storedKeys.PublicKeySign
        ) {
            setIsLoggedIn(true);
        }
    }, []);

    return (
        <ThemeProvider theme={defaultTheme}>
            {/*<Box sx={{ display: 'flex' }}>
                <CssBaseline />
                <AppBar position="fixed" open={open} sx={{ backgroundColor: '#534f4fff' }}>
                    <Toolbar>
                        {isLoggedIn && (
                            <IconButton
                                color="inherit"
                                aria-label="open drawer"
                                onClick={handleDrawerOpen}
                                edge="start"
                                sx={[
                                    {
                                        marginRight: 5,
                                    },
                                    open && { display: 'none' },
                                ]}
                            >
                                <MenuIcon />
                            </IconButton>
                        )}
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            <Box
                                component="img"
                                src="/JustTransfer.png"
                                alt="JustTransfer Logo"
                                sx={{
                                    height: 24,
                                    cursor: 'pointer',
                                    marginTop: '-4px', // Make the logo align better with the text
                                }}
                                onClick={() => {
                                    if (isLoggedIn) {
                                        navigate("/new-transfer", { replace: true });
                                    } else {
                                        navigate("/", { replace: true });
                                    }
                                }}
                            />

                            <Typography
                                variant="h5"
                                component="div"
                                sx={{ marginLeft: 2, fontWeight: 'bold' }}
                            >
                                {title}
                            </Typography>
                        </Box>

                        {!isLoggedIn ? (
                            <Box sx={{ marginLeft: 'auto' }}>
                                <Button color="inherit" onClick={() => { navigate("/register", { replace: true }); }}>Create account</Button>
                                <Button color="inherit" onClick={() => { navigate("/login", { replace: true }); }}>Login</Button>
                            </Box>
                        ) : (
                            <Box sx={{ marginLeft: 'auto' }}>
                                <Button color="inherit" onClick={async () => {
                                    await logout();
                                    navigate("/", { replace: true });
                                }}>
                                    Logout
                                </Button>
                            </Box>
                        )}
                    </Toolbar>
                </AppBar>
                {isLoggedIn && (
                    <Drawer variant="permanent" open={open}>
                        <DrawerHeader>
                            <IconButton onClick={handleDrawerClose}>
                                {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                            </IconButton>
                        </DrawerHeader>
                        <Divider />
                        <List>
                            <ListItem key="New Transfer" disablePadding sx={{ display: 'block' }}>
                                <ListItemButton
                                    sx={[
                                        { minHeight: 48, px: 2.5 },
                                        open ? { justifyContent: 'initial' } : { justifyContent: 'center' },
                                    ]}
                                    onClick={() => { navigate("/new-transfer", { replace: true }); }}
                                >
                                    <ListItemIcon
                                        sx={[
                                            { minWidth: 0, justifyContent: 'center' },
                                            open ? { mr: 3 } : { mr: 'auto' },
                                        ]}
                                    >
                                        <AddCircleIcon />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="New Transfer"
                                        sx={[open ? { opacity: 1 } : { opacity: 0 }]}
                                    />
                                </ListItemButton>
                            </ListItem>

                            <ListItem key="Inbox" disablePadding sx={{ display: 'block' }}>
                                <ListItemButton
                                    sx={[
                                        { minHeight: 48, px: 2.5 },
                                        open ? { justifyContent: 'initial' } : { justifyContent: 'center' },
                                    ]}
                                    onClick={() => { navigate("/inbox", { replace: true }); }}
                                >
                                    <ListItemIcon
                                        sx={[
                                            { minWidth: 0, justifyContent: 'center' },
                                            open ? { mr: 3 } : { mr: 'auto' },
                                        ]}
                                    >
                                        <CloudDownloadIcon />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Inbox"
                                        sx={[open ? { opacity: 1 } : { opacity: 0 }]}
                                    />
                                </ListItemButton>
                            </ListItem>

                            <ListItem key="Transfers" disablePadding sx={{ display: 'block' }}>
                                <ListItemButton
                                    sx={[
                                        { minHeight: 48, px: 2.5 },
                                        open ? { justifyContent: 'initial' } : { justifyContent: 'center' },
                                    ]}
                                    onClick={() => { navigate("/transfers", { replace: true }); }}
                                >
                                    <ListItemIcon
                                        sx={[
                                            { minWidth: 0, justifyContent: 'center' },
                                            open ? { mr: 3 } : { mr: 'auto' },
                                        ]}
                                    >
                                        <SendIcon />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Transfers"
                                        sx={[open ? { opacity: 1 } : { opacity: 0 }]}
                                    />
                                </ListItemButton>
                            </ListItem>

                        </List>
                        <Divider />
                        <List>
                            <ListItem disablePadding sx={{ display: 'block' }}>
                                <ListItemButton
                                    sx={[
                                        {
                                            minHeight: 48,
                                            px: 2.5,
                                        },
                                        open
                                            ? {
                                                justifyContent: 'initial',
                                            }
                                            : {
                                                justifyContent: 'center',
                                            },
                                    ]}
                                    onClick={() => { navigate("/account", { replace: true }); }}
                                >
                                    <ListItemIcon
                                        sx={[
                                            {
                                                minWidth: 0,
                                                justifyContent: 'center',
                                            },
                                            open
                                                ? {
                                                    mr: 3,
                                                }
                                                : {
                                                    mr: 'auto',
                                                },
                                        ]}
                                    >
                                        <AccountCircleIcon />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Account"
                                        sx={[
                                            open
                                                ? {
                                                    opacity: 1,
                                                }
                                                : {
                                                    opacity: 0,
                                                },
                                        ]}
                                    />
                                </ListItemButton>
                            </ListItem>
                        </List>
                    </Drawer>
                )}

                <Box
                    component="main"
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        backgroundColor: (theme) =>
                            theme.palette.mode === "light"
                                ? theme.palette.grey[100]
                                : theme.palette.grey[900],
                        flexGrow: 1,
                        height: "100vh",
                        overflow: "auto",
                    }}
                >
                    <Toolbar />
                    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
                        {content}
                    </Container>

                    <Box sx={{ mt: "auto", p: 2 }}>
                        <Copyright />
                    </Box>
                </Box>
            </Box>*/}


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
                            width: 200,
                            cursor: "pointer",
                            marginTop: '-10px',
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

                    <Box sx={{ marginLeft: "auto" }}>
                        {!isLoggedIn && (
                            <>
                                <Button color="secondary" onClick={() => navigate("/register")} sx={{ marginRight: 2 }}>
                                    Create account
                                </Button>
                                <Button color="secondary" onClick={() => navigate("/login")}>
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
                                width: 220,
                                backgroundColor: isLoggedIn ? "#ffffff" : "#ffffff",
                                color: "white",
                                display: "flex",
                                flexDirection: "column",
                                p: 2,
                                position: "fixed",
                                height: "calc(100% - 100px)",
                                left: 0,
                                top: 65,
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
                                        onClick={async () => { await logout(); navigate("/"); }}
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
                        ml: isLoggedIn ? "240px" : 0,
                        minHeight: "calc(100vh - 100px)",
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