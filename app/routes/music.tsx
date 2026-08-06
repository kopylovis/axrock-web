import { useState } from "react";
import type { Route } from "./+types/music";
import { useSiteData } from "~/layouts/PublicLayout";
import { AnimatedSection } from "~/components/common/AnimatedSection";
import { EmptyState, ErrorState } from "~/components/common/States";
import { PageSkeleton } from "~/components/common/PageSkeleton";
import { MusicPlatformLinks } from "~/components/layout/LinkLists";
import { ReleaseCard } from "~/components/music/ReleaseCard";
import { fetchReleases } from "~/api/public-api";
import { breadcrumbs, buildMeta, jsonLd, ogImageFrom } from "~/lib/seo";
import { SITE_URL, canonicalUrl } from "~/lib/config";
import { absoluteImageUrl } from "~/utils/images";
import type { ReleaseType } from "~/types/content";
import homeStyles from "~/components/home/home.module.css";
import newsStyles from "~/components/news/news.module.css";
import releaseStyles from "~/components/music/ReleaseCard.module.css";
import styles from "~/styles/page.module.css";

async function load() {
  try {
    return { releases: await fetchReleases(), failed: false as const };
  } catch {
    return { releases: [], failed: true as const };
  }
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

export function meta({ loaderData, location, matches }: Route.MetaArgs) {
  const albums = (loaderData?.releases ?? []).map((release) => ({
    "@context": "https://schema.org",
    "@type": release.type === "SINGLE" ? "MusicRecording" : "MusicAlbum",
    name: release.title,
    url: canonicalUrl("/music"),
    datePublished: release.releaseDate?.toISOString(),
    image: absoluteImageUrl(release.coverImage, SITE_URL),
    byArtist: { "@type": "MusicGroup", name: "Ангел-Хранитель" },
  }));

  return [
    ...buildMeta({
      title: "Музыка и дискография",
      image: ogImageFrom(matches),
      description:
        "Дискография группы «Ангел-Хранитель»: альбомы, EP и синглы, треклисты и ссылки на музыкальные площадки.",
      pathname: location.pathname,
    }),
    jsonLd(
      breadcrumbs([
        { name: "Главная", path: "/" },
        { name: "Музыка", path: "/music" },
      ]),
    ),
    ...albums.map((album) => jsonLd(album)),
  ];
}

const FILTERS: Array<{ value: ReleaseType | "ALL"; label: string }> = [
  { value: "ALL", label: "Все" },
  { value: "ALBUM", label: "Альбомы" },
  { value: "EP", label: "EP" },
  { value: "SINGLE", label: "Синглы" },
  { value: "LIVE", label: "Концертные" },
  { value: "COMPILATION", label: "Сборники" },
];

export default function Music({ loaderData }: Route.ComponentProps) {
  const { releases, failed } = loaderData;
  const { musicLinks } = useSiteData();
  const [filter, setFilter] = useState<ReleaseType | "ALL">("ALL");

  const availableTypes = new Set(releases.map((release) => release.type));
  const visibleFilters = FILTERS.filter(
    (item) => item.value === "ALL" || availableTypes.has(item.value),
  );
  const shown = filter === "ALL" ? releases : releases.filter((item) => item.type === filter);

  return (
    <div className={styles.page}>
      <div className="container">
        <header className={`${styles.header} ${styles.headerWide}`}>
          <span className={styles.eyebrow}>Дискография</span>
          <h1 className={styles.title}>Музыка</h1>
          <p className={styles.lead}>
            Альбомы, EP и синглы группы. Слушайте на любой удобной площадке.
          </p>
        </header>

        {musicLinks.length > 0 ? (
          <div className={homeStyles.sectionFooter} style={{ marginBottom: "var(--space-8)" }}>
            <MusicPlatformLinks links={musicLinks} />
          </div>
        ) : null}

        {failed ? <ErrorState /> : null}

        {!failed && releases.length === 0 ? (
          <EmptyState
            title="Релизы скоро появятся"
            description="Дискография наполняется через административную панель."
          />
        ) : null}

        {releases.length > 0 ? (
          <>
            {visibleFilters.length > 2 ? (
              <div className={newsStyles.filters}>
                {visibleFilters.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    className={`${newsStyles.filter} ${filter === item.value ? newsStyles.filterActive : ""}`}
                    aria-pressed={filter === item.value}
                    onClick={() => setFilter(item.value)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            ) : null}

            <AnimatedSection className={releaseStyles.grid}>
              {shown.map((release) => (
                <ReleaseCard key={release.id} release={release} />
              ))}
            </AnimatedSection>
          </>
        ) : null}
      </div>
    </div>
  );
}
