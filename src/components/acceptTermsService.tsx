import { Link as RouterLink } from "react-router";
import { useTranslation } from "react-i18next";

import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";

interface AcceptTermsServiceProps {
    accepted: boolean;
    onChange: (accepted: boolean) => void;
}

export default function AcceptTermsService({
    accepted,
    onChange,
}: AcceptTermsServiceProps) {
    const { t } = useTranslation(["auth", "footer"]);

    return (
        <FormControlLabel
            sx={{
                width: "100%",
                alignItems: "flex-start",
                m: 0,

                "& .MuiCheckbox-root": {
                    p: 0,
                    mt: "2px",
                    mr: 1,
                },

                "& .MuiFormControlLabel-label": {
                    flex: 1,
                    minWidth: 0,
                },
            }}
            control={
                <Checkbox
                    id="accept-terms"
                    color="primary"
                    checked={accepted}
                    onChange={(e) => onChange(e.target.checked)}
                />
            }
            label={
                <Typography
                    component="span"
                    variant="body1"
                    sx={{
                        display: "block",
                        textAlign: "left",
                        lineHeight: 1.5,
                    }}
                >
                    {t("auth:agreeToTerms")} {" "}
                    <Link
                        component={RouterLink}
                        to="/terms"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {t("footer:termsOfService")}
                    </Link>{" "}
                    {" "}{t("auth:and")} {" "}
                    <Link
                        component={RouterLink}
                        to="/privacy-policy"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {t("footer:privacyPolicy")}
                    </Link>
                </Typography>
            }
        />
    );
}