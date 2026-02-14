import { Base64 } from "js-base64";
import zxcvbn from "zxcvbn";

import * as errors from "../messages/errors";
import * as strings from "../messages/strings";


function getItemFromSessionStorage(key: string): Uint8Array {
  const item = sessionStorage.getItem(key);
  if (!item) {
    throw new Error(errors.errorMissingKeyInSessionStorage);
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


function isPasswordStrong(password: string): [number, boolean] {
  const tested = zxcvbn(password);
  return [tested.score, tested.score >= 3];
}

export { getItemFromSessionStorage, isPasswordStrong, formatSize };