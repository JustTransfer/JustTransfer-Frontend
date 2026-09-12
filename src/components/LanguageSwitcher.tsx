import { useTranslation } from "react-i18next";
import Select, { type SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { supportedLanguages } from "../i18n";

const languageLabels: Record<(typeof supportedLanguages)[number], string> = {
    en: "English",
    fr: "Français",
    de: "Deutsch",
    it: "Italiano",
};

export default function LanguageSwitcher() {
    const { i18n, t } = useTranslation("nav");

    const handleChange = (event: SelectChangeEvent) => {
        i18n.changeLanguage(event.target.value);
    };

    // i18next may resolve to a region-specific code (e.g. "en-US");
    // fall back to the base language so the Select always has a matching value.
    const currentLang = supportedLanguages.includes(i18n.language as (typeof supportedLanguages)[number])
        ? i18n.language
        : i18n.language?.split("-")[0] ?? "en";

    return (
        <Select
            size="small"
            value={currentLang}
            onChange={handleChange}
            variant="standard"
            disableUnderline
            sx={{ fontSize: "0.9rem", color: "#000" }}
            inputProps={{ "aria-label": t("languageLabel") }}
        >
            {supportedLanguages.map((lng) => (
                <MenuItem key={lng} value={lng}>
                    {languageLabels[lng]}
                </MenuItem>
            ))}
        </Select>
    );
}
