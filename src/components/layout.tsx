import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import LogoutIcon from '@mui/icons-material/Logout';

import { Button } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

import SendIcon from '@mui/icons-material/Send';
import Container from "@mui/material/Container";
import Link from '@mui/material/Link';

import { useAuth } from "../hooks/useAuth";
import { emailAddress } from "../handlers/config";
import BetaBanner from './betaBanner';

const headerHeight = "65px";
const logoMarginTop = '-10px';
const logoWidth = "200px";

const leftBarWidth = "250px";

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
                root: ({ ownerState }) => ({
                    textTransform: "none",
                    fontSize: "1rem",

                    ...(ownerState.variant === "contained" &&
                        ownerState.color === "primary" && {
                        "&:hover": {
                            backgroundColor: "#a813a8",
                        },
                    }),
                }),
            },
        },
    },
});

function Footer({ isLoggedIn }: { isLoggedIn: boolean }) {

    return (
        <Box
            sx={{
                mt: "auto",
                flexShrink: 0,
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
                        marginLeft: isLoggedIn ? { xs: "0px", md: leftBarWidth } : "0px",
                    }}
                >
                    {/* About */}
                    <Box sx={{ minWidth: { xs: "100%", sm: footerMinAboutWidth }, flex: 1 }}>
                        <Typography variant="h6" gutterBottom>
                            JustTransfer
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                            JustTransfer is a secure, open-source file transfer service designed for large files. We use end-to-end encryption to ensure your files are protected at all times.
                        </Typography>
                    </Box>

                    {/* Resources */}
                    <Box sx={{ minWidth: { xs: "100%", sm: footerMinResourceWidth } }}>
                        <Typography variant="subtitle1" gutterBottom>
                            Ressources
                        </Typography>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                            <Link
                                href="https://github.com/JustTransfer/"
                                target="_blank"
                                rel="noreferrer"
                                color="inherit"
                                underline="hover"
                            >
                                GitHub
                            </Link>
                            <Link
                                href="https://justtransfer.github.io/"
                                target="_blank"
                                rel="noreferrer"
                                color="inherit"
                                underline="hover"
                            >
                                Whitepaper
                            </Link>
                        </Box>
                    </Box>

                    {/* Legal */}
                    <Box sx={{ minWidth: { xs: "100%", sm: footerMinLegalWidth } }}>
                        <Typography variant="subtitle1" gutterBottom>
                            Legal
                        </Typography>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                            <Link component={RouterLink} to="/terms" color="inherit" underline="hover">
                                Terms of Service
                            </Link>
                            <Link component={RouterLink} to="/privacy-policy" color="inherit" underline="hover">
                                Privacy Policy
                            </Link>
                        </Box>
                    </Box>

                    {/* Contact */}
                    <Box sx={{ minWidth: { xs: "100%", sm: footerMinLinkWidth } }}>
                        <Typography variant="subtitle1" gutterBottom>
                            Contact
                        </Typography>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                            <Link
                                href={`mailto:${emailAddress}`}
                                color="inherit"
                                underline="hover"
                            >
                                {emailAddress}
                            </Link>
                        </Box>
                    </Box>
                </Box>

                {/* Divider */}
                <Divider
                    sx={{
                        backgroundColor: "#333",
                        my: 4,
                        marginLeft: isLoggedIn ? { xs: "0px", md: "150px" } : { xs: "0px", md: "-70px" },
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

    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    const { username } = useAuth();
    const isLoggedIn = !!username;

    const menuButtonStyle = (path: string) => ({
        justifyContent: "flex-start",
        textTransform: "none",
        fontSize: "1.2rem",
        color: "#000",
        backgroundColor: isActive(path) ? "#e6e6e6" : "transparent",
        "&:hover": {
            backgroundColor: isActive(path) ? "#e6e6e6" : "#e6e6e6",
        },
        borderRadius: 2,
        px: 2,
    });

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
                        height: { xs: "56px", md: headerHeight },
                        display: "flex",
                        alignItems: "center",
                        px: { xs: 2, md: 4 },
                        py: { xs: 1.5, md: 2 },
                        borderBottom: "1px solid #e0e0e0",
                        backgroundColor: "#fff",
                        position: "fixed",
                        zIndex: 1100,  // Make sure the header is above everything else
                        gap: { xs: 1.5, md: 0 },
                    }}
                >

                    {/* Logo */}
                    <Box
                        component="img"
                        src="/JustTransfer.png"
                        alt="Logo"
                        sx={{
                            height: "auto",
                            width: { xs: "140px", md: logoWidth },
                            cursor: "pointer",
                            marginTop: logoMarginTop,
                        }}
                        onClick={
                            () => navigate(isLoggedIn ? "/new-transfer" : "/")
                        }
                    />

                    {/* Title */}
                    <Typography
                        variant="h6"
                        sx={{
                            ml: { xs: 0, md: 6 },
                            fontWeight: "bold",
                            display: { xs: "none", sm: "block" },
                        }}
                    >
                        {title}
                    </Typography>

                    {/* Beta banner */}
                    <Box sx={{
                        position: "absolute",
                        left: "50%",
                        transform: "translateX(-50%)",
                        display: { xs: "none", sm: "block" },
                    }}>
                        <BetaBanner />
                    </Box>

                    <Box sx={{
                        marginLeft: "auto",
                        marginRight: { xs: 0, md: 4 },
                        display: { xs: "none", sm: "flex" },
                        gap: 4,
                    }}>
                        {!isLoggedIn && (
                            <>
                                <Button color="secondary" onClick={() => navigate("/register")} sx={{ ":hover": { color: "#E906E5", backgroundColor: "transparent" } }}>
                                    Create account
                                </Button>
                                <Button color="primary" variant='contained' onClick={() => navigate("/login")} sx={{}}>
                                    Log in
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
                        alignItems: "flex-start",
                    }}
                >

                    {/* LEFT SIDEBAR */}
                    {isLoggedIn && (
                        <Box
                            sx={{
                                width: leftBarWidth,
                                backgroundColor: isLoggedIn ? "#ffffff" : "#ffffff",
                                color: "white",
                                display: { xs: "none", md: "flex" },
                                flexDirection: "column",
                                p: 2,
                                position: "fixed",
                                height: `calc(100% - ${headerHeight})`,
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
                                <Box sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 2,
                                    justifyContent: "space-between",
                                }}>
                                    <Button
                                        startIcon={<SendIcon />}
                                        fullWidth
                                        size="large"
                                        onClick={() => navigate("/new-transfer")}
                                        sx={menuButtonStyle("/new-transfer")}
                                    >
                                        New Transfer
                                    </Button>
                                    <Button
                                        startIcon={<CloudDownloadIcon />}
                                        fullWidth
                                        size="large"
                                        onClick={() => navigate("/inbox")}
                                        sx={menuButtonStyle("/inbox")}
                                    >
                                        Inbox
                                    </Button>
                                    <Button
                                        startIcon={<CloudUploadIcon />}
                                        fullWidth
                                        size="large"
                                        onClick={() => navigate("/transfers")}
                                        sx={menuButtonStyle("/transfers")}
                                    >
                                        Active Transfers
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
                                    mt: "auto",
                                }}>
                                    <Button
                                        startIcon={<AccountCircleIcon />}
                                        fullWidth
                                        size="large"
                                        onClick={() => navigate("/account")}
                                        sx={menuButtonStyle("/account")}
                                    >
                                        Account
                                    </Button>

                                    <Button
                                        startIcon={<LogoutIcon />}
                                        fullWidth
                                        size="large"
                                        onClick={async () => {
                                            navigate("/logout");
                                        }}
                                        sx={menuButtonStyle("/logout")}
                                    >
                                        Logout
                                    </Button>
                                </Box>
                            </Box>
                        </Box>
                    )}

                    <Box sx={{
                        flex: "1 1 auto",
                        flexDirection: "column",
                        alignContent: "center",
                        alignItems: "stretch",
                        display: "flex",
                        backgroundColor: (theme) =>
                            theme.palette.mode === "light"
                                ? theme.palette.grey[100]
                                : theme.palette.grey[900],
                        borderRadius: { xs: 0, md: 2 },
                        p: { xs: 2, sm: 3, md: 8 },
                        minHeight: `calc(100vh)`,
                        width: "100%",
                        minWidth: 0,
                        ml: { xs: 0, md: isLoggedIn ? leftBarWidth : 0 },
                    }} >

                        {/* MAIN CONTENT */}
                        <Container maxWidth={false} disableGutters sx={{ width: "100%", mt: { xs: 4, md: 4 }, mb: { xs: 2, md: 4 } }}>
                            {content}
                        </Container>

                    </Box>
                </Box>

                {/* Footer*/}
                <Footer isLoggedIn={isLoggedIn} />
            </Box>
        </ThemeProvider>
    );
}