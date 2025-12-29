import * as React from 'react';
import { useEffect } from "react";
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

const drawerWidth = 240;

function Copyright(props: any) {
    return (
        <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            {...props}
        >
            {"Copyright © "}
            <Link color="inherit" href={frontendUrl}>
                JustTransfer
            </Link>{" "}
            {new Date().getFullYear()}
            {"."}
        </Typography>
    );
}

const defaultTheme = createTheme({
    palette: {
        primary: {
            light: "#bb17c4",
            main: "#bb17c4",
            dark: "#bb17c4",
            contrastText: "#fff",
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
            sessionKey: sessionStorage.getItem("sessionKey"),
            PrivateKeyEnc: sessionStorage.getItem("PrivateKeyEnc"),
            PublicKeyEnc: sessionStorage.getItem("PublicKeyEnc"),
            PrivateKeySign: sessionStorage.getItem("PrivateKeySign"),
            PublicKeySign: sessionStorage.getItem("PublicKeySign"),
        };

        // Redirect to login if any key is missing
        if (
            storedKeys.username &&
            storedKeys.exportKey &&
            storedKeys.sessionKey &&
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
            <Box sx={{ display: 'flex' }}>
                <CssBaseline />
                <AppBar position="fixed" open={open}>
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
                        <Typography variant="h6" noWrap component="div" onClick={() => {
                            if (!isLoggedIn) {
                                window.location.href = '/';
                            } else {
                                window.location.href = '/new-transfer';
                            }
                        }} sx={{ cursor: 'pointer' }}>
                            JustTransfer - {title}
                        </Typography>
                        {!isLoggedIn ? (
                            <Box sx={{ marginLeft: 'auto' }}>
                                <Button color="inherit" onClick={() => { window.location.href = '/register'; }}>Create account</Button>
                                <Button color="inherit" onClick={() => { window.location.href = '/login'; }}>Login</Button>
                            </Box>
                        ) : (
                            <Box sx={{ marginLeft: 'auto' }}>
                                <Button color="inherit" onClick={async () => {
                                    await logout();
                                    window.location.href = '/';
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
                                    onClick={() => { window.location.href = '/new-transfer'; }}
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
                                    onClick={() => { window.location.href = '/inbox'; }}
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
                                    onClick={() => { window.location.href = '/transfers'; }}
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
                                    onClick={() => { window.location.href = '/account'; }}
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
            </Box>
        </ThemeProvider>
    );
}