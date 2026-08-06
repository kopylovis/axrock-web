import { Link } from "react-router";
import type { Route } from "./+types/home";
import { useSiteData } from "~/layouts/PublicLayout";
import { Hero } from "~/components/home/Hero";
import { AnimatedSection } from "~/components/common/AnimatedSection";
import { SectionHeading } from "~/components/common/SectionHeading";
import { ButtonLink } from "~/components/common/Button";
import { EmptyState } from "~/components/common/States";
import { PageSkeleton } from "~/components/common/PageSkeleton";
import { Marquee } from "~/components/common/Marquee";
import { ResponsiveImage } from "~/components/common/ResponsiveImage";
import { NewsCard } from "~/components/news/NewsCard";
import { EventsStrip } from "~/components/concerts/EventsStrip";
import { MusicPlatformLinks, SocialLinks } from "~/components/layout/LinkLists";
import { RELEASE_TYPE_LABELS } from "~/components/music/ReleaseCard";
import { fetchMedia, fetchNews, fetchReleases, fetchUpcomingConcerts } from "~/api/public-api";
import { buildMeta, jsonLd, ogImageFrom } from "~/lib/seo";
import { SITE_URL } from "~/lib/config";
import { formatDayNumber, formatMonthShort, pluralize } from "~/utils/format";
import styles from "~/components/home/home.module.css";

const ABOUT_ANCHOR = "events";

async function load() {
  const [concerts, news, releases, media] = await Promise.all([
    fetchUpcomingConcerts(5).catch(() => []),
    fetchNews({ page: 1, pageSize: 3 }).catch(() => null),
    fetchReleases().catch(() => []),
    fetchMedia(null).catch(() => []),
  ]);

  return {
    concerts,
    news: news?.items ?? [],
    releases: releases.slice(0, 5),
    videos: media.filter((item) => item.type === "VIDEO").slice(0, 3),
  };
}

export async function loader() {
  return load();
}

export async function clientLoader() {
  return load();
}

export function HydrateFallback() {
  return <PageSkeleton />;
}

export function meta({ location, matches }: Route.MetaArgs) {
  return [
    ...buildMeta({
      title: "Ангел-Хранитель — официальный сайт группы",
      image: ogImageFrom(matches),
      description:
        "Официальный сайт рок-группы «Ангел-Хранитель»: афиша концертов, новости, дискография, фотографии и видео.",
      pathname: location.pathname,
    }),
    jsonLd({
      "@context": "https://schema.org",
      "@type": "MusicGroup",
      name: "Ангел-Хранитель",
      url: `${SITE_URL}/`,
      genre: "Rock",
    }),
  ];
}

function PlayIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { concerts, news, releases, videos } = loaderData;
  const { settings, socialLinks, musicLinks } = useSiteData();

  // Даты перемежаются короткими фразами: при двух концертах лента иначе
  // выглядит как повтор одного и того же.
  const marqueeItems =
    concerts.length > 0
      ? [
          "Ближайшие концерты",
          ...concerts.map(
            (concert) =>
              `${formatDayNumber(concert.startsAt, concert.timezone)} ${formatMonthShort(concert.startsAt, concert.timezone)} · ${concert.city}`,
          ),
          settings.bandName,
          "Билеты — на сайтах организаторов",
        ]
      : [settings.bandName, "Официальный сайт", "Новые даты скоро"];

  return (
    <>
      <Hero settings={settings} nextConcert={concerts[0] ?? null} />

      <Marquee items={marqueeItems} />

      <AnimatedSection className="section" id={ABOUT_ANCHOR} ariaLabelledby="events-heading">
        <div className="container">
          <SectionHeading
            id="events-heading"
            eyebrow="Афиша"
            title="Ближайшие концерты"
            action={
              <ButtonLink to="/concerts" variant="quiet">
                Все даты
              </ButtonLink>
            }
          />

          {concerts.length > 0 ? (
            <EventsStrip concerts={concerts} />
          ) : (
            <EmptyState
              title="Новые даты скоро появятся"
              description="Следите за новостями и соцсетями — мы объявим их первыми."
              action={
                <ButtonLink to="/concerts" variant="ghost">
                  Архив концертов
                </ButtonLink>
              }
            />
          )}
        </div>
      </AnimatedSection>

      <AnimatedSection className="section" ariaLabelledby="about-heading">
        <div className="container">
          <SectionHeading id="about-heading" eyebrow="О группе" title={settings.bandName} />

          <div className={styles.intro}>
            <div className={styles.introText}>
              <p className={styles.introLead}>
                {settings.shortBiography ??
                  "Описание группы появится здесь — его можно заполнить в разделе «Настройки» административной панели."}
              </p>
              <div className={styles.sectionFooter}>
                <ButtonLink to="/about" variant="ghost">
                  История группы
                </ButtonLink>
                <ButtonLink to="/about#lineup" variant="quiet">
                  Состав
                </ButtonLink>
              </div>
            </div>

            <div className={styles.facts}>
              <div className={styles.fact}>
                <span className={styles.factLabel}>Ближайших концертов</span>
                <span className={styles.factValue}>{concerts.length}</span>
              </div>
              <div className={styles.fact}>
                <span className={styles.factLabel}>
                  {pluralize(releases.length, ["Релиз", "Релиза", "Релизов"])}
                </span>
                <span className={styles.factValue}>{releases.length}</span>
              </div>
              <div className={styles.fact}>
                <span className={styles.factLabel}>Публикаций</span>
                <span className={styles.factValue}>{news.length}</span>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {releases.length > 0 ? (
        <AnimatedSection className="section" ariaLabelledby="music-heading">
          <div className="container">
            <SectionHeading
              id="music-heading"
              eyebrow="Музыка"
              title="Дискография"
              action={
                <ButtonLink to="/music" variant="quiet">
                  Все релизы
                </ButtonLink>
              }
            />

            <div className={styles.releaseGrid}>
              {releases.map((release) => (
                <article key={release.id} className={styles.releaseTile}>
                  <Link to="/music" className={styles.releaseCoverWrap}>
                    <ResponsiveImage
                      src={release.coverImage}
                      spec="releaseCover"
                      alt={`Обложка: ${release.title}`}
                      className={styles.releaseCover}
                      sizes="(max-width: 720px) 50vw, 210px"
                      compactPlaceholder
                    />
                  </Link>
                  <div>
                    <h3 className={styles.releaseTitle}>{release.title}</h3>
                    <p className={styles.releaseMeta}>
                      {RELEASE_TYPE_LABELS[release.type]}
                      {release.releaseDate ? ` · ${release.releaseDate.getUTCFullYear()}` : ""}
                    </p>
                  </div>
                </article>
              ))}
            </div>

            {musicLinks.length > 0 ? (
              <div className={styles.sectionFooter}>
                <MusicPlatformLinks links={musicLinks} />
              </div>
            ) : null}
          </div>
        </AnimatedSection>
      ) : null}

      {videos.length > 0 ? (
        <AnimatedSection className="section" ariaLabelledby="video-heading">
          <div className="container">
            <SectionHeading
              id="video-heading"
              eyebrow="Видео"
              title="Клипы и живые записи"
              action={
                <ButtonLink to="/media" variant="quiet">
                  Вся галерея
                </ButtonLink>
              }
            />

            <div className={styles.videoGrid}>
              {videos.map((video) => (
                <Link key={video.id} to="/media" className={styles.videoTile}>
                  <span className={styles.videoThumbWrap}>
                    <ResponsiveImage
                      src={video.previewImageUrl ?? video.fileUrl}
                      spec="video"
                      alt=""
                      className={styles.videoThumb}
                      sizes="(max-width: 720px) 100vw, 320px"
                    />
                    <span className={styles.videoPlay} aria-hidden="true">
                      <span className={styles.videoPlayIcon}>
                        <PlayIcon />
                      </span>
                    </span>
                  </span>
                  <h3 className={styles.videoTitle}>{video.title ?? "Видео"}</h3>
                </Link>
              ))}
            </div>
          </div>
        </AnimatedSection>
      ) : null}

      {news.length > 0 ? (
        <AnimatedSection className="section" ariaLabelledby="news-heading">
          <div className="container">
            <SectionHeading
              id="news-heading"
              eyebrow="Новости"
              title="Последние публикации"
              action={
                <ButtonLink to="/news" variant="quiet">
                  Все новости
                </ButtonLink>
              }
            />
            <div className={styles.newsGrid}>
              {news.map((item) => (
                <NewsCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        </AnimatedSection>
      ) : null}

      <AnimatedSection className="section" ariaLabelledby="connect-heading">
        <div className="container">
          <SectionHeading id="connect-heading" eyebrow="Связь" title="Слушать и подписаться" />

          {socialLinks.length > 0 || musicLinks.length > 0 ? (
            <div className={styles.linksBand}>
              {socialLinks.length > 0 ? (
                <div className={styles.linksGroup}>
                  <p className={styles.linksTitle}>Соцсети</p>
                  <SocialLinks links={socialLinks} />
                </div>
              ) : null}
              {musicLinks.length > 0 ? (
                <div className={styles.linksGroup}>
                  <p className={styles.linksTitle}>Площадки</p>
                  <MusicPlatformLinks links={musicLinks} />
                </div>
              ) : null}
            </div>
          ) : null}

          <div className={styles.contacts}>
            {settings.bookingEmail ? (
              <div className={styles.contactCard}>
                <span className={styles.contactLabel}>Организаторам</span>
                <a href={`mailto:${settings.bookingEmail}`} className={styles.contactValue}>
                  {settings.bookingEmail}
                </a>
              </div>
            ) : null}
            {settings.pressEmail ? (
              <div className={styles.contactCard}>
                <span className={styles.contactLabel}>Прессе</span>
                <a href={`mailto:${settings.pressEmail}`} className={styles.contactValue}>
                  {settings.pressEmail}
                </a>
              </div>
            ) : null}
            {settings.contactEmail ? (
              <div className={styles.contactCard}>
                <span className={styles.contactLabel}>Общая почта</span>
                <a href={`mailto:${settings.contactEmail}`} className={styles.contactValue}>
                  {settings.contactEmail}
                </a>
              </div>
            ) : null}
          </div>

          <div className={styles.sectionFooter}>
            <ButtonLink to="/contacts" variant="ghost">
              Все контакты
            </ButtonLink>
          </div>
        </div>
      </AnimatedSection>
    </>
  );
}
