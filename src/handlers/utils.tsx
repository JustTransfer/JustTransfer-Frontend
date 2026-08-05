// @ts-ignore
import streamSaver from 'streamsaver';

const DAY = 86400000; // milliseconds in a day

// Dynamically import libsodium-wrappers
let sodiumPromise: Promise<typeof import("libsodium-wrappers-sumo")> | null = null;
export async function getSodium() {
  if (!sodiumPromise) {
    sodiumPromise = import("libsodium-wrappers-sumo");
  }

  const { default: sodium } = await sodiumPromise;
  await sodium.ready;
  return sodium;
}

// Dynamically import @serenity-kit/opaque
let opaquePromise: Promise<typeof import("@serenity-kit/opaque")> | null = null;
export async function getOpaque() {
  if (!opaquePromise) {
    opaquePromise = import("@serenity-kit/opaque");
  }

  const opaque = await opaquePromise;
  await opaque.ready;

  return opaque;
}

// Generic download function
export async function genericDownloadFile({
  fileName,
  download,
  onProgress,
  onSuccess,
  onError,
}: {
  fileName: string;
  download: (
    onChunk: (chunk: Uint8Array, name: string) => Promise<void>,
    onProgress: (percent: number) => void
  ) => Promise<void>;
  onProgress: (percent: number) => void;
  onSuccess?: () => void;
  onError?: () => void;
}) {
  try {
    const supportsStreaming =
      typeof streamSaver !== "undefined" &&
      "serviceWorker" in navigator &&
      window.WritableStream;

    if (supportsStreaming) {
      console.log("Using StreamSaver for streaming download");

      const fileStream = streamSaver.createWriteStream(fileName);
      const writer = fileStream.getWriter();

      try {
        await download(
          async (chunk) => {
            await writer.write(chunk);
          },
          onProgress
        );
      } catch (e) {
        await writer.abort(e);
        throw e;
      }

      await writer.close();
    } else {
      console.log("Using fallback blob download");

      const chunks: Uint8Array[] = [];

      await download(
        async (chunk) => {
          chunks.push(new Uint8Array(chunk));
        },
        onProgress
      );

      const blob = new Blob(chunks as BlobPart[], {
        type: "application/octet-stream",
      });

      const url = URL.createObjectURL(blob);

      try {
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        a.style.display = "none";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } finally {
        URL.revokeObjectURL(url);
      }
    }

    onSuccess?.();
  } catch (e) {
    onError?.();
    throw e;
  }
}

export const formatSize = (bytes: any) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KiB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MiB`;
  if (bytes < 1024 * 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GiB`;

  return `${(bytes / (1024 * 1024 * 1024 * 1024)).toFixed(1)} TiB`;
};

export function getExpiration(msg: any) {
  const created = new Date(msg.creation_time);
  const expire = new Date(created.getTime() + msg.lifetime * DAY);
  const now = new Date();

  // calendar normalized dates
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const expDay = new Date(expire.getFullYear(), expire.getMonth(), expire.getDate());

  const dayDiff = Math.round((expDay.getTime() - today.getTime()) / DAY);

  return {
    created,
    expire,
    now,
    dayDiff,
    expired: now >= expire
  };
}

export function formatCreated(date: string) {
  const d = new Date(date);
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export function expireColor(msg: any) {
  const { dayDiff, expired } = getExpiration(msg);

  if (expired) return "error.main";
  if (dayDiff < 1) return "warning.main";
  return "text.secondary";
}

export function relativeExpire(msg: any, short = false) {
  const { expire, dayDiff, expired } = getExpiration(msg);

  if (expired) return "Expired";

  const time = expire.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  if (dayDiff === 0)
    return short ? `Today at ${time}` : `Expires today at ${time}`;

  if (dayDiff === 1)
    return short ? `Tomorrow at ${time}` : `Expires tomorrow at ${time}`;

  // return `Expires ${expire.toLocaleDateString()} at ${time}`;
  return short ? `${expire.toLocaleDateString()} at ${time}` : `Expires on ${expire.toLocaleDateString()} at ${time}`;
}

export function parseTransferLink(fullLink: string): { transferId: string; password: string } {
  try {
    const url = new URL(fullLink);
    const transferId = url.pathname.split("/").filter(Boolean).pop() ?? "";
    const password = url.hash.substring(1);
    return { transferId, password };
  } catch {
    return { transferId: "", password: "" };
  }
}