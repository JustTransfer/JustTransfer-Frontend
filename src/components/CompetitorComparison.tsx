import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

import { useServerConfig } from "../hooks/useServerConfig";
import { formatSize } from "../handlers/utils";


const columns = ["JustTransfer", "WeTransfer", "SwissTransfer", "Blip"];

function getRows(maxFileSizeLabel: string, expirationDays: string, maxDownloads: string) {
    return [
        {
            feature: "Max file size (free)",
            values: [`${maxFileSizeLabel}*`,
                "100 GB",
                "50 GB",
                "No limit (P2P)"
            ],
        },
        {
            feature: "End-to-end encryption",
            values: [true, false, false, true],
        },
        {
            feature: "Email required to send",
            values: ["No", "No", "Yes", "Yes"],
        },
        {
            feature: "Open source",
            values: [true, false, "Mobile apps only", false],
        },
        {
            feature: "Link expiration (free)",
            values: [
                `Choose 1-${expirationDays} days*`,
                "Choose 1-7 days",
                "Choose 1-30 days",
                "Instant download only (P2P)",
            ],
        },
        {
            feature: "Download limit (free)",
            values: [
                `Choose 1-${maxDownloads} downloads*`,
                "No limit",
                "Choose 1-250 downloads",
                "1 download (P2P)",
            ],
        },
        {
            feature: "Works without an app",
            values: [true, true, true, false],
        },
        {
            feature: "Recipient doesn't need to be online",
            values: [true, true, true, false],
        },
        {
            feature: "Send to multiple recipients at once",
            values: [true, true, true, false],
        },
    ];
}

function CellValue({ value }: { value: string | boolean }) {
    if (typeof value === "boolean") {
        return value ? (
            <CheckCircleIcon sx={{ color: "#2e7d32", fontSize: 20 }} />
        ) : (
            <CancelIcon sx={{ color: "#bdbdbd", fontSize: 20 }} />
        );
    }
    return (
        <Typography variant="body2" sx={{ color: "#5f4b58" }}>
            {value}
        </Typography>
    );
}

export default function CompetitorComparison() {

    const { config } = useServerConfig();

    const maxFileSizeLabel = config?.max_file_size_link != null
        ? formatSize(config.max_file_size_link)
        : "...";
    const expiration_days = String(config?.max_lifetime_link ?? "...");
    const max_downloads = String(config?.max_downloads_link ?? "...");
    const rows = getRows(maxFileSizeLabel, expiration_days, max_downloads);

    return (
        <Box
            sx={{
                width: "100%",
                maxWidth: 1400,
                mx: "auto",
                py: { xs: 4, md: 6 },
                px: { xs: 2, md: 4 },
                backgroundColor: "#ffffff",
                borderRadius: 4,
                border: "1px solid #f1e7ee",
                boxShadow: "0 18px 40px rgba(83, 24, 60, 0.08)",
            }}
        >
            <Box sx={{ maxWidth: 1400, mx: "auto", textAlign: "center", mb: 5 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    How JustTransfer compares
                </Typography>
                <Typography variant="body1" sx={{ color: "#7a6474", fontSize: "1.05rem" }}>
                    See how we stack up against other popular file-sharing services.
                </Typography>
            </Box>

            <TableContainer
                sx={{
                    overflowX: "auto",
                    borderRadius: 3,
                    border: "1px solid #f1e7ee",
                    "&::-webkit-scrollbar": { height: 8 },
                    "&::-webkit-scrollbar-thumb": { backgroundColor: "#eecfe0", borderRadius: 4 },
                }}
            >
                <Table sx={{ minWidth: 780 }}>
                    <TableHead>
                        <TableRow>
                            <TableCell
                                sx={{
                                    fontWeight: 700,
                                    backgroundColor: "#fafafa",
                                    borderBottom: "2px solid #f1e7ee",
                                    minWidth: 160,
                                }}
                            >
                                Feature
                            </TableCell>
                            {columns.map((col) => {
                                const isJustTransfer = col === "JustTransfer";
                                return (
                                    <TableCell
                                        key={col}
                                        align="center"
                                        sx={{
                                            fontWeight: 700,
                                            minWidth: 150,
                                            backgroundColor: isJustTransfer ? "#fbe3f0" : "#fafafa",
                                            borderBottom: isJustTransfer
                                                ? "2px solid #E906E5"
                                                : "2px solid #f1e7ee",
                                            color: isJustTransfer ? "primary.main" : "inherit",
                                        }}
                                    >
                                        {col}
                                    </TableCell>
                                );
                            })}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row) => (
                            <TableRow key={row.feature} hover>
                                <TableCell
                                    sx={{
                                        fontWeight: 600,
                                        color: "#2b0f1f",
                                        borderBottom: "1px solid #f1e7ee",
                                    }}
                                >
                                    {row.feature}
                                </TableCell>
                                {row.values.map((value, i) => {
                                    const isJustTransfer = columns[i] === "JustTransfer";
                                    return (
                                        <TableCell
                                            key={`${row.feature}-${columns[i]}`}
                                            align="center"
                                            sx={{
                                                backgroundColor: isJustTransfer ? "#fff5fa" : "transparent",
                                                borderBottom: "1px solid #f1e7ee",
                                            }}
                                        >
                                            <CellValue value={value} />
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Box sx={{ mt: 3, textAlign: "center" }}>
                <Typography variant="caption" sx={{ display: "block", color: "#9a7f8f" }}>
                    * Reflects justtransfer.ch's current default limits for free, accountless transfers. Self-hosted instances can configure these independently.
                </Typography>
                <Typography variant="caption" sx={{ display: "block", color: "#9a7f8f", mt: 0.5 }}>
                    Comparison based on each provider's publicly available free-tier information as of August 2026. Third-party features and pricing may change, check each provider's site for current details.
                </Typography>
            </Box>
        </Box>
    );
}