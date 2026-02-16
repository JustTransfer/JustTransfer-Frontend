import { Base64 } from "js-base64";
import zxcvbn from "zxcvbn";

import * as errors from "../messages/errors";
import * as strings from "../messages/strings";


const MIN_LENGTH_USERNAME = 3;
const MAX_LENGTH_USERNAME = 32;

export function isValidUsername(username: string): Boolean {

  if (username.length < MIN_LENGTH_USERNAME || username.length > MAX_LENGTH_USERNAME) {
    return false;
  }

  return /^[a-zA-Z0-9-]+$/.test(username);
}


export const formatSize = (bytes: any) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KiB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MiB`;
  if (bytes < 1024 * 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GiB`;

  return `${(bytes / (1024 * 1024 * 1024 * 1024)).toFixed(1)} TB`;
};


export function isPasswordStrong(password: string): [number, boolean] {
  const tested = zxcvbn(password);
  return [tested.score, tested.score >= 3];
}