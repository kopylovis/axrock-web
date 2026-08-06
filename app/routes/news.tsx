import { Link } from "react-router";
import type { Route } from "./+types/news";
import { AnimatedSection } from "~/components/common/AnimatedSection";
import { Pagination } from "~/components/common/Pagination";
import { EmptyState, ErrorState } from "~/components/common/States";
import { PageSkeleton } from "~/components/common/PageSkeleton";
import { NewsCard } from "~/components/news/NewsCard";
import { fetchNews, fetchNewsCategories } from "~/api/public-api";
import { breadcrumbs, buildMeta, jsonLd, ogImageFrom } from "~/lib/seo";
import newsStyles from "~/components/news/news.module.css";
import styles from "~/styles/page.module.css";

const PAGE_SIZE = 9;

async function load(request: Request) {
  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get("page") ?? 1) || 1);
  const category = url.searchParams.get("category");

  const [news, categories] = await Promise.all([
    fetchNews({ page, pageSize: PAGE_SIZE, category }).catch(() => null),
    fetchNewsCategories().catch(() => []),
  ]);

  return { news, categories, category };
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
  return [
    ...buildMeta({
      title: "Новости",
      image: ogImageFrom(matches),
      description: "Новости рок-группы «Ангел-Хранитель»: релизы, концерты, интервью и анонсы.",
      pathname: location.pathname,
    }),
    jsonLd(
      breadcrumbs([
        { name: "Главная", path: "/" },
        { name: "Новости", path: "/news" },
      ]),
    ),
  ];
}

export default function News({ loaderData }: Route.ComponentProps) {
  const { news, categories, category } = loaderData;

  return (
    <div className={styles.page}>
      <div className="container">
        <header className={`${styles.header} ${styles.headerWide}`}>
          <span className={styles.eyebrow}>Новости</span>
          <h1 className={styles.title}>Что происходит с группой</h1>
          <p className={styles.lead}>Анонсы концертов, релизы и всё, о чём стоит рассказать.</p>
        </header>

        {categories.length > 0 ? (
          <div className={newsStyles.filters}>
            <Link
              to="/news"
              className={`${newsStyles.filter} ${!category ? newsStyles.filterActive : ""}`}
            >
              Все
            </Link>
            {categories.map((item) => (
              <Link
                key={item.id}
                to={`/news?category=${encodeURIComponent(item.slug)}`}
                className={`${newsStyles.filter} ${category === item.slug ? newsStyles.filterActive : ""}`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        ) : null}

        {!news ? <ErrorState /> : null}

        {news && news.items.length === 0 ? (
          <EmptyState
            title="Публикаций пока нет"
            description={
              category
                ? "В этой категории ещё нет новостей. Посмотрите другие разделы."
                : "Новости появятся здесь, как только мы их опубликуем."
            }
          />
        ) : null}

        {news && news.items.length > 0 ? (
          <AnimatedSection className={styles.block}>
            <div className={`${newsStyles.grid} ${!category && news.page === 1 ? newsStyles.gridFeatured : ""}`}>
              {news.items.map((item, index) => (
                <NewsCard key={item.id} item={item} priority={index < 3} />
              ))}
            </div>
            <Pagination page={news.page} totalPages={news.totalPages} />
          </AnimatedSection>
        ) : null}
      </div>
    </div>
  );
}
