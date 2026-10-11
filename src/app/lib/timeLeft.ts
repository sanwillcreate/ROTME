// Replaces getRemainingTime() in the campaign and pick route pages.
// Drop-in replacement for getRemainingTime() in the campaign route
// (src/app/campaign/[id]/page.tsx) and the pick route header. Returns
// "Ended" / "Open-ended" / "3d 4h remaining" / "5h 12m remaining" / "42m remaining".
// Never returns an em dash.
import type { Campaign } from "../campaign/[id]/data";

const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;

export function getTimeLeft(
  endsAt: string | null,
  storedStatus: string | null
): string {
  if (storedStatus === "Ended") return "Ended";
  if (!endsAt) return "Open-ended";

  const diff = new Date(endsAt).getTime() - Date.now();
  if (diff <= 0) return "Ended";

  const days = Math.floor(diff / DAY_MS);
  const hours = Math.floor((diff % DAY_MS) / HOUR_MS);
  const minutes = Math.floor((diff % HOUR_MS) / MINUTE_MS);

  if (days > 0) return `${days}d ${hours}h remaining`;
  if (hours > 0) return `${hours}h ${minutes}m remaining`;
  return `${minutes}m remaining`;
}

// Usage inside the route, after the Supabase select:
export function buildStatus(
  timeLeft: string,
  storedStatus: string | null
): Campaign["status"] {
  if (timeLeft === "Ended") return "Ended";
  return storedStatus === "Ending soon" ? "Ending soon" : "Active";
}