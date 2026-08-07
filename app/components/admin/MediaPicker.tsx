import { useEffect, useState } from "react";
import { listUploads, type UploadItem } from "~/api/admin-api";
import styles from "./admin.module.css";

interface MediaPickerProps {
  /** Показывать только эти типы: например, векторный логотип принимает лишь SVG и PNG. */
  accept?: (item: UploadItem) => boolean;
  /** Текущее значение поля — отмечается в сетке, чтобы не выбирать вслепую. */
  selected?: string | null;
  onSelect: (url: string) => void;
  onUploadNew: () => void;
  onClose: () => void;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} КБ`;
  return `${(bytes / 1024 / 1024).toFixed(1)} МБ`;
}

/**
 * Библиотека загруженного. Файл выбирается как есть, без кадрирования: он уже
 * лежит на сервере в том виде, в каком его обрезали при первой загрузке.
 */
export function MediaPicker({ accept, selected, onSelect, onUploadNew, onClose }: MediaPickerProps) {
  const [items, setItems] = useState<UploadItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Разрешение берём у самой картинки после загрузки: сервер его не хранит,
  // а читать каждый файл на диске ради этого дорого.
  const [sizes, setSizes] = useState<Record<string, string>>({});

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  useEffect(() => {
    let cancelled = false;
    listUploads()
      .then((list) => {
        if (!cancelled) setItems(accept ? list.filter(accept) : list);
      })
      .catch(() => {
        if (!cancelled) setError("Не удалось получить список загруженного");
      });
    return () => {
      cancelled = true;
    };
  }, [accept]);

  return (
    <div className={styles.modalBackdrop} role="dialog" aria-modal="true" aria-label="Выбор файла">
      <div className={styles.modal}>
        <div className={styles.modalHead}>
          <h2 className={styles.panelTitle}>Выбрать изображение</h2>
          <div className={styles.pageActions}>
            <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={onUploadNew}>
              Загрузить с устройства
            </button>
            <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={onClose}>
              Закрыть
            </button>
          </div>
        </div>

        {error ? (
          <p className={styles.alert} role="alert">
            {error}
          </p>
        ) : null}

        {items === null && !error ? <p className={styles.hint}>Загрузка…</p> : null}

        {items !== null && items.length === 0 ? (
          <p className={styles.hint}>
            Пока ничего не загружено. Нажмите «Загрузить с устройства» — файл появится здесь и его
            можно будет переиспользовать.
          </p>
        ) : null}

        {items && items.length > 0 ? (
          <div className={styles.mediaGrid}>
            {items.map((item) => (
              <button
                key={item.url}
                type="button"
                className={`${styles.mediaTile} ${item.url === selected ? styles.mediaTileActive : ""}`}
                onClick={() => onSelect(item.url)}
                title={`${item.fileName} · ${formatSize(item.size)}`}
              >
                <img
                  src={item.url}
                  alt=""
                  loading="lazy"
                  onLoad={(event) => {
                    const { naturalWidth, naturalHeight } = event.currentTarget;
                    if (!naturalWidth) return;
                    setSizes((prev) =>
                      prev[item.url] ? prev : { ...prev, [item.url]: `${naturalWidth}×${naturalHeight}` },
                    );
                  }}
                />
                <span className={styles.mediaTileMeta}>
                  {sizes[item.url] ?? formatSize(item.size)}
                </span>
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
