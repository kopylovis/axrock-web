import { Link, useNavigate, useRevalidator, useSearchParams } from "react-router";
import type { Route } from "./+types/news-list";
import { deleteNews, duplicateNews, listNews, setNewsPublished } from "~/api/admin-api";
import { PageSkeleton } from "~/components/common/PageSkeleton";
import { EmptyState, ErrorState } from "~/components/common/States";
import { StatusChip } from "~/components/admin/fields";
import { RowMenu } from "~/components/admin/RowMenu";
import { formatDateTime, parseUtcSafe } from "~/utils/admin-format";
import { SortableTh, compareValues, useTableSort } from "~/components/admin/sortable-table";
import styles from "~/components/admin/admin.module.css";

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get("page") ?? 1) || 1);
  const status = url.searchParams.get("status");
  const query = url.searchParams.get("query");

  try {
    return { data: await listNews({ page, status, query }), failed: false as const };
  } catch {
    return { data: null, failed: true as const };
  }
}

export function HydrateFallback() {
  return <PageSkeleton label="Загрузка новостей" />;
}

const FILTERS = [
  { value: "", label: "Все" },
  { value: "DRAFT", label: "Черновики" },
  { value: "PUBLISHED", label: "Опубликованные" },
  { value: "ARCHIVED", label: "Архив" },
];

export default function AdminNewsList({ loaderData }: Route.ComponentProps) {
  const { data, failed } = loaderData;
  const { sort, toggle } = useTableSort<"title" | "status" | "category" | "published">({ key: "published", direction: "desc" });
  // Список постраничный: сортируется загруженная страница, а не вся база.
  const sorted = [...(data?.items ?? [])].sort((a, b) => {
    if (sort.key === "title") return compareValues(a.title, b.title, sort.direction);
    if (sort.key === "status") return compareValues(a.status, b.status, sort.direction);
    if (sort.key === "category") return compareValues(a.categoryName ?? "", b.categoryName ?? "", sort.direction);
    if (sort.key === "published") return compareValues(a.publishedAt ?? "", b.publishedAt ?? "", sort.direction);
    return 0;
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const revalidator = useRevalidator();
  const navigate = useNavigate();
  const activeStatus = searchParams.get("status") ?? "";

  async function togglePublished(id: number, published: boolean) {
    await setNewsPublished(id, published);
    revalidator.revalidate();
  }

  async function duplicate(id: number) {
    const copy = await duplicateNews(id);
    navigate(`/admin/news/${copy.id}`);
  }

  async function remove(id: number, title: string) {
    if (!window.confirm(`Удалить новость «${title}»? Действие необратимо.`)) return;
    await deleteNews(id);
    revalidator.revalidate();
  }

  return (
    <>
      <div className={styles.pageHead}>
        <h1 className={styles.pageTitle}>Новости</h1>
        <div className={styles.pageActions}>
          <Link to="/admin/news/new" className={`${styles.btn} ${styles.btnPrimary}`}>
            + Новость
          </Link>
        </div>
      </div>

      <div className={styles.filters}>
        <input
          type="search"
          className={styles.searchInput}
          placeholder="Поиск по заголовку"
          defaultValue={searchParams.get("query") ?? ""}
          onKeyDown={(event) => {
            if (event.key !== "Enter") return;
            const next = new URLSearchParams(searchParams);
            const value = event.currentTarget.value.trim();
            if (value) next.set("query", value);
            else next.delete("query");
            next.delete("page");
            setSearchParams(next);
          }}
        />
        {FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            className={`${styles.filterButton} ${activeStatus === filter.value ? styles.filterButtonActive : ""}`}
            onClick={() => {
              const next = new URLSearchParams(searchParams);
              if (filter.value) next.set("status", filter.value);
              else next.delete("status");
              next.delete("page");
              setSearchParams(next);
            }}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {failed || !data ? <ErrorState /> : null}

      {data && data.items.length === 0 ? (
        <EmptyState title="Новостей пока нет" description="Создайте первую публикацию." />
      ) : null}

      {data && data.items.length > 0 ? (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <SortableTh
                      label="Заголовок"
                      sortKey="title"
                      sort={sort}
                      onSort={toggle}
                    />
                <SortableTh
                      label="Статус"
                      sortKey="status"
                      sort={sort}
                      onSort={toggle}
                    />
                <SortableTh
                      label="Категория"
                      sortKey="category"
                      sort={sort}
                      onSort={toggle}
                    />
                <SortableTh
                      label="Публикация"
                      sortKey="published"
                      sort={sort}
                      onSort={toggle}
                      preferred="desc"
                    />
                <th />
              </tr>
            </thead>
            <tbody>
              {sorted.map((item) => (
                <tr key={item.id} className={styles.rowLinked}>
                  <td>
                    <Link to={`/admin/news/${item.id}`} className={styles.rowLink}>
                      {item.title}
                    </Link>
                    {item.featured ? " ★" : ""}
                  </td>
                  <td>
                    <StatusChip status={item.status} />
                  </td>
                  <td>{item.categoryName ?? "—"}</td>
                  <td>{item.publishedAt ? formatDateTime(parseUtcSafe(item.publishedAt)) : "—"}</td>
                  <td>
                    <div className={styles.rowActions}>
                      <RowMenu
                        label={`Действия: ${item.title}`}
                        items={[
                          {
                            label:
                              item.status === "PUBLISHED" ? "Снять с публикации" : "Опубликовать",
                            onSelect: () => togglePublished(item.id, item.status !== "PUBLISHED"),
                          },
                          {
                            label: "Дублировать",
                            onSelect: () => duplicate(item.id),
                          },
                          {
                            label: "Удалить",
                            danger: true,
                            onSelect: () => remove(item.id, item.title),
                          },
                        ]}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </>
  );
}
