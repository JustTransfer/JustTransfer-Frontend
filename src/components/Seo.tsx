import { useEffect } from "react";
import { useLocation } from "react-router";
import { isSupportedLang } from "../hooks/useLangRedirect";
import { supportedLanguages } from "../i18n";
import { frontendUrl } from "../handlers/config";

const baseUrl = frontendUrl.replace(/\/+$/, "");

function upsertHeadTag(selector: string, tagName: "meta" | "link", attributes: Record<string, string>) {
    let element = document.head.querySelector(selector);
    if (!element) {
        element = document.createElement(tagName);
        document.head.appendChild(element);
    }
    Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value));
}

export default function Seo({ title, description }: { title: string; description: string }) {
    const { pathname } = useLocation();

    // "/" and "//" collapse to "" after stripping, so they fall back to "/en"
    const canonicalPath = pathname.replace(/\/+$/, "") || "/en";
    const canonicalUrl = `${baseUrl}${canonicalPath}`;

    const segment = canonicalPath.split("/")[1];
    const hasLang = isSupportedLang(segment);
    const lang = hasLang ? segment : "en";
    const localizedPath = hasLang ? canonicalPath.slice(segment.length + 1) : canonicalPath;

    useEffect(() => {
        document.title = title;
        document.documentElement.lang = lang;

        upsertHeadTag('meta[name="description"]', "meta", { name: "description", content: description });
        upsertHeadTag('link[rel="canonical"]', "link", { rel: "canonical", href: canonicalUrl });

        const alternates = [...supportedLanguages, "x-default"].map((hreflang) => {
            const link = document.createElement("link");
            link.rel = "alternate";
            link.hreflang = hreflang;
            link.href = `${baseUrl}/${hreflang === "x-default" ? "en" : hreflang}${localizedPath}`;
            return link;
        });
        document.head.append(...alternates);

        return () => alternates.forEach((link) => link.remove());
    }, [title, description, canonicalUrl, lang, localizedPath]);

    return null;
}