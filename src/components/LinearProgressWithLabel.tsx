import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import type { LinearProgressProps } from "@mui/material/LinearProgress";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import { formatSpeed } from "../handlers/utils";

type Props = LinearProgressProps & { value: number; speed?: number };

export default function LinearProgressWithLabel({ value, speed, ...rest }: Props) {
    return (
        <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
            <Box sx={{ width: "100%", mr: 1 }}>
                <LinearProgress variant="determinate" value={value} {...rest} />
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", minWidth: 35 }}>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    {`${Math.round(value)}%`}
                </Typography>
                {!!speed && speed > 0 && (
                    <Tooltip title={formatSpeed(speed)} arrow enterTouchDelay={0}>
                        <IconButton size="small" sx={{ p: 0.25, ml: 0.25 }} aria-label="Transfer speed">
                            <InfoOutlinedIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                    </Tooltip>
                )}
            </Box>
        </Box>
    );
}