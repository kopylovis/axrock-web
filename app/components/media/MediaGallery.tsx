import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ImagePlaceholder } from "~/components/common/ImagePlaceholder";
import { ResponsiveImage } from "~/components/common/ResponsiveImage";
import { isSafeExternalUrl } from "~/utils/url";
import { parseVideoEmbed, type VideoEmbed } from "~/utils/video-embed";
import { EmptyState } from "~/components/common/States";
import { formatDate } from "~/utils/format";
import type { MediaAlbum, MediaItem, MediaType } from "~/types/content";
import { useLang, useT, type Strings } from "~/i18n";
import styles from "./MediaGallery.module.css";

/** Порядок вкладок фиксирован: он не должен зависеть от порядка записей в базе. */
const TYPE_ORDER: MediaType[] = ["PHOTO", "VIDEO", "POSTER", "COVER", "BACKSTAGE"];

/** Материал вместе с разобранной ссылкой на видеоплощадку. */
interface Tile {
  item: MediaItem;
  embed: VideoEmbed | null;
}

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
    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

/**
 * Кадр с видеоплощадки. Обычный <img>, а не ResponsiveImage: варианты по
 * ширине делает наш бэкенд, у чужих адресов их нет. Версия 1280×720 есть не у
 * каждого ролика, поэтому при ошибке загрузки подставляется меньшая.
 */
function RemotePoster({
  embed,
  alt,
  className,
}: {
  embed: VideoEmbed;
  alt: string;
  className?: string;
}) {
  const [src, setSrc] = useState(embed.posterUrl);

  useEffect(() => {
    setSrc(embed.posterUrl);
  }, [embed.posterUrl]);

  if (!src) return <ImagePlaceholder spec="video" ratio="4 / 3" className={className} compact />;

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      style={{ aspectRatio: "4 / 3" }}
      onError={() => setSrc(embed.posterFallbackUrl)}
    />
  );
}

function Thumbnail({ tile, alt }: { tile: Tile; alt: string }) {
  const own = tile.item.previewImageUrl ?? tile.item.fileUrl;

  // Свой файл всегда важнее: если превью загрузили вручную, показываем его.
  if (!own && tile.embed) {
    return <RemotePoster embed={tile.embed} alt={alt} className={styles.itemImage} />;
  }

  return (
    <ResponsiveImage
      src={own}
      spec={tile.item.type === "VIDEO" ? "video" : "gallery"}
      alt={alt}
      className={styles.itemImage}
      aspectRatio="4 / 3"
      compactPlaceholder
      sizes="(max-width: 640px) 100vw, (max-width: 1000px) 50vw, 380px"
    />
  );
}

/**
 * Пустой src у <img> браузер разрешает в адрес текущей страницы и показывает
 * «битую» картинку, поэтому каждый случай разбирается отдельно.
 */
function Stage({ tile, t }: { tile: Tile; t: Strings }) {
  const { item, embed } = tile;

  // Ролик с площадки проигрывается прямо в окне — уходить с сайта не нужно.
  if (embed) {
    return (
      <div className={styles.stageFrame}>
        <iframe
          className={styles.stageEmbed}
          src={embed.embedUrl}
          title={item.title ?? embed.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
        />
      </div>
    );
  }

  if (item.type === "VIDEO" && item.fileUrl) {
    return (
      <video
        className={styles.stageVideo}
        controls
        autoPlay
        preload="none"
        poster={item.previewImageUrl ?? undefined}
      >
        <source src={item.fileUrl} />
      </video>
    );
  }

  const imageUrl = item.fileUrl ?? item.previewImageUrl;
  if (imageUrl) {
    return <img className={styles.stageImage} src={imageUrl} alt={item.title ?? t.media.photoAlt} />;
  }

  // Ни файла, ни разобранной ссылки — остаётся увести на сторонний сайт.
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
          {t.media.external} ↗
        </a>
      ) : null}
    </div>
  );
}

function Lightbox({
  tiles,
  index,
  onClose,
  onNavigate,
}: {
  tiles: Tile[];
  index: number;
  onClose: () => void;
  onNavigate: (next: number) => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const tile = tiles[index];
  const t = useT();

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      } else if (event.key === "ArrowRight" && index < tiles.length - 1) {
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
  }, [index, tiles.length, onClose, onNavigate]);

  if (!tile) return null;

  const caption = tile.item.title ?? tile.item.description ?? "";

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label={caption || t.media.viewer}
    >
      <div className={styles.overlayBar}>
        <span>
          {index + 1} / {tiles.length}
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
            disabled={index === tiles.length - 1}
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
        {/* Ключ по записи: без него React переиспользует <iframe> и в нём
            остаётся предыдущий ролик. */}
        <Stage key={tile.item.id} tile={tile} t={t} />
        <div className={styles.stageFooter}>
          {caption ? <p className={styles.stageCaption}>{caption}</p> : null}
          {tile.embed && isSafeExternalUrl(tile.item.externalUrl) ? (
            <a
              className={styles.stageSource}
              href={tile.item.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t.media.openOn} {tile.embed.title} ↗
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/** Раздел страницы: альбом со своими материалами либо общая лента. */
interface Section {
  key: string;
  title: string | null;
  description: string | null;
  date: Date | null;
  tiles: Tile[];
}

function Grid({
  tiles,
  labels,
  offset,
  onOpen,
}: {
  tiles: Tile[];
  labels: Record<MediaType, string>;
  /** Сдвиг до начала раздела: окно просмотра листает всю страницу подряд. */
  offset: number;
  onOpen: (index: number) => void;
}) {
  return (
    <div className={styles.grid}>
      {tiles.map((tile, index) => (
        <button
          key={tile.item.id}
          type="button"
          className={styles.item}
          onClick={() => onOpen(offset + index)}
          aria-label={tile.item.title ?? labels[tile.item.type]}
        >
          <span className={styles.itemFrame}>
            <Thumbnail tile={tile} alt={tile.item.title ?? ""} />
            {tile.item.type === "VIDEO" ? (
              <span className={styles.playBadge} aria-hidden="true">
                <PlayIcon />
              </span>
            ) : null}
          </span>
          <span className={styles.itemOverlay}>
            <span className={styles.itemType}>
              {labels[tile.item.type]}
              {tile.embed ? ` · ${tile.embed.title}` : ""}
            </span>
            {tile.item.title ? (
              <span className={styles.itemCaption}>{tile.item.title}</span>
            ) : null}
          </span>
        </button>
      ))}
    </div>
  );
}

export function MediaGallery({
  items,
  albums = [],
}: {
  items: MediaItem[];
  albums?: MediaAlbum[];
}) {
  const t = useT();
  const lang = useLang();
  const labels = typeLabels(t);
  const [activeType, setActiveType] = useState<MediaType | null>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const tiles = useMemo<Tile[]>(
    () => items.map((item) => ({ item, embed: parseVideoEmbed(item.externalUrl) })),
    [items],
  );

  const availableTypes = TYPE_ORDER.filter((type) => items.some((item) => item.type === type));
  const filtered = activeType ? tiles.filter((tile) => tile.item.type === activeType) : tiles;

  const sections = useMemo<Section[]>(() => {
    const known = new Set(albums.map((album) => album.id));
    const result: Section[] = albums
      .map((album) => ({
        key: `album-${album.id}`,
        title: album.title,
        description: album.description,
        date: album.happenedOn,
        tiles: filtered.filter((tile) => tile.item.albumId === album.id),
      }))
      // Пустой альбом на сайте не показывается: заголовок без материалов — брак.
      .filter((section) => section.tiles.length > 0);

    // Всё, что не разложено по альбомам, идёт общей лентой от свежего к старому.
    const loose = filtered
      .filter((tile) => tile.item.albumId === null || !known.has(tile.item.albumId))
      .sort((a, b) => (b.item.publishedAt?.getTime() ?? 0) - (a.item.publishedAt?.getTime() ?? 0));

    if (loose.length > 0) {
      result.push({
        key: "loose",
        // Пока альбомов нет, лента остаётся единственным разделом — заголовок ей не нужен.
        title: result.length > 0 ? t.media.allMaterials : null,
        description: null,
        date: null,
        tiles: loose,
      });
    }

    return result;
  }, [albums, filtered, t.media.allMaterials]);

  // Плоский список в порядке показа: по нему листают стрелки в окне просмотра.
  const visible = useMemo(() => sections.flatMap((section) => section.tiles), [sections]);

  const handleClose = useCallback(() => setOpenIndex(null), []);
  const handleNavigate = useCallback((next: number) => setOpenIndex(next), []);

  function selectType(type: MediaType | null) {
    setActiveType(type);
    // Позиции в отфильтрованном списке другие — открытое окно показало бы не то.
    setOpenIndex(null);
  }

  if (items.length === 0) {
    return <EmptyState title={t.media.emptyTitle} description={t.media.emptyDescription} />;
  }

  return (
    <>
      {availableTypes.length > 1 ? (
        <div className={styles.filters} role="tablist" aria-label={t.media.title}>
          <button
            type="button"
            role="tab"
            className={`${styles.filter} ${activeType === null ? styles.filterActive : ""}`}
            onClick={() => selectType(null)}
            aria-selected={activeType === null}
          >
            {t.media.allTypes}
            <span className={styles.filterCount}>{items.length}</span>
          </button>
          {availableTypes.map((type) => (
            <button
              key={type}
              type="button"
              role="tab"
              className={`${styles.filter} ${activeType === type ? styles.filterActive : ""}`}
              onClick={() => selectType(type)}
              aria-selected={activeType === type}
            >
              {labels[type]}
              <span className={styles.filterCount}>
                {items.filter((item) => item.type === type).length}
              </span>
            </button>
          ))}
        </div>
      ) : null}

      {sections.map((section, sectionIndex) => (
        <section key={section.key} className={styles.section}>
          {section.title ? (
            <header className={styles.sectionHead}>
              <h2 className={styles.sectionTitle}>{section.title}</h2>
              {section.date ? (
                <span className={styles.sectionDate}>{formatDate(section.date, undefined, lang)}</span>
              ) : null}
              {section.description ? (
                <p className={styles.sectionLead}>{section.description}</p>
              ) : null}
            </header>
          ) : null}
          <Grid
            tiles={section.tiles}
            labels={labels}
            offset={sections.slice(0, sectionIndex).reduce((sum, item) => sum + item.tiles.length, 0)}
            onOpen={setOpenIndex}
          />
        </section>
      ))}

      {openIndex !== null ? (
        <Lightbox
          tiles={visible}
          index={openIndex}
          onClose={handleClose}
          onNavigate={handleNavigate}
        />
      ) : null}
    </>
  );
}
