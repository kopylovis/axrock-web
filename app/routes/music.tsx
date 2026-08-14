import { Link } from "react-router";
import type { Route } from "./+types/music";
import { useSiteData } from "~/layouts/PublicLayout";
import { AnimatedSection } from "~/components/common/AnimatedSection";
import { EmptyState, ErrorState } from "~/components/common/States";
import { PageSkeleton } from "~/components/common/PageSkeleton";
import { ResponsiveImage } from "~/components/common/ResponsiveImage";
import { MusicPlatformLinks } from "~/components/layout/LinkLists";
import { fetchMusicSections, fetchReleases } from "~/api/public-api";
import { breadcrumbs, buildMeta, jsonLd, ogImageFrom } from "~/lib/seo";
import { RELEASE_CATEGORIES } from "~/utils/release-categories";
import { langFromPath, strings, useLocalPath, useT } from "~/i18n";
import homeStyles from "~/components/home/home.module.css";
import styles from "~/styles/page.module.css";

async function load(request: Request) {
  const lang = langFromPath(new URL(request.url).pathname);
  try {
    const [releases, sections] = await Promise.all([
      fetchReleases(lang),
      // Обложка раздела необязательна — без неё соберём коллаж из релизов.
      fetchMusicSections().catch(() => []),
    ]);
    return { releases, sections, failed: false as const };
  } catch {
    return { releases: [], sections: [], failed: true as const };
  }
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
  const lang = langFromPath(location.pathname);
  const t = strings(lang);

  return [
    ...buildMeta({
      title: t.music.metaTitle,
      image: ogImageFrom(matches),
      description: t.music.metaDescription,
      pathname: location.pathname,
    }),
    jsonLd(
      breadcrumbs(
        [
          { name: t.breadcrumbs.home, path: "/" },
          { name: t.nav.music, path: "/music" },
        ],
        lang,
      ),
    ),
  ];
}

/** Обложка раздела: своя картинка, а если её нет — коллаж из обложек релизов. */
function SectionCover({ image, covers }: { image: string | null; covers: string[] }) {
  if (image || covers.length < 2) {
    return (
      <ResponsiveImage
        src={image ?? covers[0] ?? null}
        spec="releaseCover"
        alt=""
        className={styles.tileCover}
        sizes="(max-width: 700px) 100vw, 320px"
        compactPlaceholder
      />
    );
  }

  return (
    <div className={styles.tileCollage}>
      {covers.slice(0, 4).map((cover) => (
        <ResponsiveImage
          key={cover}
          src={cover}
          spec="releaseCover"
          alt=""
          className={styles.tileCollageItem}
          sizes="160px"
          compactPlaceholder
        />
      ))}
    </div>
  );
}

export default function Music({ loaderData }: Route.ComponentProps) {
  const { releases, sections: covers, failed } = loaderData;
  const { musicLinks } = useSiteData();
  const t = useT();
  const lp = useLocalPath();

  // Пустые разделы не показываем: заходить в них не за чем.
  const sections = RELEASE_CATEGORIES.map((category) => {
    const items = releases.filter((release) => release.type === category.type);
    const image = covers.find((cover) => cover.slug === category.slug)?.image ?? null;
    return { category, items, image };
  }).filter((section) => section.items.length > 0);

  return (
    <div className={styles.page}>
      <div className="container">
        <header className={`${styles.header} ${styles.headerWide}`}>
          <span className={styles.eyebrow}>{t.music.eyebrow}</span>
          <h1 className={styles.title}>{t.music.title}</h1>
          <p className={styles.lead}>
            {t.music.lead}
          </p>
        </header>

        {musicLinks.length > 0 ? (
          <div className={homeStyles.sectionFooter} style={{ marginBottom: "var(--space-8)" }}>
            <MusicPlatformLinks links={musicLinks} />
          </div>
        ) : null}

        {failed ? <ErrorState /> : null}

        {!failed && sections.length === 0 ? (
          <EmptyState
            title={t.music.emptyTitle}
            description={t.music.emptyDescription}
          />
        ) : null}

        {sections.length > 0 ? (
          <AnimatedSection className={styles.tiles}>
            {sections.map(({ category, items, image }) => {
              // Сначала свежие: коллаж собирается из последних обложек раздела.
              const releaseCovers = [...items]
                .sort((a, b) => (b.releaseDate?.getTime() ?? 0) - (a.releaseDate?.getTime() ?? 0))
                .map((release) => release.coverImage)
                .filter((cover): cover is string => Boolean(cover));

              return (
                <Link key={category.slug} to={lp(`/music/${category.slug}`)} className={styles.tile}>
                  <SectionCover image={image} covers={releaseCovers} />
                  <div className={styles.tileBody}>
                    <h2 className={styles.tileTitle}>{t.releaseCategories[category.slug].title}</h2>
                    <p className={styles.tileText}>{t.releaseCategories[category.slug].description}</p>
                    <span className={styles.tileCount}>{t.music.releaseCount(items.length)}</span>
                  </div>
                </Link>
              );
            })}
          </AnimatedSection>
        ) : null}
      </div>
    </div>
  );
}
