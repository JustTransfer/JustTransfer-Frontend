import { useLocation } from "react-router";
import { frontendUrl } from "../handlers/config";

export default function Seo({ title, description }: { title: string; description: string }) {
    const { pathname } = useLocation();

    return (
        <>
            <title>{title}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={`${frontendUrl}${pathname}`} />
        </>
    );
}