export const SITE_URL = (
  import.meta.env.VITE_PUBLIC_SITE_URL ?? "https://axrock.band"
).replace(/\/$/, "");

/** Backend живёт на отдельном домене — запросы всегда cross-origin. */
export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? "https://api.monoroh.com/api/axrock"
).replace(/\/$/, "");

export const IS_BROWSER = typeof document !== "undefined";

/**
 * Счётчик Яндекс.Метрики. Номер не секрет — он всё равно виден в исходном коде
 * страницы, поэтому лежит рядом с остальными адресами, а не в переменных сборки.
 */
export const METRIKA_ID = 111610948;

/**
 * Локальная разработка. Сравнивать с каноническим адресом нельзя: сайт может
 * отдаваться и с адреса GitHub Pages, пока свой домен не подключён, — счётчик
 * тогда не включился бы вовсе. Свои визиты со стейджа отсекаются фильтром
 * по IP в самой Метрике.
 */
export function isLocalHost(): boolean {
  if (!IS_BROWSER) return false;
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1" || host.endsWith(".local");
}

export function canonicalUrl(pathname: string): string {
  if (pathname === "/") return `${SITE_URL}/`;
  return `${SITE_URL}${pathname.replace(/\/$/, "")}`;
}
