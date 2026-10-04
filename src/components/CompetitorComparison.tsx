import { useState } from "react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

import { useTranslation } from "react-i18next";

const HIGHLIGHT = "JustTransfer";
const competitors = ["WeTransfer", "SwissTransfer", "Blip"];
const columns = [HIGHLIGHT, ...competitors];

function getRows(t: any) {
    return [
        {
            id: "encyption",
            feature: t("encryption"),
            values: [true, false, false, true],
        },
        {
            id: "noEmailToSend",
            feature: t("noEmailToSend"),
            values: [true, true, false, false],
        },
        {
            id: "openSource",
            feature: t("openSource"),
            values: [true, false, t("mobile"), false],
        },
        {
            id: "withoutApp",
            feature: t("withoutApp"),
            values: [true, true, true, false],
        },
        {
            id: "offline",
            feature: t("offline"),
            values: [true, true, true, false],
        },
        {
            id: "multiple",
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

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const [selected, setSelected] = useState(competitors[0]);

    const visibleColumns = isMobile ? [HIGHLIGHT, selected] : columns;

    return (
        <Box
            sx={{
                width: "100%",
                maxWidth: 1400,
                mx: "auto",
                py: { xs: 2.5, md: 6 },
                px: { xs: 1, md: 4 },
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

                <Table
                    sx={{
                        minWidth: { xs: 0, md: 780 },
                        tableLayout: { xs: "fixed", md: "auto" },
                        "& .MuiTableCell-root": {
                            px: { xs: 0.75, md: 2 },
                            py: { xs: 1.25, md: 2 },
                            fontSize: { xs: "0.8125rem", md: "0.875rem" },
                        },
                    }}
                >
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ width: { xs: "32%", md: "auto" }, fontWeight: 700, backgroundColor: "#fafafa", borderBottom: "2px solid #f1e7ee", minWidth: { xs: 0, md: 160 } }}>
                                {t("feature")}
                            </TableCell>
                            {
                                visibleColumns.map((col) => {
                                    const isJustTransfer = col === HIGHLIGHT;
                                    return (
                                        <TableCell
                                            key={col}
                                            align="center"
                                            sx={{
                                                width: { xs: "34%", md: "auto" },
                                                fontSize: { xs: "0.75rem", md: "0.875rem" },
                                                fontWeight: 700,
                                                minWidth: { xs: 0, md: 150 },
                                                backgroundColor: isJustTransfer ? "#fbe3f0" : "#fafafa",
                                                borderBottom: isJustTransfer ? "2px solid #E906E5" : "2px solid #f1e7ee",
                                                color: isJustTransfer ? "primary.main" : "inherit",
                                            }}
                                        >
                                            {isMobile && !isJustTransfer ? (
                                                <Select
                                                    variant="standard"
                                                    disableUnderline
                                                    fullWidth
                                                    value={selected}
                                                    onChange={(e) => setSelected(e.target.value)}
                                                    IconComponent={KeyboardArrowDownIcon}
                                                    inputProps={{ "aria-label": t("compareWith") }}
                                                    MenuProps={{ slotProps: { paper: { sx: { borderRadius: 2, mt: 2 } } } }}
                                                    sx={{
                                                        font: "inherit",
                                                        fontWeight: 700,
                                                        color: "inherit",
                                                        "& .MuiSelect-select": {
                                                            font: "inherit",
                                                            fontWeight: 700,
                                                            py: 0,
                                                            pl: 0,
                                                            pr: "18px !important",
                                                            minHeight: 0,
                                                            display: "block",
                                                            textAlign: "center",
                                                            whiteSpace: "nowrap",
                                                            overflow: "hidden",
                                                            textOverflow: "ellipsis",
                                                            "&:focus": { backgroundColor: "transparent" },
                                                        },
                                                        "& .MuiSelect-icon": {
                                                            fontSize: 16,
                                                            right: 0,
                                                            color: "text.secondary",
                                                        },
                                                    }}
                                                >
                                                    {competitors.map((c) => (
                                                        <MenuItem key={c} value={c} sx={{ fontSize: "0.875rem" }}>
                                                            {c}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            ) : (
                                                col
                                            )}
                                        </TableCell>
                                    );
                                })
                            }
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row) => (
                            <TableRow key={row.id} hover>
                                <TableCell sx={{ fontWeight: 600, color: "#2b0f1f", borderBottom: "1px solid #f1e7ee" }}>
                                    {row.feature}
                                </TableCell>
                                {visibleColumns.map((col) => (
                                    <TableCell
                                        key={`${row.id}-${col}`}
                                        align="center"
                                        sx={{
                                            backgroundColor: col === HIGHLIGHT ? "#fff5fa" : "transparent",
                                            borderBottom: "1px solid #f1e7ee",
                                        }}
                                    >
                                        <CellValue value={row.values[columns.indexOf(col)]} />
                                    </TableCell>
                                ))}
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