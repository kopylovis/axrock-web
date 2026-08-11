import { useState } from "react";
import type { LogisticsItemInput, LogisticsKind } from "~/api/admin-api";
import { SelectField, TextAreaField, TextField } from "./fields";
import { LOGISTICS_OPTIONS, parseLogisticsText } from "~/utils/crew-format";
import { toDateTimeLocalValue } from "~/utils/admin-format";
import styles from "./admin.module.css";

interface LogisticsEditorProps {
  items: LogisticsItemInput[];
  onChange: (items: LogisticsItemInput[]) => void;
}

/** Дата события хранится с временем, но в форме нужен только день. */
function dayValue(value: string): string {
  return toDateTimeLocalValue(value, "UTC").slice(0, 10);
}

function emptyItem(): LogisticsItemInput {
  const today = new Date().toISOString().slice(0, 10);
  return {
    happensOn: `${today}T00:00:00`,
    timeLabel: "",
    kind: "OTHER",
    title: "",
    details: "",
    participants: [],
  };
}

export function LogisticsEditor({ items, onChange }: LogisticsEditorProps) {
  const [pasting, setPasting] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [pasteYear, setPasteYear] = useState(String(new Date().getFullYear()));
  const [pasteError, setPasteError] = useState<string | null>(null);

  function patch(index: number, changes: Partial<LogisticsItemInput>) {
    onChange(items.map((item, i) => (i === index ? { ...item, ...changes } : item)));
  }

  function applyPaste() {
    const parsed = parseLogisticsText(pasteText, Number(pasteYear) || new Date().getFullYear());
    if (parsed.length === 0) {
      setPasteError("Не удалось разобрать ни одной строки. Нужны строки вида «6 ИЮЛЯ», затем «00:51 - описание».");
      return;
    }
    onChange([...items, ...parsed.map((item) => ({ ...item, kind: "OTHER" as LogisticsKind }))]);
    setPasteText("");
    setPasteError(null);
    setPasting(false);
  }

  return (
    <div className={styles.form}>
      <div className={styles.pageActions}>
        <button
          type="button"
          className={`${styles.btn} ${styles.btnSecondary}`}
          onClick={() => setPasting((value) => !value)}
        >
          {pasting ? "Скрыть вставку" : "Вставить текстом"}
        </button>
      </div>

      {pasting ? (
        <div className={styles.pastePanel}>
          <TextAreaField
            label="Логистика текстом"
            value={pasteText}
            rows={10}
            hint="Строка с датой открывает день. Дальше «время - описание (участники)», а строка без времени становится деталями предыдущего пункта."
            onChange={(event) => setPasteText(event.target.value)}
          />
          <div className={`${styles.formGrid} ${styles.formGridTwo}`}>
            <TextField
              label="Год"
              value={pasteYear}
              hint="В списках год обычно не пишут — укажите его здесь."
              onChange={(event) => setPasteYear(event.target.value)}
            />
          </div>
          {pasteError ? (
            <p className={styles.alert} role="alert">
              {pasteError}
            </p>
          ) : null}
          <div className={styles.formActions}>
            <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={applyPaste}>
              Разобрать и добавить
            </button>
          </div>
        </div>
      ) : null}

      {items.length === 0 ? (
        <p className={styles.hint}>Пунктов пока нет. Добавьте вручную или вставьте текстом.</p>
      ) : null}

      {items.map((item, index) => (
        <div key={index} className={styles.repeatRow}>
          <div className={`${styles.formGrid} ${styles.formGridTwo}`}>
            <TextField
              label="Дата"
              type="date"
              value={dayValue(item.happensOn)}
              onChange={(event) => patch(index, { happensOn: `${event.target.value}T00:00:00` })}
            />
            <TextField
              label="Время"
              value={item.timeLabel ?? ""}
              placeholder="00:51"
              hint="Можно словами: «утро», «после чека»."
              onChange={(event) => patch(index, { timeLabel: event.target.value })}
            />
          </div>

          <div className={`${styles.formGrid} ${styles.formGridTwo}`}>
            <SelectField
              label="Тип"
              value={item.kind}
              options={LOGISTICS_OPTIONS}
              onChange={(event) => patch(index, { kind: event.target.value as LogisticsKind })}
            />
            <TextField
              label="Участники"
              value={item.participants.join(", ")}
              placeholder="Лимарев, Чистяков"
              hint="Через запятую. Можно вписывать техников — со списком участников сайта не связано."
              onChange={(event) =>
                patch(index, {
                  participants: event.target.value.split(",").map((n) => n.trim()).filter(Boolean),
                })
              }
            />
          </div>

          <TextField
            label="Событие"
            value={item.title}
            placeholder="Поезд Ростов — Ижевск"
            onChange={(event) => patch(index, { title: event.target.value })}
          />

          <TextAreaField
            label="Детали"
            value={item.details ?? ""}
            rows={2}
            placeholder="Поезд 507, вагон 11 (купе). Места 33–36"
            onChange={(event) => patch(index, { details: event.target.value })}
          />

          <div className={styles.repeatActions}>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`}
              onClick={() => onChange(items.filter((_, i) => i !== index))}
            >
              Убрать
            </button>
          </div>
        </div>
      ))}

      <div>
        <button
          type="button"
          className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`}
          onClick={() => onChange([...items, emptyItem()])}
        >
          + Пункт
        </button>
      </div>
    </div>
  );
}
