import React, { createContext, useContext, useState } from "react";

import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";

type NotificationType = "success" | "error" | "info" | "warning";

type NotificationContextType = {
    notify: (message: string, type?: NotificationType) => void;
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
    warning: (message: string) => void;
};

type NotificationItem = {
    id: number;
    message: string;
    type: NotificationType;
};

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {

    const NOTIFICATION_DURATION = 3000; // Duration in milliseconds

    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const counter = React.useRef(0);

    const notify = (message: string, type: NotificationType = "info") => {
        const id = counter.current++;
        setNotifications(n => [...n, { id, message, type }]);
    };

    const remove = (id: number) => {
        setNotifications(n => n.filter(t => t.id !== id));
    };

    const success = (msg: string) => notify(msg, "success");
    const error = (msg: string) => notify(msg, "error");
    const info = (msg: string) => notify(msg, "info");
    const warning = (msg: string) => notify(msg, "warning");

    return (
        <NotificationContext.Provider value={{ notify, success, error, info, warning }}>
            {children}

            <Box
                sx={{
                    position: "fixed",
                    bottom: 24,
                    right: 24,
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                    zIndex: (theme: any) => theme.zIndex.snackbar,
                }}
            >
                {notifications.map((n) => (
                    <Snackbar
                        key={n.id}
                        open
                        autoHideDuration={NOTIFICATION_DURATION}
                        onClose={() => remove(n.id)}
                        anchorOrigin={{
                            vertical: "bottom",
                            horizontal: "right",
                        }}
                        sx={{
                            position: "static",
                            transform: "none",
                        }}
                    >
                        <Alert
                            severity={n.type}
                            variant="filled"
                            onClose={() => remove(n.id)}
                        >
                            {n.message}
                        </Alert>
                    </Snackbar>
                ))}
            </Box>
        </NotificationContext.Provider>
    );
}

export const useNotification = () => {
    const ctx = useContext(NotificationContext);
    if (!ctx) throw new Error("useNotification must be used inside NotificationProvider");
    return ctx;
};