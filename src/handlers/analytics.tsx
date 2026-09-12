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

const FILE_SIZE_BUCKETS: { maxBytes: number; label: string }[] = [
    { maxBytes: 1_000_000, label: "<1MB" },
    { maxBytes: 10_000_000, label: "1-10MB" },
    { maxBytes: 100_000_000, label: "10-100MB" },
    { maxBytes: 1_000_000_000, label: "100MB-1GB" },
    { maxBytes: 10_000_000_000, label: "1-10GB" },
    { maxBytes: Infinity, label: "10GB+" },
];

export function bucketFileSize(bytes: number): string {
    const match = FILE_SIZE_BUCKETS.find(b => bytes < b.maxBytes);
    return match ? match.label : "unknown";
}