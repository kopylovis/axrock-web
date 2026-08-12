import { data, Link, useLocation } from "react-router";
import type { Route } from "./+types/news-detail";
import { AnimatedSection } from "~/components/common/AnimatedSection";
import { ResponsiveImage } from "~/components/common/ResponsiveImage";
import { RichText } from "~/components/common/RichText";
import { SectionHeading } from "~/components/common/SectionHeading";
import { PageSkeleton } from "~/components/common/PageSkeleton";
import { NewsCard } from "~/components/news/NewsCard";
import { fetchNewsBySlug } from "~/api/public-api";
import { ApiError } from "~/api/errors";
import { SITE_URL, canonicalUrl } from "~/lib/config";
import { absoluteImageUrl } from "~/utils/images";
import { breadcrumbs, buildMeta, jsonLd, ogImageFrom } from "~/lib/seo";
import { isPrerenderPlaceholder } from "~/lib/prerender";
import { formatDate } from "~/utils/format";
import detailStyles from "~/components/news/NewsDetail.module.css";
import newsStyles from "~/components/news/news.module.css";
import styles from "~/styles/page.module.css";

async function load(slug: string) {
  // Раздел пуст: страница собирается только чтобы пройти проверку пререндера
  // и удаляется из результата сборки.
  if (isPrerenderPlaceholder(slug)) return { article: null };

  try {
    return { article: await fetchNewsBySlug(slug) };
  } catch (error) {
    if (error instanceof ApiError && error.isNotFound) {
      throw data("Новость не найдена", { status: 404 });
    }
    throw error;
  }
}

export async function loader({ params }: Route.LoaderArgs) {
  return load(params.slug);
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  return load(params.slug);
}

export function HydrateFallback() {
  return <PageSkeleton />;
}

export function meta({ loaderData, location, matches }: Route.MetaArgs) {
  if (!loaderData?.article) {
    return buildMeta({ title: "Новость не найдена", pathname: location.pathname, noindex: true });
  }

  const { article } = loaderData;
  const url = canonicalUrl(location.pathname);

  return [
    ...buildMeta({
      title: article.seoTitle ?? article.title,
      description: article.seoDescription ?? article.excerpt,
      pathname: location.pathname,
      image: article.coverImage ?? ogImageFrom(matches),
      type: "article",
      publishedTime: article.publishedAt?.toISOString(),
      modifiedTime: article.updatedAt?.toISOString(),
    }),
    jsonLd({
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      headline: article.title,
      description: article.excerpt ?? undefined,
      image: absoluteImageUrl(article.coverImage, SITE_URL) ? [absoluteImageUrl(article.coverImage, SITE_URL)] : undefined,
      datePublished: article.publishedAt?.toISOString(),
      dateModified: article.updatedAt?.toISOString() ?? article.publishedAt?.toISOString(),
      mainEntityOfPage: url,
      author: { "@type": "MusicGroup", name: "Ангел-Хранитель" },
      publisher: { "@type": "MusicGroup", name: "Ангел-Хранитель" },
    }),
    jsonLd(
      breadcrumbs([
        { name: "Главная", path: "/" },
        { name: "Новости", path: "/news" },
        { name: article.title, path: location.pathname },
      ]),
    ),
  ];
}

export default function NewsDetail({ loaderData }: Route.ComponentProps) {
  const { article } = loaderData;
  const location = useLocation();
  const shareUrl = canonicalUrl(location.pathname);

  if (!article) return null;

  const shareText = encodeURIComponent(article.title);
  const showUpdated =
    article.updatedAt &&
    article.publishedAt &&
    article.updatedAt.getTime() - article.publishedAt.getTime() > 60_000;

  return (
    <div className={styles.page}>
      <div className="container">
        <Link to="/news" className={styles.back}>
          ← Все новости
        </Link>

        <article className={detailStyles.article}>
          <div className={detailStyles.meta}>
            {article.publishedAt ? (
              <time dateTime={article.publishedAt.toISOString()}>
                {formatDate(article.publishedAt)}
              </time>
            ) : null}
            {article.category ? (
              <span className={detailStyles.category}>{article.category.name}</span>
            ) : null}
            {showUpdated && article.updatedAt ? (
              <span>обновлено {formatDate(article.updatedAt)}</span>
            ) : null}
          </div>

          <div className={detailStyles.main}>
            <h1 className={detailStyles.title}>{article.title}</h1>

            {article.excerpt ? <p className={detailStyles.excerpt}>{article.excerpt}</p> : null}

            {article.coverImage ? (
              <ResponsiveImage
                src={article.coverImage}
                spec="newsCover"
                alt={article.title}
                className={detailStyles.cover}
                aspectRatio="16 / 9"
                priority
                sizes="100vw"
              />
            ) : null}

            <RichText doc={article.content} />
          </div>

          <div className={detailStyles.share}>
            <span className={detailStyles.shareLabel}>Поделиться</span>
            <a
              className={detailStyles.shareLink}
              href={`https://vk.com/share.php?url=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              ВКонтакте
            </a>
            <a
              className={detailStyles.shareLink}
              href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${shareText}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Telegram
            </a>
            <a
              className={detailStyles.shareLink}
              href={`https://wa.me/?text=${shareText}%20${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp
            </a>
          </div>

          {article.previous || article.next ? (
            <nav className={detailStyles.neighbours} aria-label="Соседние публикации">
              {article.previous ? (
                <div className={detailStyles.neighbour}>
                  <span className={detailStyles.neighbourLabel}>Предыдущая</span>
                  <Link to={`/news/${article.previous.slug}`} className={detailStyles.neighbourTitle}>
                    {article.previous.title}
                  </Link>
                </div>
              ) : (
                <span />
              )}
              {article.next ? (
                <div className={`${detailStyles.neighbour} ${detailStyles.neighbourNext}`}>
                  <span className={detailStyles.neighbourLabel}>Следующая</span>
                  <Link to={`/news/${article.next.slug}`} className={detailStyles.neighbourTitle}>
                    {article.next.title}
                  </Link>
                </div>
              ) : null}
            </nav>
          ) : null}
        </article>

        {article.related.length > 0 ? (
          <AnimatedSection className={detailStyles.related}>
            <SectionHeading title="Похожие публикации" eyebrow="Читайте также" />
            <div className={newsStyles.grid}>
              {article.related.map((item) => (
                <NewsCard key={item.id} item={item} />
              ))}
            </div>
          </AnimatedSection>
        ) : null}
      </div>
    </div>
  );
}
