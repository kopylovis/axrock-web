import { Link } from "react-router";
import { ResponsiveImage } from "~/components/common/ResponsiveImage";
import type { ReleaseSummary } from "~/types/content";
import { releaseHref } from "~/utils/release-categories";
import { useLocalPath, useT } from "~/i18n";
import styles from "./ReleaseCard.module.css";

/** Компактная плитка релиза для сеток на главной и в разделе «О группе». */
export function ReleaseTile({ release, sizes }: { release: ReleaseSummary; sizes?: string }) {
  const t = useT();
  const lp = useLocalPath();

  return (
    <Link to={lp(releaseHref(release))} className={styles.tile}>
      <span className={styles.tileCoverWrap}>
        <ResponsiveImage
          src={release.coverImage}
          spec="releaseCover"
          alt={t.music.coverAlt(release.title)}
          className={styles.tileCover}
          sizes={sizes ?? "210px"}
          compactPlaceholder
        />
      </span>

      <span>
        <span className={styles.tileTitle}>{release.title}</span>
        <span className={styles.tileMeta}>
          {t.releaseTypes[release.type]}
          {release.releaseDate ? ` · ${release.releaseDate.getUTCFullYear()}` : ""}
        </span>
      </span>
    </Link>
  );
}
