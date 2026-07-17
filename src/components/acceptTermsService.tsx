import { Link as RouterLink } from "react-router-dom";
import Checkbox from "@mui/material/Checkbox";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";

interface AcceptTermsServiceProps {
    accepted: boolean;
    onChange: (accepted: boolean) => void;
}

export default function AcceptTermsService({
    accepted,
    onChange,
}: AcceptTermsServiceProps) {

    return (
        <Box sx={{ width: "100%", display: "flex", alignItems: "flex-start", gap: 1, flexWrap: "wrap" }}>
            <Checkbox
                color="primary"
                id="accept-terms"
                onChange={(e) => onChange(e.target.checked)}
                checked={accepted}
                sx={{ p: 0, mt: 0.25 }}
            />
            <Box component="label" htmlFor="accept-terms" sx={{ display: "flex", alignItems: "center", textAlign: "left", justifyContent: "flex-start" }}>
                I agree to the<Link component={RouterLink} to="/terms" target="_blank" rel="noopener noreferrer">Terms of Service</Link> and < Link component={RouterLink} to="/privacy-policy" target="_blank" rel="noopener noreferrer" > Privacy Policy</Link >
            </Box >
        </Box >
    );
}