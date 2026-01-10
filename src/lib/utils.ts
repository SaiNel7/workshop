import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

/**
 * Format a timestamp as a relative time string
 * @param timestamp - Unix timestamp in milliseconds
 * @param options - Formatting options
 * @returns Formatted relative time string
 */
export function formatRelativeTime(
  timestamp: number,
  options?: {
    prefix?: string; // e.g., "Edited" -> "Edited 5m ago"
    recentLabel?: string; // Label for very recent (< 5s), e.g., "Saved" or "just now"
    showSeconds?: boolean; // Show seconds for times < 60s
  }
): string {
  const { prefix = "", recentLabel = "just now", showSeconds = false } = options || {};

  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);

  const addPrefix = (text: string) => (prefix ? `${prefix} ${text}` : text);

  // Very recent
  if (seconds < 5) return recentLabel;

  // Seconds (optional)
  if (seconds < 60) {
    return showSeconds ? addPrefix(`${seconds}s ago`) : recentLabel;
  }

  // Minutes
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return addPrefix(`${minutes}m ago`);

  // Hours
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return addPrefix(`${hours}h ago`);

  // Days
  const days = Math.floor(hours / 24);
  if (days < 7) return addPrefix(`${days}d ago`);

  // Older than a week - show date
  return new Date(timestamp).toLocaleDateString();
}
