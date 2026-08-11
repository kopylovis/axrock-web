import { useEffect, useState } from "react";
import { getSetlist, saveSetlist, type SetlistItemInput } from "~/api/admin-api";
import { GlassPanel } from "~/components/common/GlassPanel";
import { TextAreaField, TextField } from "./fields";
import { formatSetlistTotal, parseSetlistText } from "~/utils/crew-format";
import styles from "./admin.module.css";

/**
 * Сет-лист хранится отдельно от карточки концерта и на сайт не выводится.
 * Поэтому и сохраняется отдельной кнопкой: правки программы обычно идут
 * перед выступлением, когда трогать остальные поля не нужно.
 */
export function SetlistPanel({ concertId }: { concertId: number }) {
  const [items, setItems] = useState<SetlistItemInput[]>([]);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pasting, setPasting] = useState(false);
  const [pasteText, setPasteText] = useState("");

  useEffect(() => {
    let cancelled = false;
    getSetlist(concertId)
      .then((setlist) => {
        if (cancelled) return;
        setItems(
          setlist.items.map((item) => ({
            title: item.title,
            duration: item.duration ?? "",
            note: item.note ?? "",
            backingTrackUrl: item.backingTrackUrl ?? "",
          })),
        );
        setTotalSeconds(setlist.totalSeconds);
      })
      .catch(() => {
        if (!cancelled) setError("Не удалось загрузить сет-лист");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [concertId]);

  function patch(index: number, changes: Partial<SetlistItemInput>) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...changes } : item)));
  }

  function move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= items.length) return;
    setItems((prev) => {
      const next = [...prev];
      const [moved] = next.splice(index, 1);
      if (moved) next.splice(target, 0, moved);
      return next;
    });
  }

  async function submit() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const result = await saveSetlist(
        concertId,
        items
          .filter((item) => item.title.trim().length > 0)
          .map((item) => ({
            title: item.title.trim(),
            duration: item.duration?.trim() || null,
            note: item.note?.trim() || null,
            backingTrackUrl: item.backingTrackUrl?.trim() || null,
          })),
      );
      setTotalSeconds(result.totalSeconds);
      setSaved(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Не удалось сохранить сет-лист");
    } finally {
      setSaving(false);
    }
  }

  return (
    <GlassPanel className={styles.panel}>
      <h2 className={styles.panelTitle}>Сет-лист</h2>
      <p className={styles.hint}>
        Внутренние данные: на сайте не показываются, доступны в панели и мобильном приложении.
        {totalSeconds > 0 ? ` Хронометраж: ${formatSetlistTotal(totalSeconds)}.` : ""}
      </p>

      {error ? (
        <p className={styles.alert} role="alert">
          {error}
        </p>
      ) : null}
      {saved ? (
        <p className={styles.success} role="status">
          Сет-лист сохранён.
        </p>
      ) : null}

      {loading ? (
        <p className={styles.hint}>Загрузка…</p>
      ) : (
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
                label="Программа текстом"
                value={pasteText}
                rows={10}
                hint="Формат рабочих списков: «-Уставший путник 3:20 (Хиро)». Шапка и строка площадки пропускаются."
                onChange={(event) => setPasteText(event.target.value)}
              />
              <div className={styles.formActions}>
                <button
                  type="button"
                  className={`${styles.btn} ${styles.btnPrimary}`}
                  onClick={() => {
                    const parsed = parseSetlistText(pasteText);
                    if (parsed.length === 0) {
                      setError("Не удалось разобрать ни одной строки");
                      return;
                    }
                    setItems((prev) => [
                      ...prev,
                      ...parsed.map((item) => ({ ...item, backingTrackUrl: "" })),
                    ]);
                    setPasteText("");
                    setPasting(false);
                    setError(null);
                  }}
                >
                  Разобрать и добавить
                </button>
              </div>
            </div>
          ) : null}

          {items.length === 0 ? <p className={styles.hint}>Программа пока не задана.</p> : null}

          {items.map((item, index) => (
            <div key={index} className={styles.repeatRow}>
              <div className={`${styles.formGrid} ${styles.formGridTwo}`}>
                <TextField
                  label={`${index + 1}. Песня`}
                  value={item.title}
                  onChange={(event) => patch(index, { title: event.target.value })}
                />
                <TextField
                  label="Хронометраж"
                  value={item.duration ?? ""}
                  placeholder="3:20"
                  onChange={(event) => patch(index, { duration: event.target.value })}
                />
              </div>
              <div className={`${styles.formGrid} ${styles.formGridTwo}`}>
                <TextField
                  label="Пометка"
                  value={item.note ?? ""}
                  placeholder="Хиро"
                  hint="Кто солирует или приглашён."
                  onChange={(event) => patch(index, { note: event.target.value })}
                />
                <TextField
                  label="Минусовка"
                  value={item.backingTrackUrl ?? ""}
                  placeholder="https://…"
                  hint="Только https."
                  onChange={(event) => patch(index, { backingTrackUrl: event.target.value })}
                />
              </div>
              <div className={styles.repeatActions}>
                <button
                  type="button"
                  className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`}
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  aria-label="Выше"
                >
                  ↑
                </button>
                <button
                  type="button"
                  className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`}
                  onClick={() => move(index, 1)}
                  disabled={index === items.length - 1}
                  aria-label="Ниже"
                >
                  ↓
                </button>
                <button
                  type="button"
                  className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`}
                  onClick={() => setItems((prev) => prev.filter((_, i) => i !== index))}
                >
                  Убрать
                </button>
              </div>
            </div>
          ))}

          <div className={styles.formActions}>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`}
              onClick={() =>
                setItems((prev) => [...prev, { title: "", duration: "", note: "", backingTrackUrl: "" }])
              }
            >
              + Песня
            </button>
            <span className={styles.spacer} />
            <button
              type="button"
              className={`${styles.btn} ${styles.btnPrimary}`}
              disabled={saving}
              onClick={submit}
            >
              {saving ? "Сохраняю…" : "Сохранить сет-лист"}
            </button>
          </div>
        </div>
      )}
    </GlassPanel>
  );
}
