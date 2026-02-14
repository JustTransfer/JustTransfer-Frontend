import { createContext, useContext, useEffect, useState } from "react";

type ServerConfig = {
    result: string;
    max_lifetime_anonymous: number;
    max_file_size_anonymous: number,
    max_downloads_anonymous: number,
    max_lifetime_connected: number,
    max_file_size_connected: number,
    max_downloads_connected: number,
    max_lifetime_connected_premium: number,
    max_file_size_connected_premium: number,
    max_downloads_connected_premium: number,
};

type ServerConfigContextType = {
    config: ServerConfig | null;
};

const ServerConfigContext = createContext<ServerConfigContextType | undefined>(undefined);

export const ServerConfigProvider = ({ children }: any) => {
    const [config, setConfig] = useState<ServerConfig | null>(null);

    useEffect(() => {
        const fetchConfig = async () => {
            const res = await fetch("/api/config");
            const data = await res.json();
            console.log("Fetched server config:", data);
            setConfig(data);
        };

        fetchConfig();
    }, []);

    return (
        <ServerConfigContext.Provider value={{ config }}>
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
