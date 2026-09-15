import { useState } from "react";
import { useTranslation } from "react-i18next";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemText from "@mui/material/ListItemText";
import CheckIcon from "@mui/icons-material/Check";
import LanguageIcon from "@mui/icons-material/Language";
import { supportedLanguages } from "../i18n";

const languageLabels: Record<(typeof supportedLanguages)[number], string> = {
    en: "English",
    fr: "Français",
    de: "Deutsch",
    it: "Italiano",
};

export default function LanguageSwitcher() {
    const { i18n, t } = useTranslation("nav");
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [changing, setChanging] = useState(false);
    const open = Boolean(anchorEl);

    // i18next may resolve to a region-specific code (e.g. "en-US");
    // fall back to the base language so we always have a matching entry.
    const currentLang = supportedLanguages.includes(i18n.language as (typeof supportedLanguages)[number])
        ? (i18n.language as (typeof supportedLanguages)[number])
        : ((i18n.language?.split("-")[0] ?? "en") as (typeof supportedLanguages)[number]);

    const handleOpen = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);

    const handleSelect = async (lng: (typeof supportedLanguages)[number]) => {
        handleClose();
        if (lng === currentLang) return;
        setChanging(true);
        try {
            await i18n.changeLanguage(lng);
        } finally {
            setChanging(false);
        }
    };

    return (
        <>
            <Button
                onClick={handleOpen}
                startIcon={<LanguageIcon sx={{ fontSize: 18 }} />}
                size="small"
                disabled={changing}
                aria-label={t("languageLabel")}
                aria-haspopup="menu"
                aria-expanded={open}
                sx={{
                    textTransform: "none",
                    color: "#000",
                    fontSize: "0.9rem",
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
                    >
                        <ListItemText>{languageLabels[lng]}</ListItemText>
                        {lng === currentLang && (
                            <CheckIcon sx={{ fontSize: 18, ml: 2, color: "primary.main" }} />
                        )}
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
}