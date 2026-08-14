import { useCallback, useEffect, useRef, useState } from "react";
import { ImagePlaceholder } from "~/components/common/ImagePlaceholder";
import { ResponsiveImage } from "~/components/common/ResponsiveImage";
import { isSafeExternalUrl } from "~/utils/url";
import { EmptyState } from "~/components/common/States";
import type { MediaItem, MediaType } from "~/types/content";
import { useT, type Strings } from "~/i18n";
import styles from "./MediaGallery.module.css";

function typeLabels(t: Strings): Record<MediaType, string> {
  return {
    PHOTO: t.media.photo,
    VIDEO: t.media.video,
    POSTER: t.media.poster,
    COVER: t.media.cover,
    BACKSTAGE: "Backstage",
  };
}

function PlayIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

/**
 * Пустой src у <img> браузер разрешает в адрес текущей страницы и показывает
 * «битую» картинку, поэтому каждый случай разбирается отдельно.
 */
function renderStage(item: MediaItem, t: Strings) {
  const imageUrl = item.fileUrl ?? item.previewImageUrl;

  if (item.type === "VIDEO" && item.fileUrl) {
    return (
      <video
        className={styles.stageVideo}
        controls
        preload="none"
        poster={item.previewImageUrl ?? undefined}
      >
        <source src={item.fileUrl} />
      </video>
    );
  }

  if (imageUrl) {
    return (
      <img
        className={styles.stageImage}
        src={imageUrl}
        alt={item.title ?? t.media.photoAlt}
      />
    );
  }

  // Файла нет — остаётся внешняя ссылка либо плейсхолдер с нужным размером.
  return (
    <div className={styles.stageFallback}>
      <ImagePlaceholder spec={item.type === "VIDEO" ? "video" : "gallery"} />
      {isSafeExternalUrl(item.externalUrl) ? (
        <a
          className={styles.stageLink}
          href={item.externalUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Смотреть на стороннем сайте ↗
        </a>
      ) : null}
    </div>
  );
}

function Lightbox({
  items,
  index,
  onClose,
  onNavigate,
}: {
  items: MediaItem[];
  index: number;
  onClose: () => void;
  onNavigate: (next: number) => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const item = items[index];
  const t = useT();

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      } else if (event.key === "ArrowRight" && index < items.length - 1) {
        onNavigate(index + 1);
      } else if (event.key === "ArrowLeft" && index > 0) {
        onNavigate(index - 1);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [index, items.length, onClose, onNavigate]);

  if (!item) return null;

  const caption = item.title ?? item.description ?? "";

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label={caption || t.media.viewer}>
      <div className={styles.overlayBar}>
        <span>
          {index + 1} / {items.length}
        </span>
        <div className={styles.overlayControls}>
          <button
            type="button"
            className={styles.controlButton}
            onClick={() => onNavigate(index - 1)}
            disabled={index === 0}
            aria-label={t.media.previous}
          >
            ←
          </button>
          <button
            type="button"
            className={styles.controlButton}
            onClick={() => onNavigate(index + 1)}
            disabled={index === items.length - 1}
            aria-label={t.media.next}
          >
            →
          </button>
          <button
            ref={closeRef}
            type="button"
            className={styles.controlButton}
            onClick={onClose}
            aria-label={t.media.close}
          >
            ✕
          </button>
        </div>
      </div>

      <div className={styles.stage}>
        {renderStage(item, t)}
        {caption ? <p className={styles.stageCaption}>{caption}</p> : null}
      </div>
    </div>
  );
}

export function MediaGallery({ items }: { items: MediaItem[] }) {
  const t = useT();
  const labels = typeLabels(t);
  const [activeType, setActiveType] = useState<MediaType | null>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const availableTypes = Array.from(new Set(items.map((item) => item.type)));
  const filtered = activeType ? items.filter((item) => item.type === activeType) : items;

  const handleClose = useCallback(() => setOpenIndex(null), []);
  const handleNavigate = useCallback((next: number) => setOpenIndex(next), []);

  if (items.length === 0) {
    return (
      <EmptyState
        title={t.media.emptyTitle}
        description={t.media.emptyDescription}
      />
    );
  }

  return (
    <>
      {availableTypes.length > 1 ? (
        <div className={styles.filters}>
          <button
            type="button"
            className={`${styles.filter} ${activeType === null ? styles.filterActive : ""}`}
            onClick={() => setActiveType(null)}
            aria-pressed={activeType === null}
          >
            {t.media.allTypes}
          </button>
          {availableTypes.map((type) => (
            <button
              key={type}
              type="button"
              className={`${styles.filter} ${activeType === type ? styles.filterActive : ""}`}
              onClick={() => setActiveType(type)}
              aria-pressed={activeType === type}
            >
              {labels[type]}
            </button>
          ))}
        </div>
      ) : null}

      <div className={styles.grid}>
        {filtered.map((item, index) => (
          <button
            key={item.id}
            type="button"
            className={styles.item}
            onClick={() => setOpenIndex(index)}
            aria-label={`${item.title ?? labels[item.type]}`}
          >
            <ResponsiveImage
              src={item.previewImageUrl ?? item.fileUrl}
              spec="gallery"
              alt={item.title ?? ""}
              className={styles.itemImage}
              aspectRatio="4 / 3"
              sizes="(max-width: 720px) 50vw, 240px"
            />
            {item.type === "VIDEO" ? (
              <span className={styles.playBadge} aria-hidden="true">
                <PlayIcon />
              </span>
            ) : null}
            {item.title ? <span className={styles.itemCaption}>{item.title}</span> : null}
          </button>
        ))}
      </div>

      {openIndex !== null ? (
        <Lightbox
          items={filtered}
          index={openIndex}
          onClose={handleClose}
          onNavigate={handleNavigate}
        />
      ) : null}
    </>
  );
}
