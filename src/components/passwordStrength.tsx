import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import zxcvbn from "zxcvbn";

interface PasswordStrengthProps {
    password: string;
    onStrengthChange?: (isStrong: boolean) => void; // optional callback
}

const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password, onStrengthChange }) => {
    const [score, setScore] = useState(0);

    // Strong password if >= 2 (Fair or better)
    useEffect(() => {
        const result = zxcvbn(password);
        setScore(result.score);
        const strong = result.score >= 2;
        if (onStrengthChange) onStrengthChange(strong);
    }, [password, onStrengthChange]);

    const scoreLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
    const colors = [
        "orange",
        "yellowgreen",
        "green",
        "green",
    ];

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
                {"Password strength: " + scoreLabels[score]}
            </Typography>
        </Box>
    );
};

export default PasswordStrength;
export type { PasswordStrengthProps };
