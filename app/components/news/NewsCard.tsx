import { Link } from "react-router";
import { ResponsiveImage } from "~/components/common/ResponsiveImage";
import type { NewsSummary } from "~/types/content";
import { formatDate } from "~/utils/format";
import styles from "./news.module.css";

export function NewsCard({ item, priority = false }: { item: NewsSummary; priority?: boolean }) {
  return (
    <article className={styles.card}>
      <div className={styles.cover}>
        <ResponsiveImage
          src={item.coverImage}
          spec="newsCover"
          alt=""
          className={styles.coverImage}
          priority={priority}
          sizes="(max-width: 720px) 100vw, 33vw"
        />
      </div>

      <div className={styles.body}>
        <div className={styles.meta}>
          {item.publishedAt ? (
            <time dateTime={item.publishedAt.toISOString()}>{formatDate(item.publishedAt)}</time>
          ) : null}
          {item.category ? <span className={styles.category}>{item.category.name}</span> : null}
          {item.featured ? <span className={styles.featured}>Важное</span> : null}
        </div>

        <h3 className={styles.title}>
          <Link to={`/news/${item.slug}`} className={styles.titleLink}>
            {item.title}
          </Link>
        </h3>

        {item.excerpt ? <p className={styles.excerpt}>{item.excerpt}</p> : null}
      </div>
    </article>
  );
}
