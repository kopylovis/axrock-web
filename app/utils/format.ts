import type { ConcertEventStatus, ConcertSummary } from "~/types/content";

const DEFAULT_TZ = "Europe/Moscow";

function formatter(options: Intl.DateTimeFormatOptions, timeZone: string): Intl.DateTimeFormat {
  return new Intl.DateTimeFormat("ru-RU", { timeZone, ...options });
}

export function formatDate(date: Date, timeZone = DEFAULT_TZ): string {
  return formatter({ day: "numeric", month: "long", year: "numeric" }, timeZone).format(date);
}

export function formatShortDate(date: Date, timeZone = DEFAULT_TZ): string {
  return formatter({ day: "2-digit", month: "2-digit", year: "numeric" }, timeZone).format(date);
}

export function formatTime(date: Date, timeZone = DEFAULT_TZ): string {
  return formatter({ hour: "2-digit", minute: "2-digit" }, timeZone).format(date);
}

export function formatDateTime(date: Date, timeZone = DEFAULT_TZ): string {
  return `${formatDate(date, timeZone)}, ${formatTime(date, timeZone)}`;
}

export function formatDayNumber(date: Date, timeZone = DEFAULT_TZ): string {
  return formatter({ day: "numeric" }, timeZone).format(date);
}

export function formatMonthShort(date: Date, timeZone = DEFAULT_TZ): string {
  return formatter({ month: "short" }, timeZone).format(date).replace(".", "");
}

export function toIsoDate(date: Date): string {
  return date.toISOString();
}

export function isUpcoming(concert: ConcertSummary, now = new Date()): boolean {
  return concert.startsAt.getTime() >= now.getTime();
}

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
