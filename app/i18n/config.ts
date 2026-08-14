export const LANGS = ["ru", "en"] as const;

export type Lang = (typeof LANGS)[number];

export const DEFAULT_LANG: Lang = "ru";

/** Префикс английской версии. Русская живёт в корне — она основная. */
const EN_PREFIX = "/en";

export function langFromPath(pathname: string): Lang {
  return pathname === EN_PREFIX || pathname.startsWith(`${EN_PREFIX}/`) ? "en" : "ru";
}

/** Путь без языкового префикса: /en/music → /music. */
export function stripLang(pathname: string): string {
  if (pathname === EN_PREFIX) return "/";
  if (pathname.startsWith(`${EN_PREFIX}/`)) return pathname.slice(EN_PREFIX.length);
  return pathname;
}

/** Тот же путь на выбранном языке. */
export function withLang(pathname: string, lang: Lang): string {
  const base = stripLang(pathname);
  if (lang === DEFAULT_LANG) return base;
  return base === "/" ? EN_PREFIX : `${EN_PREFIX}${base}`;
}

/** Локаль для Intl: даты и числа. */
export const LOCALES: Record<Lang, string> = {
  ru: "ru-RU",
  en: "en-GB",
};

export const OG_LOCALES: Record<Lang, string> = {
  ru: "ru_RU",
  en: "en_GB",
};

/**
 * Значение поля с учётом языка. Английский перевод в админке необязателен:
 * пока его нет, показываем русский оригинал, а не пустое место.
 */
export function pick<T>(lang: Lang, ru: T | null | undefined, en: T | null | undefined): T | null {
  if (lang !== "en") return ru ?? null;
  if (typeof en === "string") return en.trim() ? en : (ru ?? null);
  return en ?? ru ?? null;
}

/** То же для обязательного поля: русский текст всегда есть. */
export function pickText(lang: Lang, ru: string, en: string | null | undefined): string {
  return lang === "en" && en?.trim() ? en : ru;
}
