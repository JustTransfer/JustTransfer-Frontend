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
import { useTranslation } from "react-i18next";


const columns = ["JustTransfer", "WeTransfer", "SwissTransfer", "Blip"];

function getRows(maxFileSizeLabel: string, expirationDays: string, maxDownloads: string, t: any) {
    return [
        {
            feature: t("maxSize"),
            values: [`${maxFileSizeLabel}*`,
                "100 GB",
                "50 GB",
                "No limit (P2P)"
            ],
        },
        {
            feature: t("encryption"),
            values: [true, false, false, true],
        },
        {
            feature: t("email"),
            values: [t("no"), t("no"), t("yes"), t("yes")],
        },
        {
            feature: t("openSource"),
            values: [true, false, t("mobile"), false],
        },
        {
            feature: t("expiration"),
            values: [
                t("chooseDays", { value: expirationDays }),
                t("chooseProviderDays", { value: 7 }),
                t("chooseProviderDays", { value: 30 }),
                t("instant"),
            ],
        },
        {
            feature: t("downloadLimit"),
            values: [
                t("chooseDownloads", { value: maxDownloads }),
                t("noLimit"),
                t("chooseProviderDownloads"),
                t("oneDownload"),
            ],
        },
        {
            feature: t("withoutApp"),
            values: [true, true, true, false],
        },
        {
            feature: t("offline"),
            values: [true, true, true, false],
        },
        {
            feature: t("multiple"),
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

export type CompetitorComparisonProps = {
    headingId?: string;
};

export default function CompetitorComparison({ headingId }: CompetitorComparisonProps) {

    const { config } = useServerConfig();
    const { t } = useTranslation("comparison");

    const maxFileSizeLabel = config?.max_file_size_link != null
        ? formatSize(config.max_file_size_link)
        : "...";
    const expiration_days = String(config?.max_lifetime_link ?? "...");
    const max_downloads = String(config?.max_downloads_link ?? "...");
    const rows = getRows(maxFileSizeLabel, expiration_days, max_downloads, t);

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
                <Typography id={headingId} variant="h4" component="h2" sx={{ fontWeight: 700, mb: 1 }}>
                    {t("title")}
                </Typography>
                <Typography variant="body1" sx={{ color: "#7a6474", fontSize: "1.05rem" }}>
                    {t("subtitle")}
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
                                {t("feature")}
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
                    {t("footnote1")}
                </Typography>
                <Typography variant="caption" sx={{ display: "block", color: "#9a7f8f", mt: 0.5 }}>
                    {t("footnote2")}
                </Typography>
            </Box>
        </Box>
    );
}