import type { Route } from "./+types/media";
import { ErrorState } from "~/components/common/States";
import { PageSkeleton } from "~/components/common/PageSkeleton";
import { MediaGallery } from "~/components/media/MediaGallery";
import { fetchMedia } from "~/api/public-api";
import { breadcrumbs, buildMeta, jsonLd, ogImageFrom } from "~/lib/seo";
import styles from "~/styles/page.module.css";

async function load() {
  try {
    return { items: await fetchMedia(null), failed: false };
  } catch {
    return { items: [], failed: true };
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

export function meta({ location, matches }: Route.MetaArgs) {
  return [
    ...buildMeta({
      title: "Фото и видео",
      image: ogImageFrom(matches),
      description:
        "Фотографии и видео группы «Ангел-Хранитель»: концерты, backstage, афиши и обложки релизов.",
      pathname: location.pathname,
    }),
    jsonLd(
      breadcrumbs([
        { name: "Главная", path: "/" },
        { name: "Медиа", path: "/media" },
      ]),
    ),
  ];
}

export default function Media({ loaderData }: Route.ComponentProps) {
  const { items, failed } = loaderData;

  return (
    <div className={styles.page}>
      <div className="container">
        <header className={`${styles.header} ${styles.headerWide}`}>
          <span className={styles.eyebrow}>Галерея</span>
          <h1 className={styles.title}>Фото и видео</h1>
          <p className={styles.lead}>Кадры с концертов, backstage и официальные материалы.</p>
        </header>

        {failed ? <ErrorState /> : <MediaGallery items={items} />}
      </div>
    </div>
  );
}
