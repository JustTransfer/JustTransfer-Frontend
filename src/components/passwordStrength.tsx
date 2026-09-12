import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useTranslation } from "react-i18next";

interface PasswordStrengthProps {
    password: string;
    onStrengthChange?: (isStrong: boolean) => void; // optional callback
}

const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password, onStrengthChange }) => {
    const { t } = useTranslation("auth");
    const [score, setScore] = useState(0);

    // Strong password if >= 2 (Fair or better)
    useEffect(() => {
        if (!password) {
            setScore(0);
            onStrengthChange?.(false);
            return;
        }

        (async () => {
            const { default: zxcvbn } = await import("zxcvbn");
            const result = zxcvbn(password);

            setScore(result.score);
            onStrengthChange?.(result.score >= 2);
        })();
    }, [password, onStrengthChange]);

    const scoreLabels = ["veryWeak", "weak", "fair", "good", "strong"];
    const colors = ["orange", "yellowgreen", "green", "green"];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, width: '100%' }}>

            <Box sx={{ display: "flex", gap: 0.5 }}>
                {[0, 1, 2, 3].map((index) => {
                    const active = score >= index + 1;

                    return (
                        <Box
                            key={index}
                            sx={{
                                flex: 1,
                                height: 10,
                                borderRadius: 5,
                                backgroundColor: active
                                    ? colors[index]
                                    : 'rgba(0, 0, 0, 0.1)',
                                transition: "0.2s",
                            }}
                        />
                    );
                })}
            </Box>

            <Typography variant="caption" sx={{ color: 'text.primary', textAlign: 'left' }}>
                {t("strength", { level: t(`strengthLevels.${scoreLabels[score]}`) })}
            </Typography>
        </Box>
    );
};

export default PasswordStrength;
export type { PasswordStrengthProps };
