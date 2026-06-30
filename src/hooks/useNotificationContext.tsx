import React, { createContext, useContext, useState } from "react";

import { Snackbar, Alert } from "@mui/material";

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

            {notifications.map((n, index) => (
                <Snackbar
                    key={n.id}
                    open
                    autoHideDuration={3000}
                    onClose={() => remove(n.id)}
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    sx={{
                        bottom: `${24 + index * 70}px` // stacking offset
                    }}
                >
                    <Alert
                        severity={n.type}
                        variant="filled"
                        sx={{ width: "100%" }}
                        onClose={() => remove(n.id)}
                    >
                        {n.message}
                    </Alert>
                </Snackbar>
            ))}
        </NotificationContext.Provider>
    );
}

export const useNotification = () => {
    const ctx = useContext(NotificationContext);
    if (!ctx) throw new Error("useNotification must be used inside NotificationProvider");
    return ctx;
};