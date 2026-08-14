import type { Route } from "./+types/home";
import { useSiteData } from "~/layouts/PublicLayout";
import { Hero } from "~/components/home/Hero";
import { AnimatedSection } from "~/components/common/AnimatedSection";
import { SectionHeading } from "~/components/common/SectionHeading";
import { ButtonLink } from "~/components/common/Button";
import { EmptyState } from "~/components/common/States";
import { PageSkeleton } from "~/components/common/PageSkeleton";
import { Marquee } from "~/components/common/Marquee";
import { NewsCard } from "~/components/news/NewsCard";
import { EventsStrip } from "~/components/concerts/EventsStrip";
import { MusicPlatformLinks, SocialLinks } from "~/components/layout/LinkLists";
import { ReleaseTile } from "~/components/music/ReleaseTile";
import { fetchNews, fetchReleases, fetchUpcomingConcerts } from "~/api/public-api";
import { buildMeta, jsonLd, ogImageFrom } from "~/lib/seo";
import { langFromPath, strings, useT } from "~/i18n";
import { SITE_URL } from "~/lib/config";
import releaseStyles from "~/components/music/ReleaseCard.module.css";
import styles from "~/components/home/home.module.css";

const ABOUT_ANCHOR = "events";

async function load(request: Request) {
  const lang = langFromPath(new URL(request.url).pathname);
  const [concerts, news, releases] = await Promise.all([
    fetchUpcomingConcerts(5, lang).catch(() => []),
    fetchNews({ page: 1, pageSize: 3 }, lang).catch(() => null),
    fetchReleases(lang).catch(() => []),
  ]);

  return {
    concerts,
    news: news?.items ?? [],
    releases: releases.slice(0, 5),
  };
}

export async function loader({ request }: Route.LoaderArgs) {
  return load(request);
}

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  return load(request);
}

export function HydrateFallback() {
  return <PageSkeleton />;
}

export function meta({ location, matches }: Route.MetaArgs) {
  const t = strings(langFromPath(location.pathname));

  return [
    ...buildMeta({
      title: t.home.metaTitle,
      image: ogImageFrom(matches),
      description:
        t.home.metaDescription,
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

export default function Home({ loaderData }: Route.ComponentProps) {
  const { concerts, news, releases } = loaderData;
  const { settings, socialLinks, musicLinks } = useSiteData();
  const t = useT();

  // Даты перемежаются короткими фразами: при двух концертах лента иначе
  // выглядит как повтор одного и того же.
  // Девиз вместо дат: афиша и так идёт следующей секцией, дублировать её незачем.
  const marqueeItems = t.home.marquee;

  return (
    <>
      <Hero settings={settings} nextConcert={concerts[0] ?? null} />

      <Marquee items={marqueeItems} />

      <AnimatedSection className="section" id={ABOUT_ANCHOR} ariaLabelledby="events-heading">
        <div className="container">
          <SectionHeading
            id="events-heading"
            eyebrow={t.home.eventsEyebrow}
            title={t.home.eventsTitle}
            action={
              <ButtonLink to="/concerts" variant="quiet">
                {t.home.eventsAll}
              </ButtonLink>
            }
          />

          {concerts.length > 0 ? (
            <EventsStrip concerts={concerts} />
          ) : (
            <EmptyState
              title={t.home.eventsEmptyTitle}
              description={t.home.eventsEmptyDescription}
            />
          )}
        </div>
      </AnimatedSection>

      {news.length > 0 ? (
        <AnimatedSection className="section" ariaLabelledby="news-heading">
          <div className="container">
            <SectionHeading
              id="news-heading"
              eyebrow={t.home.newsEyebrow}
              title={t.home.newsTitle}
              action={
                <ButtonLink to="/news" variant="quiet">
                  {t.home.newsAll}
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

      {releases.length > 0 ? (
        <AnimatedSection className="section" ariaLabelledby="music-heading">
          <div className="container">
            <SectionHeading
              id="music-heading"
              eyebrow={t.home.musicEyebrow}
              title={t.home.musicTitle}
              action={
                <ButtonLink to="/music" variant="quiet">
                  {t.home.musicAll}
                </ButtonLink>
              }
            />

            <div className={releaseStyles.tileGrid}>
              {releases.map((release) => (
                <ReleaseTile
                  key={release.id}
                  release={release}
                  sizes="(max-width: 720px) 50vw, 210px"
                />
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

      {/* Соцсети и площадки — соседи по смыслу: у каждого свой заголовок, но
          между ними обычный отступ, а не расстояние между разделами страницы. */}
      {socialLinks.length > 0 || musicLinks.length > 0 ? (
        <AnimatedSection className="section" as="div">
          <div className={`container ${styles.linksStack}`}>
            {socialLinks.length > 0 ? (
              <section aria-labelledby="social-heading">
                <SectionHeading id="social-heading" eyebrow={t.home.socialEyebrow} title={t.home.socialTitle} />
                <SocialLinks links={socialLinks} />
              </section>
            ) : null}

            {musicLinks.length > 0 ? (
              <section aria-labelledby="listen-heading">
                <SectionHeading id="listen-heading" eyebrow={t.home.listenEyebrow} title={t.home.listenTitle} />
                <MusicPlatformLinks links={musicLinks} />
              </section>
            ) : null}
          </div>
        </AnimatedSection>
      ) : null}
    </>
  );
}
