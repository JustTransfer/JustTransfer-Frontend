import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

type FaqItem = {
    question: string;
    answer: React.ReactNode;
};

const faqItems = [
    {
        question: "Do I need an account to send a file?",
        answer: "No. Guest transfers work without an account — just upload your file, set a password, and share the link. Creating a free account unlocks extra features like managing transfers after sending, emailing recipients directly, and higher limits with a Premium plan.",
    },
    {
        question: "How is my data encrypted?",
        answer: "Files and filenames are encrypted on your device before they ever leave it, using a password you choose. Because encryption happens client-side, JustTransfer never has access to your unencrypted files — we couldn't read them even if asked to.",
    },
    {
        question: "Where is JustTransfer based, and where is my data stored?",
        answer: "JustTransfer is based in Switzerland and your files are stored exclusively on Swiss infrastructure, governed by Swiss data protection law. The only exception is billing information for Premium subscriptions, which is handled by our payment processor, Stripe — full details are in our Privacy Policy.",
    },
    {
        question: "What happens if I cancel my Premium plan?",
        answer: "You keep full Premium access until the end of your current billing period, then your account automatically reverts to the free plan.",
    },
    {
        question: "What happens to my files after they expire?",
        answer: "Files are automatically and permanently deleted once they reach their expiry date or download limit, whichever comes first — there's no recovering them afterward, so keep your own backup of anything important.",
    },
    {
        question: "Is JustTransfer open source?",
        answer: (
            <>
                Yes. The full source is public on{" "}
                <a href="https://github.com/JustTransfer/" target="_blank" rel="noopener noreferrer">
                    GitHub
                </a>
                , so anyone can inspect, audit, or contribute to it — and if you'd rather run your own instance, you're free to self-host it and control your own infrastructure and limits.
            </>
        ),
    },
];

export default function Faq({ headingId }: { headingId?: string }) {
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