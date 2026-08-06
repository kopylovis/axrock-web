import { ResponsiveImage } from "~/components/common/ResponsiveImage";
import { MusicPlatformLinks } from "~/components/layout/LinkLists";
import type { ReleaseDetail, ReleaseType } from "~/types/content";
import { formatDate } from "~/utils/format";
import styles from "./ReleaseCard.module.css";

export const RELEASE_TYPE_LABELS: Record<ReleaseType, string> = {
  ALBUM: "Альбом",
  EP: "EP",
  SINGLE: "Сингл",
  LIVE: "Концертный",
  COMPILATION: "Сборник",
};

export function ReleaseCard({ release }: { release: ReleaseDetail }) {
  return (
    <article className={styles.card}>
      <ResponsiveImage
        src={release.coverImage}
        spec="releaseCover"
        alt={`Обложка: ${release.title}`}
        className={styles.cover}
        sizes="(max-width: 820px) 100vw, 280px"
      />

      <div className={styles.body}>
        <div className={styles.meta}>
          <span className={styles.type}>{RELEASE_TYPE_LABELS[release.type]}</span>
          {release.releaseDate ? (
            <time dateTime={release.releaseDate.toISOString()}>
              {formatDate(release.releaseDate)}
            </time>
          ) : null}
          {release.tracks.length > 0 ? <span>{release.tracks.length} треков</span> : null}
        </div>

        <h3 className={styles.title}>{release.title}</h3>

        {release.description ? <p className={styles.description}>{release.description}</p> : null}

        {release.tracks.length > 0 ? (
          <ol className={styles.tracks}>
            {release.tracks.map((track) => (
              <li key={track.id} className={styles.track}>
                <span className={styles.trackTitle}>
                  <span className={styles.trackNumber}>
                    {String(track.trackNumber).padStart(2, "0")}
                  </span>
                  {track.title}
                </span>
                {track.duration ? (
                  <span className={styles.trackDuration}>{track.duration}</span>
                ) : null}
              </li>
            ))}
          </ol>
        ) : null}

        {release.links.length > 0 ? (
          <div className={styles.links}>
            <MusicPlatformLinks links={release.links} />
          </div>
        ) : null}
      </div>
    </article>
  );
}
