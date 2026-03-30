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

  return `${(bytes / (1024 * 1024 * 1024 * 1024)).toFixed(1)} TiB`;
};


export function isPasswordStrong(password: string): [number, boolean] {
  const tested = zxcvbn(password);
  return [tested.score, tested.score >= 3];
}

const DAY = 86400000;

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