import { useCallback, useEffect, useRef, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { IMAGE_SPECS, specSize, type ImageSpecKey } from "~/components/common/ImagePlaceholder";
import styles from "./ImageCropper.module.css";
import adminStyles from "./admin.module.css";

/**
 * Кадрирование прямо в браузере: рамка жёстко держит пропорцию блока,
 * а на сервер уходит уже готовое изображение целевого размера.
 */
interface ImageCropperProps {
  file: File;
  spec: ImageSpecKey;
  onCancel: () => void;
  onConfirm: (file: File) => void;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", () => reject(new Error("Не удалось прочитать изображение")));
    image.src = src;
  });
}

async function renderCrop(
  src: string,
  area: Area,
  targetWidth: number,
  targetHeight: number,
): Promise<Blob> {
  const image = await loadImage(src);
  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas недоступен");

  context.imageSmoothingQuality = "high";
  context.drawImage(
    image,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    targetWidth,
    targetHeight,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Не удалось собрать изображение"))),
      "image/jpeg",
      0.9,
    );
  });
}

export function ImageCropper({ file, spec, onCancel, onConfirm }: ImageCropperProps) {
  const { label, width, height } = IMAGE_SPECS[spec];
  const [source, setSource] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setSource(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    confirmRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCancel();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onCancel]);

  const handleComplete = useCallback((_: Area, pixels: Area) => setArea(pixels), []);

  async function confirm() {
    if (!source || !area) return;

    setBusy(true);
    setError(null);
    try {
      const blob = await renderCrop(source, area, width, height);
      const name = file.name.replace(/\.[^.]+$/, "") || "image";
      onConfirm(new File([blob], `${name}.jpg`, { type: "image/jpeg" }));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Не удалось обрезать изображение");
      setBusy(false);
    }
  }

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label={`Кадрирование: ${label}`}
    >
      <div className={styles.panel}>
        <header className={styles.head}>
          <div>
            <h2 className={styles.title}>{label}</h2>
            <p className={styles.subtitle}>Итоговый размер {specSize(spec)}</p>
          </div>
          <button
            type="button"
            className={`${adminStyles.btn} ${adminStyles.btnGhost} ${adminStyles.btnSm}`}
            onClick={onCancel}
            aria-label="Закрыть кадрирование"
          >
            ✕
          </button>
        </header>

        <div className={styles.stage}>
          {source ? (
            <Cropper
              image={source}
              crop={crop}
              zoom={zoom}
              aspect={width / height}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={handleComplete}
              restrictPosition
              zoomWithScroll
            />
          ) : null}
        </div>

        {error ? (
          <p className={adminStyles.alert} role="alert">
            {error}
          </p>
        ) : null}

        <div className={styles.controls}>
          <label className={styles.zoom}>
            <span className={styles.zoomLabel}>Масштаб</span>
            <input
              type="range"
              min={1}
              max={4}
              step={0.01}
              value={zoom}
              onChange={(event) => setZoom(Number(event.target.value))}
              className={styles.zoomInput}
            />
          </label>

          <p className={styles.hint}>
            Перетащите фотографию, чтобы выбрать область. Колесо мыши меняет масштаб.
          </p>
        </div>

        <footer className={styles.actions}>
          <button
            type="button"
            className={`${adminStyles.btn} ${adminStyles.btnSecondary}`}
            onClick={onCancel}
          >
            Отмена
          </button>
          <button
            ref={confirmRef}
            type="button"
            className={`${adminStyles.btn} ${adminStyles.btnPrimary}`}
            onClick={confirm}
            disabled={busy || !area}
          >
            {busy ? "Обрабатываю…" : "Обрезать и загрузить"}
          </button>
        </footer>
      </div>
    </div>
  );
}
