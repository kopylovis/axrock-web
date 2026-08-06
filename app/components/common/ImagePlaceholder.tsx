import styles from "./ImagePlaceholder.module.css";

/** Целевые размеры исходников: по ним кадрируется загрузка и рисуются плейсхолдеры. */
export const IMAGE_SPECS = {
  hero: { label: "Фото группы", width: 2400, height: 1350 },
  newsCover: { label: "Обложка новости", width: 1200, height: 675 },
  concertPoster: { label: "Афиша концерта", width: 1000, height: 1400 },
  releaseCover: { label: "Обложка релиза", width: 1000, height: 1000 },
  memberPhoto: { label: "Фото участника", width: 900, height: 1200 },
  gallery: { label: "Фотография", width: 1600, height: 1200 },
  video: { label: "Превью видео", width: 1280, height: 720 },
  ogImage: { label: "Картинка для соцсетей", width: 1200, height: 630 },
} as const;

export type ImageSpecKey = keyof typeof IMAGE_SPECS;

export function specRatio(spec: ImageSpecKey): string {
  const { width, height } = IMAGE_SPECS[spec];
  return `${width} / ${height}`;
}

export function specSize(spec: ImageSpecKey): string {
  const { width, height } = IMAGE_SPECS[spec];
  return `${width} × ${height}`;
}

interface ImagePlaceholderProps {
  spec: ImageSpecKey;
  className?: string;
  ratio?: string;
  compact?: boolean;
}

export function ImagePlaceholder({ spec, className, ratio, compact }: ImagePlaceholderProps) {
  const { label } = IMAGE_SPECS[spec];
  const size = specSize(spec);

  return (
    <div
      className={[styles.box, compact ? styles.compact : null, className].filter(Boolean).join(" ")}
      style={{ aspectRatio: ratio ?? specRatio(spec) }}
      role="img"
      aria-label={`Плейсхолдер: ${label}, рекомендуемый размер ${size}`}
    >
      <span className={styles.inner} aria-hidden="true">
        <span className={styles.label}>{label}</span>
        <span className={styles.size}>{size}</span>
      </span>
    </div>
  );
}
