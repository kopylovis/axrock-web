import { ButtonLink } from "~/components/common/Button";
import { ImagePlaceholder } from "~/components/common/ImagePlaceholder";
import { imageSrcSet } from "~/utils/images";
import type { ConcertSummary, SiteSettings } from "~/types/content";
import { formatDate } from "~/utils/format";
import { useLang, useT } from "~/i18n";
import styles from "./Hero.module.css";

interface HeroProps {
  settings: SiteSettings;
  nextConcert: ConcertSummary | null;
}

export function Hero({ settings, nextConcert }: HeroProps) {
  const lang = useLang();
  const t = useT();

  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.media} aria-hidden="true">
        {settings.heroImage ? (
          <img
            className={styles.mediaImage}
            src={settings.heroImage}
            srcSet={imageSrcSet(settings.heroImage)}
            sizes="100vw"
            alt=""
            fetchPriority="high"
            decoding="sync"
          />
        ) : (
          <ImagePlaceholder spec="hero" className={styles.mediaPlaceholder} ratio="auto" />
        )}
        <div className={styles.scrim} />
      </div>

      <div className={`container ${styles.inner}`}>
        {nextConcert ? (
          <p className={styles.announce}>
            <span className={styles.announceDot} aria-hidden="true" />
            {formatDate(nextConcert.startsAt, nextConcert.timezone, lang)} · {nextConcert.city}
          </p>
        ) : null}

        <h1 id="hero-title" className={settings.logo ? styles.titleWithLogo : styles.title}>
          {settings.logo ? (
            <span className={styles.logoWrap}>
              {/* Изображение задаёт размер и несёт alt, свечение рисует слой поверх.
                  crossOrigin нужен, чтобы блик по маске получил CORS-чистый кеш. */}
              <img
                src={settings.logo}
                alt={settings.heroTitle}
                className={styles.titleLogo}
                fetchPriority="high"
                crossOrigin="anonymous"
              />
              <span
                className={styles.logoSheen}
                style={{
                  maskImage: `url("${settings.logo}")`,
                  WebkitMaskImage: `url("${settings.logo}")`,
                }}
                aria-hidden="true"
              />
            </span>
          ) : (
            settings.heroTitle
          )}
        </h1>

        <div className={styles.actions}>
          <ButtonLink to="/concerts">{t.home.heroShows}</ButtonLink>
          <ButtonLink to="/music" variant="ghost">
            {t.home.heroListen}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
