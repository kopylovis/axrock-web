export const SITE_URL = (
  import.meta.env.VITE_PUBLIC_SITE_URL ?? "https://axrock.band"
).replace(/\/$/, "");

/** Backend живёт на отдельном домене — запросы всегда cross-origin. */
export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? "https://api.monoroh.com/api/axrock"
).replace(/\/$/, "");

export const IS_BROWSER = typeof document !== "undefined";

export function canonicalUrl(pathname: string): string {
  if (pathname === "/") return `${SITE_URL}/`;
  return `${SITE_URL}${pathname.replace(/\/$/, "")}`;
}
