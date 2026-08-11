/**
 * Выгрузка таблиц без внешних библиотек.
 *
 * Excel открывает CSV напрямую, но с двумя оговорками, которые здесь учтены:
 * без метки BOM он читает кириллицу как кракозябры, а в русской локали ждёт
 * разделителем точку с запятой, потому что запятая занята под дробную часть.
 */

function escapeCell(value: string | number | null | undefined): string {
  const text = value === null || value === undefined ? "" : String(value);
  // Кавычки, переводы строк и разделитель требуют обрамления по RFC 4180.
  return /[";\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function downloadCsv(
  fileName: string,
  headers: string[],
  rows: Array<Array<string | number | null | undefined>>,
): void {
  const body = [headers, ...rows].map((row) => row.map(escapeCell).join(";")).join("\r\n");

  // ﻿ — та самая метка, без неё Excel портит кириллицу.
  const blob = new Blob([`﻿${body}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = fileName.endsWith(".csv") ? fileName : `${fileName}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/** Числа Excel в русской локали ждёт с запятой, иначе считает их текстом. */
export function csvAmount(amountMinor: number): string {
  return (amountMinor / 100).toFixed(2).replace(".", ",");
}

/**
 * PDF и картинку отдаём через печать браузера: он сам предлагает «Сохранить
 * как PDF», верно печатает кириллицу и не требует ни шрифтов в комплекте,
 * ни библиотеки на сотни килобайт в бандле админки.
 */
export function printPage(): void {
  window.print();
}
