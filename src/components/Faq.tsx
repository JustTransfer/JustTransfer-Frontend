import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

type FaqItem = {
    question: string;
    answer: string;
};

const faqItems = [
    {
        question: "Is JustTransfer free to use?",
        answer: "Yes. You can send encrypted file transfers as a guest with no account required. Creating a free account unlocks extra features like managing transfers after sending and notifying recipients by email.",
    },
    {
        question: "Do I need to create an account to send a file?",
        answer: "No. Guest transfers work without an account — just upload your file, set a password, and share the link. An account is only needed if you want to manage transfers later or email recipients directly.",
    },
    {
        question: "How is my data encrypted?",
        answer: "Files are encrypted end-to-end using a password you choose. Encryption happens before your file leaves your device, so JustTransfer never has access to your unencrypted data.",
    },
    {
        question: "Where is JustTransfer based, and where is my data stored?",
        answer: "JustTransfer is based in Switzerland, a country known for strong data protection laws. This gives your transfers an extra layer of legal and jurisdictional privacy.",
    },
    {
        question: "Is JustTransfer open source?",
        answer: "Yes. JustTransfer is fully open source, so anyone can inspect, audit, or contribute to the code. You can find the repository on GitHub.",
    },
    {
        question: "Can I self-host JustTransfer?",
        answer: "Yes. Since JustTransfer is open source, you can deploy your own instance and control your infrastructure and file size limits entirely.",
    },
    {
        question: "What happens to my files after they expire?",
        answer: "Files are automatically and permanently deleted once they reach their expiry date or download limit, whichever comes first.",
    },
];

export default function Faq() {
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
                <Typography variant="body2" sx={{ color: "#6f5164" }}>
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
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    Frequently asked questions
                </Typography>
                <Typography variant="body1" sx={{ color: "#7a6474", fontSize: "1.05rem" }}>
                    Everything you need to know about sending files with JustTransfer.
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