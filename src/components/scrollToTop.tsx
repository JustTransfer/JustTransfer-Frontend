import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";


export default function ScrollToTop() {
    const location = useLocation();
    const prevPath = useRef(location.pathname);

    useEffect(() => {
        // Scroll only if the pathname did NOT change
        if (prevPath.current === location.pathname) {
            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        } else {
            // Scroll to top immediately if the pathname changed
            window.scrollTo(0, 0);
        }
        // Update the previous path to the current path
        prevPath.current = location.pathname;
    }, [location]);

    return null;
}