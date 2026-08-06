import { parseUtcDate } from "~/api/mappers";

export { formatDate, formatDateTime, formatTime } from "./format";

export function parseUtcSafe(value: string | null | undefined): Date {
  return parseUtcDate(value) ?? new Date(0);
}

/** Значение для <input type="datetime-local"> в указанном часовом поясе. */
export function toDateTimeLocalValue(value: string | null | undefined, timeZone = "Europe/Moscow"): string {
  const date = parseUtcDate(value);
  if (!date) return "";

  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);

  return parts.replace(" ", "T");
}

/** Обратное преобразование: локальное время площадки → UTC ISO для backend. */
export function fromDateTimeLocalValue(value: string, timeZone = "Europe/Moscow"): string | null {
  if (!value) return null;

  const naive = new Date(`${value}:00Z`);
  if (Number.isNaN(naive.getTime())) return null;

  const offsetProbe = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "longOffset",
  })
    .formatToParts(naive)
    .find((part) => part.type === "timeZoneName")?.value;

  const match = /GMT([+-])(\d{2}):(\d{2})/.exec(offsetProbe ?? "");
  if (!match) return naive.toISOString();

  const sign = match[1] === "-" ? 1 : -1;
  const offsetMinutes = sign * (Number(match[2]) * 60 + Number(match[3]));

  return new Date(naive.getTime() + offsetMinutes * 60_000).toISOString();
}

export function toDateInputValue(value: string | null | undefined): string {
  const date = parseUtcDate(value);
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

export function fromDateInputValue(value: string): string | null {
  return value ? new Date(`${value}T00:00:00Z`).toISOString() : null;
}

export function slugify(input: string): string {
  const map: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z",
    и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r",
    с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "c", ч: "ch", ш: "sh", щ: "sch",
    ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
  };

  return input
    .toLowerCase()
    .split("")
    .map((char) => map[char] ?? char)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
