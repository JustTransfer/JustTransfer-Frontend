import React, { createContext, useContext, useState } from "react";

import { Snackbar, Alert } from "@mui/material";

type NotificationType = "success" | "error" | "info" | "warning";

type Notification = {
    message: string;
    type: NotificationType;
};

type NotificationContextType = {
    notify: (message: string, type?: NotificationType) => void;
    success: (message: string) => void;
    error: (message: string) => void;
};

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const [notification, setNotification] = useState<Notification | null>(null);
    const [open, setOpen] = useState(false);

    const notify = (message: string, type: NotificationType = "info") => {
        setNotification({ message, type });
        setOpen(true);
    };

    const success = (msg: string) => notify(msg, "success");
    const error = (msg: string) => notify(msg, "error");

    return (
        <NotificationContext.Provider value={{ notify, success, error }}>
            {children}

            <Snackbar
                open={open && !!notification}
                autoHideDuration={2500}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                onClose={() => setOpen(false)}
            >
                <Alert severity={notification?.type ?? "info"} variant="filled" sx={{ width: "100%" }}>
                    {notification?.message ?? ""}
                </Alert>
            </Snackbar>
        </NotificationContext.Provider>
    );
}

export const useNotification = () => {
    const ctx = useContext(NotificationContext);
    if (!ctx) throw new Error("useNotification must be used inside NotificationProvider");
    return ctx;
};