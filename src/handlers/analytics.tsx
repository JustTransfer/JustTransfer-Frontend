export function trackEvent(name: string, data?: Record<string, unknown>) {
    try {
        (window as any).umami?.track(name, data);
    } catch (e) {
        console.error("Umami tracking failed:", e);
    }
}

export const AnalyticsEvent = {
    SIGNUP: "account_created",
    TRANSFER_CREATED: "transfer_created",
    SUBSCRIPTION_CHECKOUT_STARTED: "subscription_checkout_started",
    SUBSCRIPTION_ACTIVATED: "subscription_activated",
    SUBSCRIPTION_CANCEL_STARTED: "subscription_cancel_started",
    ACCOUNT_DELETED: "account_deleted",
} as const;