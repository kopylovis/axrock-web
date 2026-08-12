import { data } from "react-router";
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
import homeStyles from "~/components/home/home.module.css";
import releaseStyles from "~/components/music/ReleaseCard.module.css";
import styles from "~/styles/page.module.css";

async function load(slug: string) {
  // Раздел пуст: страница собирается только чтобы пройти проверку пререндера
  // и удаляется из результата сборки.
  if (isPrerenderPlaceholder(slug)) {
    return { category: null as ReleaseCategory | null, releases: [] };
  }

  const category = categoryBySlug(slug);
  if (!category) throw data("Раздел не найден", { status: 404 });

  try {
    const releases = await fetchReleases();
    return { category, releases: releases.filter((release) => release.type === category.type) };
  } catch {
    return { category, releases: [] };
  }
}

export async function loader({ params }: Route.LoaderArgs) {
  return load(params.category);
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  return load(params.category);
}

export function HydrateFallback() {
  return <PageSkeleton />;
}

export function meta({ loaderData, location, matches }: Route.MetaArgs) {
  const category = loaderData?.category;
  if (!category) return buildMeta({ title: "Музыка", pathname: location.pathname });

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
      title: `${category.title} — дискография`,
      image: ogImageFrom(matches),
      description: `${category.description} Группа «Ангел-Хранитель»: треклисты и ссылки на площадки.`,
      pathname: location.pathname,
    }),
    jsonLd(
      breadcrumbs([
        { name: "Главная", path: "/" },
        { name: "Музыка", path: "/music" },
        { name: category.title, path: `/music/${category.slug}` },
      ]),
    ),
    ...albums.map((album) => jsonLd(album)),
  ];
}

export default function MusicCategory({ loaderData }: Route.ComponentProps) {
  const { category, releases } = loaderData;
  const { musicLinks } = useSiteData();

  if (!category) return null;

  return (
    <div className={styles.page}>
      <div className="container">
        <header className={`${styles.header} ${styles.headerWide}`}>
          <span className={styles.eyebrow}>Дискография</span>
          <h1 className={styles.title}>{category.title}</h1>
          <p className={styles.lead}>{category.description}</p>
        </header>

        {musicLinks.length > 0 ? (
          <div className={homeStyles.sectionFooter} style={{ marginBottom: "var(--space-8)" }}>
            <MusicPlatformLinks links={musicLinks} />
          </div>
        ) : null}

        {releases.length === 0 ? (
          <EmptyState
            title="Пока пусто"
            description="В этом разделе ещё нет релизов."
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
            Все разделы
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
