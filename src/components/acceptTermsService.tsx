import { Link as RouterLink } from "react-router-dom";
import { Checkbox, Box, Link } from "@mui/material";

interface AcceptTermsServiceProps {
    accepted: boolean;
    onChange: (accepted: boolean) => void;
}

export default function AcceptTermsService({
    accepted,
    onChange,
}: AcceptTermsServiceProps) {

    return (
        <Box sx={{ width: "100%", display: "flex", alignItems: "center", gap: 1 }}>
            <Checkbox
                color="primary"
                onChange={(e) => onChange(e.target.checked)}
                checked={accepted}
                sx={{ p: 0 }}
            />
            I agree to the <Link component={RouterLink} to="/terms">Terms of Service</Link> and <Link component={RouterLink} to="/privacy-policy">Privacy Policy</Link>
        </Box>
    );
}