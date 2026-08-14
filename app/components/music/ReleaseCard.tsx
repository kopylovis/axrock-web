import { ResponsiveImage } from "~/components/common/ResponsiveImage";
import { MusicPlatformLinks } from "~/components/layout/LinkLists";
import type { ReleaseDetail } from "~/types/content";
import { formatDate } from "~/utils/format";
import { releaseAnchor } from "~/utils/release-categories";
import { useLang, useT } from "~/i18n";
import styles from "./ReleaseCard.module.css";

export function ReleaseCard({ release }: { release: ReleaseDetail }) {
  const t = useT();
  const lang = useLang();

  return (
    <article className={styles.card} id={releaseAnchor(release.slug)}>
      <ResponsiveImage
        src={release.coverImage}
        spec="releaseCover"
        alt={t.music.coverAlt(release.title)}
        className={styles.cover}
        sizes="(max-width: 820px) 100vw, 280px"
      />

      <div className={styles.body}>
        <div className={styles.meta}>
          <span className={styles.type}>{t.releaseTypes[release.type]}</span>
          {release.releaseDate ? (
            <time dateTime={release.releaseDate.toISOString()}>
              {formatDate(release.releaseDate, undefined, lang)}
            </time>
          ) : null}
          {release.tracks.length > 0 ? <span>{t.music.tracks(release.tracks.length)}</span> : null}
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
