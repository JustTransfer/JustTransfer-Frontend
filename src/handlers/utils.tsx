import { Base64 } from "js-base64";


function getItemFromSessionStorage(key: string): Uint8Array {
  const item = sessionStorage.getItem(key);
  if (!item) {
    throw new Error(`Item ${key} not found in session storage`);
  }

  return Base64.toUint8Array(item);
}


const formatSize = (bytes: any) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KiB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MiB`;
  if (bytes < 1024 * 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GiB`;

  return `${(bytes / (1024 * 1024 * 1024 * 1024)).toFixed(1)} TB`;
};

export { getItemFromSessionStorage, formatSize };