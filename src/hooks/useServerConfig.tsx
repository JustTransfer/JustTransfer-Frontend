import { createContext, useContext, useEffect, useState } from "react";

type ServerConfig = {
    result: string;
    max_lifetime_link: number;
    max_file_size_link: number,
    max_downloads_link: number,
    price_connected: number,
    max_lifetime_connected: number,
    max_file_size_connected: number,
    max_downloads_connected: number,
    max_transfer_month_connected: number,
    price_premium: number,
    max_lifetime_connected_premium: number,
    max_file_size_connected_premium: number,
    max_downloads_connected_premium: number,
    max_transfer_month_connected_premium: number,
};

type ServerConfigContextType = {
    config: ServerConfig | null;
    isLoading: boolean;
    error: string | null;
};


const ServerConfigContext = createContext<ServerConfigContextType | undefined>(undefined);

export const ServerConfigProvider = ({ children }: any) => {
    const [config, setConfig] = useState<ServerConfig | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const res = await fetch("/api/config");
                if (!res.ok) throw new Error("Failed to load config");
                const data = await res.json();
                setConfig(data);
            } catch (e: any) {
                setError(e.message || "Failed to load config");
            } finally {
                setIsLoading(false);
            }
        };
        fetchConfig();
    }, []);

    return (
        <ServerConfigContext.Provider value={{ config, isLoading, error }}>
            {children}
        </ServerConfigContext.Provider>
    );
};

export const useServerConfig = () => {
    const context = useContext(ServerConfigContext);
    if (!context) {
        throw new Error("useServerConfig must be used within ServerConfigProvider");
    }
    return context;
};
