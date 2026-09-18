import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useTranslation } from "react-i18next";

type FaqItem = {
    question: string;
    answer: React.ReactNode;
};

export default function Faq({ headingId }: { headingId?: string }) {
    const { t } = useTranslation("faq");
    const faqItems: FaqItem[] = Array.from({ length: 6 }, (_, index) => ({
        question: t(`q${index + 1}`),
        answer: t(`a${index + 1}`),
    }));
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqItems.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
                "@type": "Answer",
                text: item.answer,
            },
        })),
    };

    const midpoint = Math.ceil(faqItems.length / 2);
    const leftColumn = faqItems.slice(0, midpoint);
    const rightColumn = faqItems.slice(midpoint);

    const renderAccordion = (item: FaqItem, index: number) => (
        <Accordion
            key={item.question}
            disableGutters
            elevation={0}
            sx={{
                border: "1px solid #f1e7ee",
                borderRadius: "12px !important",
                mb: 1.5,
                "&:before": { display: "none" },
                overflow: "hidden",
            }}
        >
            <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: "primary.main" }} />}
                aria-controls={`faq-content-${index}`}
                id={`faq-header-${index}`}
            >
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {item.question}
                </Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Typography variant="body1" sx={{ color: "#6f5164" }}>
                    {item.answer}
                </Typography>
            </AccordionDetails>
        </Accordion>
    );

    return (
        <Box
            id="faq"
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
            {/* Structured data for search engines */}
            <script
                type="application/ld+json"
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <Box sx={{ maxWidth: 1400, mx: "auto", textAlign: "center", mb: 6 }}>
                <Typography id={headingId} variant="h4" component="h2" sx={{ fontWeight: 700, mb: 1 }}>
                    {t("title")}
                </Typography>
                <Typography variant="body1" sx={{ color: "#7a6474", fontSize: "1.05rem" }}>
                    {t("subtitle")}
                </Typography>
            </Box>

            <Box
                sx={{
                    maxWidth: 1400,
                    mx: "auto",
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                    gap: { xs: 0, md: 3 },
                }}
            >
                <Box>{leftColumn.map((item, i) => renderAccordion(item, i))}</Box>
                <Box>{rightColumn.map((item, i) => renderAccordion(item, i + midpoint))}</Box>
            </Box>
        </Box>
    );
}