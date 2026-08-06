import { Link, useSearchParams } from "react-router";
import styles from "~/components/news/news.module.css";

interface PaginationProps {
  page: number;
  totalPages: number;
  label?: string;
}

export function Pagination({ page, totalPages, label = "Постраничная навигация" }: PaginationProps) {
  const [searchParams] = useSearchParams();

  if (totalPages <= 1) return null;

  const buildHref = (target: number) => {
    const next = new URLSearchParams(searchParams);
    if (target <= 1) next.delete("page");
    else next.set("page", String(target));
    const query = next.toString();
    return query ? `?${query}` : "";
  };

  return (
    <nav className={styles.pagination} aria-label={label}>
      {page > 1 ? (
        <Link to={buildHref(page - 1)} className={styles.filter} rel="prev">
          ← Назад
        </Link>
      ) : null}

      <span className={styles.pageInfo}>
        {page} / {totalPages}
      </span>

      {page < totalPages ? (
        <Link to={buildHref(page + 1)} className={styles.filter} rel="next">
          Вперёд →
        </Link>
      ) : null}
    </nav>
  );
}
