import { useEffect } from "react";
import { data, useLocation } from "react-router";
import type { Route } from "./+types/music-category";
import { useSiteData } from "~/layouts/PublicLayout";
import { AnimatedSection } from "~/components/common/AnimatedSection";
import { ButtonLink } from "~/components/common/Button";
import { EmptyState } from "~/components/common/States";
import { PageSkeleton } from "~/components/common/PageSkeleton";
import { MusicPlatformLinks } from "~/components/layout/LinkLists";
import { ReleaseCard } from "~/components/music/ReleaseCard";
import { fetchReleases } from "~/api/public-api";
import { breadcrumbs, buildMeta, jsonLd, ogImageFrom } from "~/lib/seo";
import { isPrerenderPlaceholder } from "~/lib/prerender";
import { SITE_URL, canonicalUrl } from "~/lib/config";
import { absoluteImageUrl } from "~/utils/images";
import { categoryBySlug, type ReleaseCategory } from "~/utils/release-categories";
import { langFromPath, strings, useT } from "~/i18n";
import homeStyles from "~/components/home/home.module.css";
import releaseStyles from "~/components/music/ReleaseCard.module.css";
import styles from "~/styles/page.module.css";

async function load(slug: string, request: Request) {
  // Раздел пуст: страница собирается только чтобы пройти проверку пререндера
  // и удаляется из результата сборки.
  if (isPrerenderPlaceholder(slug)) {
    return { category: null as ReleaseCategory | null, releases: [] };
  }

  const category = categoryBySlug(slug);
  if (!category) throw data("Section not found", { status: 404 });

  const lang = langFromPath(new URL(request.url).pathname);
  try {
    const releases = await fetchReleases(lang);
    return { category, releases: releases.filter((release) => release.type === category.type) };
  } catch {
    return { category, releases: [] };
  }
}

export async function loader({ params, request }: Route.LoaderArgs) {
  return load(params.category, request);
}

export async function clientLoader({ params, request }: Route.ClientLoaderArgs) {
  return load(params.category, request);
}

export function HydrateFallback() {
  return <PageSkeleton />;
}

export function meta({ loaderData, location, matches }: Route.MetaArgs) {
  const lang = langFromPath(location.pathname);
  const t = strings(lang);
  const category = loaderData?.category;
  if (!category) return buildMeta({ title: t.music.title, pathname: location.pathname });

  const section = t.releaseCategories[category.slug];

  const albums = (loaderData?.releases ?? []).map((release) => ({
    "@context": "https://schema.org",
    "@type": release.type === "SINGLE" ? "MusicRecording" : "MusicAlbum",
    name: release.title,
    url: canonicalUrl(`/music/${category.slug}`),
    datePublished: release.releaseDate?.toISOString(),
    image: absoluteImageUrl(release.coverImage, SITE_URL),
    byArtist: { "@type": "MusicGroup", name: "Ангел-Хранитель" },
  }));

  return [
    ...buildMeta({
      title: t.music.categoryMetaTitle(section.title),
      image: ogImageFrom(matches),
      description: t.music.categoryMetaDescription(section.description),
      pathname: location.pathname,
    }),
    jsonLd(
      breadcrumbs(
        [
          { name: t.breadcrumbs.home, path: "/" },
          { name: t.nav.music, path: "/music" },
          { name: section.title, path: `/music/${category.slug}` },
        ],
        lang,
      ),
    ),
    ...albums.map((album) => jsonLd(album)),
  ];
}

export default function MusicCategory({ loaderData }: Route.ComponentProps) {
  const { category, releases } = loaderData;
  const { musicLinks } = useSiteData();
  const t = useT();
  const { hash } = useLocation();

  // При заходе прямо по ссылке карточек ещё нет в DOM, и браузер сам к якорю
  // не прокрутит — доводим до неё, когда релизы отрисованы.
  useEffect(() => {
    if (!hash) return;
    document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView({ block: "start" });
  }, [hash, releases]);

  if (!category) return null;

  const section = t.releaseCategories[category.slug];

  return (
    <div className={styles.page}>
      <div className="container">
        <header className={`${styles.header} ${styles.headerWide}`}>
          <span className={styles.eyebrow}>{t.music.eyebrow}</span>
          <h1 className={styles.title}>{section.title}</h1>
          <p className={styles.lead}>{section.description}</p>
        </header>

        {musicLinks.length > 0 ? (
          <div className={homeStyles.sectionFooter} style={{ marginBottom: "var(--space-8)" }}>
            <MusicPlatformLinks links={musicLinks} />
          </div>
        ) : null}

        {releases.length === 0 ? (
          <EmptyState
            title={t.music.categoryEmptyTitle}
            description={t.music.categoryEmptyDescription}
          />
        ) : (
          <AnimatedSection className={releaseStyles.grid}>
            {releases.map((release) => (
              <ReleaseCard key={release.id} release={release} />
            ))}
          </AnimatedSection>
        )}

        <div className={homeStyles.sectionFooter}>
          <ButtonLink to="/music" variant="ghost">
            {t.music.allSections}
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
