import { useRef, useState, useCallback } from "react";

const SMOOTHING = 0.3; // 0 = no smoothing, 1 = infinitely smooth
const MIN_INTERVAL_S = 0.15; // ignore updates closer together than this (noise)

export function useSpeedMeter(totalBytes: number) {
    const lastTimeRef = useRef<number>(0);
    const lastBytesRef = useRef<number>(0);
    const smoothedRef = useRef<number>(0);
    const [speed, setSpeed] = useState<number>(0); // bytes/sec

    const updateProgress = useCallback((percent: number) => {
        if (!totalBytes) return;
        const now = performance.now();
        const bytes = (percent / 100) * totalBytes;

        if (lastTimeRef.current === 0) {
            lastTimeRef.current = now;
            lastBytesRef.current = bytes;
            return;
        }

        const deltaTime = (now - lastTimeRef.current) / 1000;
        if (deltaTime < MIN_INTERVAL_S) return;

        const deltaBytes = bytes - lastBytesRef.current;
        const instant = Math.max(0, deltaBytes / deltaTime);

        smoothedRef.current = smoothedRef.current === 0
            ? instant
            : SMOOTHING * instant + (1 - SMOOTHING) * smoothedRef.current;

        setSpeed(smoothedRef.current);
        lastTimeRef.current = now;
        lastBytesRef.current = bytes;
    }, [totalBytes]);

    const reset = useCallback(() => {
        lastTimeRef.current = 0;
        lastBytesRef.current = 0;
        smoothedRef.current = 0;
        setSpeed(0);
    }, []);

    return { speed, updateProgress, reset };
}