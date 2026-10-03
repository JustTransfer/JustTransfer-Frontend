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

import { useTranslation } from "react-i18next";


const columns = ["JustTransfer", "WeTransfer", "SwissTransfer", "Blip"];

function getRows(t: any) {
    return [
        {
            feature: t("encryption"),
            values: [true, false, false, true],
        },
        {
            feature: t("noEmailToSend"),
            values: [true, true, false, false],
        },
        {
            feature: t("openSource"),
            values: [true, false, t("mobile"), false],
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

    const { t } = useTranslation("comparison");
    const rows = getRows(t);

    return (
        <Box
            sx={{
                width: "100%",
                maxWidth: 1400,
                mx: "auto",
                py: { xs: 2.5, md: 6 },
                px: { xs: 2, md: 4 },
                backgroundColor: "#ffffff",
                borderRadius: 4,
                border: "1px solid #f1e7ee",
                boxShadow: "0 18px 40px rgba(83, 24, 60, 0.08)",
            }}
        >
            <Box sx={{ maxWidth: 1400, mx: "auto", textAlign: "center", mb: 5 }}>
                <Typography id={headingId} variant="h4" component="h2" sx={{ fontWeight: 700, mb: 1, fontSize: { xs: "1.5rem", md: "2.125rem" } }}>
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

            <Typography variant="caption" sx={{ mt: 3, textAlign: "center", display: "block", color: "#9a7f8f" }}>
                {t("footnote")}
            </Typography>
        </Box>
    );
}