import type { LogisticsKind } from "~/api/admin-api";

export const LOGISTICS_LABELS: Record<LogisticsKind, string> = {
  TRAIN: "Поезд",
  FLIGHT: "Самолёт",
  CAR: "Машина",
  BUS: "Автобус",
  VENUE: "Площадка",
  OTHER: "Прочее",
};

export const LOGISTICS_OPTIONS = (Object.keys(LOGISTICS_LABELS) as LogisticsKind[]).map((key) => ({
  value: key,
  label: LOGISTICS_LABELS[key],
}));

/** «1 ч 20 мин» из суммы хронометража, посчитанной сервером. */
export function formatSetlistTotal(totalSeconds: number): string {
  if (totalSeconds <= 0) return "—";
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.round((totalSeconds % 3600) / 60);
  return hours > 0 ? `${hours} ч ${minutes} мин` : `${minutes} мин`;
}

/**
 * Деньги хранятся в копейках, чтобы не терять их на округлении.
 * На экране показываем привычные рубли.
 */
export function formatMoney(amountMinor: number, currency: string): string {
  const value = amountMinor / 100;
  try {
    return new Intl.NumberFormat("ru-RU", { style: "currency", currency }).format(value);
  } catch {
    // Незнакомый код валюты Intl не примет — показываем как есть.
    return `${value.toFixed(2)} ${currency}`;
  }
}

/** «1 234,56» → 123456 копеек. Принимаем и точку, и запятую. */
export function parseMoneyToMinor(input: string): number | null {
  const normalized = input.replace(/\s/g, "").replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  return Math.round(Number(normalized) * 100);
}

export function formatMoneyInput(amountMinor: number): string {
  return (amountMinor / 100).toFixed(2);
}

/**
 * Разбор сет-листа, вставленного текстом. Формат из рабочих списков группы:
 *
 *     -Уставший путник 3:20 (Хиро)
 *
 * Дефис и скобки необязательны, хронометраж ищется в конце строки.
 */
export function parseSetlistText(text: string): Array<{
  title: string;
  duration: string | null;
  note: string | null;
}> {
  return text
    .split("\n")
    .map((line) => line.trim().replace(/^[-–—•*]\s*/, ""))
    // Отбрасываем шапку: «СЕТ-ЛИСТ» и строку площадки вида «Москва» 1ч 20 мин.
    .filter((line) => line.length > 0 && !/^сет-?лист/i.test(line) && !/^[«"]/.test(line))
    .map((line) => {
      let rest = line;
      let note: string | null = null;

      const noteMatch = rest.match(/\(([^)]*)\)\s*$/);
      if (noteMatch?.index !== undefined) {
        note = (noteMatch[1] ?? "").trim() || null;
        rest = rest.slice(0, noteMatch.index).trim();
      }

      let duration: string | null = null;
      const timeMatch = rest.match(/(\d{1,2}:\d{2}(?::\d{2})?)\s*$/);
      if (timeMatch?.index !== undefined) {
        duration = timeMatch[1] ?? null;
        rest = rest.slice(0, timeMatch.index).trim();
      }

      return { title: rest, duration, note };
    })
    .filter((item) => item.title.length > 0);
}

/**
 * Разбор логистики, вставленной текстом. Опирается на структуру рабочих списков:
 * строка с датой открывает день, дальше идут события «время - описание (участники)»,
 * а строка без времени уточняет предыдущее событие.
 */
const MONTHS = [
  "январ", "феврал", "март", "апрел", "мая", "июн",
  "июл", "август", "сентябр", "октябр", "ноябр", "декабр",
];

export function parseLogisticsText(
  text: string,
  year: number,
): Array<{
  happensOn: string;
  timeLabel: string | null;
  title: string;
  details: string | null;
  participants: string[];
}> {
  const items: Array<{
    happensOn: string;
    timeLabel: string | null;
    title: string;
    details: string | null;
    participants: string[];
  }> = [];
  let currentDate: string | null = null;

  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line) continue;

    const dateMatch = line.match(/^(\d{1,2})\s+([А-Яа-яЁё]+)/);
    if (dateMatch) {
      const monthIndex = MONTHS.findIndex((m) => (dateMatch[2] ?? "").toLowerCase().startsWith(m));
      if (monthIndex >= 0) {
        const day = String(Number(dateMatch[1])).padStart(2, "0");
        currentDate = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${day}T00:00:00`;
        continue;
      }
    }

    const timeMatch = line.match(/^(\d{1,2}:\d{2})\s*[-–—]\s*(.+)$/);
    if (timeMatch && currentDate) {
      let rest = (timeMatch[2] ?? "").trim();
      let participants: string[] = [];

      const who = rest.match(/\(([^)]*)\)\s*$/);
      if (who?.index !== undefined) {
        participants = (who[1] ?? "").split(",").map((n) => n.trim()).filter(Boolean);
        rest = rest.slice(0, who.index).trim();
      }

      items.push({
        happensOn: currentDate,
        timeLabel: timeMatch[1] ?? null,
        title: rest,
        details: null,
        participants,
      });
      continue;
    }

    // Строка без времени уточняет предыдущее событие: номер поезда, места, рейс.
    const last = items[items.length - 1];
    if (last && currentDate) {
      last.details = last.details ? `${last.details}\n${line}` : line;
    }
  }

  return items;
}
