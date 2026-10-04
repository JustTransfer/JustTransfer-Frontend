import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemText from "@mui/material/ListItemText";
import CheckIcon from "@mui/icons-material/Check";
import LanguageIcon from "@mui/icons-material/Language";
import Chip from "@mui/material/Chip";

import { supportedLanguages } from "../i18n";

type Lang = (typeof supportedLanguages)[number];

const languageLabels: Record<Lang, string> = {
    en: "English",
    fr: "Français",
    de: "Deutsch",
    it: "Italiano",
};

const betaLanguages: Partial<Record<Lang, boolean>> = {
    de: true,
    it: true,
};

export default function LanguageSwitcher() {
    const navigate = useNavigate();
    const location = useLocation();
    const { i18n, t } = useTranslation("nav");
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const currentLang = supportedLanguages.includes(i18n.language as Lang)
        ? (i18n.language as Lang)
        : ((i18n.language?.split("-")[0] ?? "en") as Lang);

    const handleOpen = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);

    const handleSelect = (lng: Lang) => {
        handleClose();

        // Replace only the first path segment (the language code)
        const segments = location.pathname.split("/");
        segments[1] = lng;
        const newPath = segments.join("/");

        navigate(`${newPath}${location.search}${location.hash}`);
    };

    return (
        <Box>
            <Button
                onClick={handleOpen}
                startIcon={<LanguageIcon sx={{ fontSize: 18 }} />}
                size="medium"
                aria-label={t("languageLabel")}
                aria-haspopup="menu"
                aria-expanded={open}
                sx={{
                    textTransform: "none",
                    color: "#000",
                    fontSize: "1rem",
                    minWidth: "auto",
                    px: 1,
                }}
            >
                {languageLabels[currentLang]}
            </Button>

            <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                {supportedLanguages.map((lng) => (
                    <MenuItem
                        key={lng}
                        selected={lng === currentLang}
                        onClick={() => handleSelect(lng)}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 1,
                        }}
                    >
                        <ListItemText>{languageLabels[lng]}</ListItemText>
                        {betaLanguages[lng] && (
                            <Chip
                                label="Beta"
                                size="small"
                                variant="outlined"
                                color="warning"
                                sx={{
                                    height: 18,
                                    fontSize: "0.65rem",
                                    fontWeight: 600,
                                    ml: 1,
                                    mr: lng === currentLang ? 0 : 4,
                                }}
                            />
                        )}
                        {lng === currentLang && (
                            <CheckIcon sx={{ fontSize: 18, ml: 1, color: "primary.main" }} />
                        )}
                    </MenuItem>
                ))}
            </Menu>
        </Box>
    );
}