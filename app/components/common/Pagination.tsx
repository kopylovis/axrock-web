import { Link, useSearchParams } from "react-router";
import { useT } from "~/i18n";
import styles from "~/components/news/news.module.css";

interface PaginationProps {
  page: number;
  totalPages: number;
  label?: string;
}

export function Pagination({ page, totalPages, label }: PaginationProps) {
  const [searchParams] = useSearchParams();
  const t = useT();

  if (totalPages <= 1) return null;

  const buildHref = (target: number) => {
    const next = new URLSearchParams(searchParams);
    if (target <= 1) next.delete("page");
    else next.set("page", String(target));
    const query = next.toString();
    return query ? `?${query}` : "";
  };

  return (
    <nav className={styles.pagination} aria-label={label ?? t.common.pagination}>
      {page > 1 ? (
        <Link to={buildHref(page - 1)} className={styles.filter} rel="prev">
          {t.common.prev}
        </Link>
      ) : null}

      <span className={styles.pageInfo}>
        {page} / {totalPages}
      </span>

      {page < totalPages ? (
        <Link to={buildHref(page + 1)} className={styles.filter} rel="next">
          {t.common.next}
        </Link>
      ) : null}
    </nav>
  );
}
