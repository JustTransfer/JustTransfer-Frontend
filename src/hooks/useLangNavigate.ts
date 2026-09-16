import { useCallback } from "react";
import { useNavigate, useLocation, type NavigateOptions } from "react-router";
import { supportedLanguages } from "../i18n";

function getLangFromPath(pathname: string): string {
  const seg = pathname.split("/")[1];
  return supportedLanguages.includes(seg as (typeof supportedLanguages)[number])
    ? seg
    : "en";
}

export function useLangNavigate() {
  const navigate = useNavigate();
  const location = useLocation();

  return useCallback(
    (path: string, options?: NavigateOptions) => {
      const lng = getLangFromPath(location.pathname);
      const prefixed = path.startsWith("/") ? `/${lng}${path}` : path;
      navigate(prefixed, options);
    },
    [navigate, location.pathname],
  );
}

export function useLangPath() {
  const location = useLocation();
  return useCallback(
    (path: string) => `/${getLangFromPath(location.pathname)}${path}`,
    [location.pathname],
  );
}
