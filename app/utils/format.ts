import type { ConcertEventStatus, ConcertSummary } from "~/types/content";
import { DEFAULT_LANG, LOCALES, type Lang } from "~/i18n/config";

const DEFAULT_TZ = "Europe/Moscow";

/**
 * Язык идёт последним параметром и по умолчанию русский: админка остаётся
 * русскоязычной и её вызовы не меняются, а публичные страницы передают свой.
 */
function formatter(
  options: Intl.DateTimeFormatOptions,
  timeZone: string,
  lang: Lang,
): Intl.DateTimeFormat {
  return new Intl.DateTimeFormat(LOCALES[lang], { timeZone, ...options });
}

export function formatDate(
  date: Date,
  timeZone: string = DEFAULT_TZ,
  lang: Lang = DEFAULT_LANG,
): string {
  return formatter({ day: "numeric", month: "long", year: "numeric" }, timeZone, lang).format(date);
}

export function formatShortDate(
  date: Date,
  timeZone: string = DEFAULT_TZ,
  lang: Lang = DEFAULT_LANG,
): string {
  return formatter({ day: "2-digit", month: "2-digit", year: "numeric" }, timeZone, lang).format(date);
}

export function formatTime(
  date: Date,
  timeZone: string = DEFAULT_TZ,
  lang: Lang = DEFAULT_LANG,
): string {
  return formatter({ hour: "2-digit", minute: "2-digit" }, timeZone, lang).format(date);
}

export function formatDateTime(
  date: Date,
  timeZone: string = DEFAULT_TZ,
  lang: Lang = DEFAULT_LANG,
): string {
  return `${formatDate(date, timeZone, lang)}, ${formatTime(date, timeZone, lang)}`;
}

export function formatDayNumber(
  date: Date,
  timeZone: string = DEFAULT_TZ,
  lang: Lang = DEFAULT_LANG,
): string {
  return formatter({ day: "numeric" }, timeZone, lang).format(date);
}

/** Месяц целиком: «окт» экономило место, но читалось хуже в крупной вёрстке афиши. */
export function formatMonthShort(
  date: Date,
  timeZone: string = DEFAULT_TZ,
  lang: Lang = DEFAULT_LANG,
): string {
  return formatter({ month: "long" }, timeZone, lang).format(date);
}

export function toIsoDate(date: Date): string {
  return date.toISOString();
}

export function isUpcoming(concert: ConcertSummary, now = new Date()): boolean {
  return concert.startsAt.getTime() >= now.getTime();
}

/** Русские подписи для админки: публичная часть берёт их из словаря. */
export const CONCERT_STATUS_LABELS: Record<ConcertEventStatus, string> = {
  ANNOUNCED: "Анонсирован",
  SOLD_OUT: "Билеты проданы",
  CANCELLED: "Концерт отменён",
  POSTPONED: "Концерт перенесён",
  COMPLETED: "Состоялся",
};

export function pluralize(count: number, forms: [string, string, string]): string {
  const mod100 = count % 100;
  const mod10 = count % 10;
  if (mod100 >= 11 && mod100 <= 14) return forms[2];
  if (mod10 === 1) return forms[0];
  if (mod10 >= 2 && mod10 <= 4) return forms[1];
  return forms[2];
}
