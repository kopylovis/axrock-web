import type { Route } from "./+types/media";
import { ErrorState } from "~/components/common/States";
import { PageSkeleton } from "~/components/common/PageSkeleton";
import { MediaGallery } from "~/components/media/MediaGallery";
import { fetchMedia, fetchMediaAlbums } from "~/api/public-api";
import { breadcrumbs, buildMeta, jsonLd, ogImageFrom } from "~/lib/seo";
import { langFromPath, strings, useT } from "~/i18n";
import styles from "~/styles/page.module.css";

async function load(request: Request) {
  const lang = langFromPath(new URL(request.url).pathname);
  try {
    // Альбомы необязательны: пока их нет, страница остаётся общей лентой.
    const [items, albums] = await Promise.all([
      fetchMedia(null, lang),
      fetchMediaAlbums(lang).catch(() => []),
    ]);
    return { items, albums, failed: false };
  } catch {
    return { items: [], albums: [], failed: true };
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
      title: t.media.metaTitle,
      image: ogImageFrom(matches),
      description: t.media.metaDescription,
      pathname: location.pathname,
    }),
    jsonLd(
      breadcrumbs(
        [
          { name: t.breadcrumbs.home, path: "/" },
          { name: t.nav.media, path: "/media" },
        ],
        lang,
      ),
    ),
  ];
}

export default function Media({ loaderData }: Route.ComponentProps) {
  const { items, albums, failed } = loaderData;
  const t = useT();

  return (
    <div className={styles.page}>
      <div className="container">
        <header className={`${styles.header} ${styles.headerWide}`}>
          <span className={styles.eyebrow}>{t.media.eyebrow}</span>
          <h1 className={styles.title}>{t.media.title}</h1>
          <p className={styles.lead}>{t.media.lead}</p>
        </header>

        {failed ? <ErrorState /> : <MediaGallery items={items} albums={albums} />}
      </div>
    </div>
  );
}
