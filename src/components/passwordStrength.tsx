import React, { useState, useEffect } from "react";
import { Box, LinearProgress, Typography } from "@mui/material";
import zxcvbn from "zxcvbn";

interface PasswordStrengthProps {
    password: string;
    onStrengthChange?: (isStrong: boolean) => void; // optional callback
}

const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password, onStrengthChange }) => {
    const [score, setScore] = useState(0);
    const [isStrong, setIsStrong] = useState(false);

    useEffect(() => {
        const result = zxcvbn(password);
        setScore(result.score);
        const strong = result.score >= 3;
        setIsStrong(strong);
        if (onStrengthChange) onStrengthChange(strong);
    }, [password, onStrengthChange]);

    const scoreLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
    const barColor =
        score <= 1 ? "red" :
            score === 2 ? "orange" :
                score === 3 ? "yellowgreen" :
                    "green";

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, width: '100%' }}>
            <LinearProgress
                variant="determinate"
                value={(score) * 25 + 1} // 0-4 -> 0-100%
                sx={{
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: '#e0e0e0',
                    '& .MuiLinearProgress-bar': {
                        backgroundColor: barColor,
                    },
                }}
            />
            <Typography variant="caption" sx={{ color: 'text.primary', textAlign: 'right' }}>
                {"Password strength: " + scoreLabels[score]}
            </Typography>
        </Box>
    );
};

export default PasswordStrength;
export type { PasswordStrengthProps };
