import { useEffect } from "react";
import { useLocation } from "react-router";
import { frontendUrl } from "../handlers/config";

export default function Seo({ title, description }: { title: string; description: string }) {
    const { pathname } = useLocation();
    const canonicalPath = pathname === "/" ? "/en" : pathname.replace(/\/+$/, "");

    useEffect(() => {
        let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');

        if (!canonical) {
            canonical = document.createElement("link");
            canonical.rel = "canonical";
            document.head.appendChild(canonical);
        }

        canonical.href = `${frontendUrl}${canonicalPath}`;
    }, [canonicalPath]);

    return (
        <>
            <title>{title}</title>
            <meta name="description" content={description} />
        </>
    );
}