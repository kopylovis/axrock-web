import { Link, useRevalidator } from "react-router";
import type { Route } from "./+types/releases-list";
import { deleteRelease, listReleases } from "~/api/admin-api";
import { PageSkeleton } from "~/components/common/PageSkeleton";
import { EmptyState, ErrorState } from "~/components/common/States";
import { RowMenu } from "~/components/admin/RowMenu";
import { StatusChip } from "~/components/admin/fields";
import { RELEASE_TYPE_LABELS } from "~/components/music/ReleaseCard";
import { formatDate, parseUtcSafe } from "~/utils/admin-format";
import { SortableTh, compareValues, useTableSort } from "~/components/admin/sortable-table";
import styles from "~/components/admin/admin.module.css";

export async function clientLoader() {
  try {
    return { releases: await listReleases(), failed: false as const };
  } catch {
    return { releases: [], failed: true as const };
  }
}

export function HydrateFallback() {
  return <PageSkeleton label="Загрузка релизов" />;
}

export default function AdminReleasesList({ loaderData }: Route.ComponentProps) {
  const { releases, failed } = loaderData;
  const { sort, toggle } = useTableSort<"title" | "status" | "type" | "date" | "tracks">({ key: "date", direction: "desc" });

  // Сортировка идёт по данным, а не по разметке: значения берутся из записи.
  const sorted = [...releases].sort((a, b) => {
      if (sort.key === "title") return compareValues(a.title, b.title, sort.direction);
      if (sort.key === "status") return compareValues(Number(a.published ?? false), Number(b.published ?? false), sort.direction);
      if (sort.key === "type") return compareValues(a.type, b.type, sort.direction);
      if (sort.key === "date") return compareValues(a.releaseDate ?? "", b.releaseDate ?? "", sort.direction);
      if (sort.key === "tracks") return compareValues(a.tracks?.length ?? 0, b.tracks?.length ?? 0, sort.direction);
      return 0;
  });
  const revalidator = useRevalidator();

  async function remove(id: number, title: string) {
    if (!window.confirm(`Удалить релиз «${title}»?`)) return;
    await deleteRelease(id);
    revalidator.revalidate();
  }

  return (
    <>
      <div className={styles.pageHead}>
        <h1 className={styles.pageTitle}>Релизы</h1>
        <div className={styles.pageActions}>
          <Link to="/admin/releases/new" className={`${styles.btn} ${styles.btnPrimary}`}>
            + Релиз
          </Link>
        </div>
      </div>

      {failed ? <ErrorState /> : null}

      {!failed && releases.length === 0 ? (
        <EmptyState title="Дискография пуста" description="Добавьте первый релиз." />
      ) : null}

      {releases.length > 0 ? (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <SortableTh
                      label="Название"
                      sortKey="title"
                      sort={sort}
                      onSort={toggle}
                    />
                <SortableTh
                      label="Статус"
                      sortKey="status"
                      sort={sort}
                      onSort={toggle}
                      preferred="desc"
                    />
                <SortableTh
                      label="Тип"
                      sortKey="type"
                      sort={sort}
                      onSort={toggle}
                    />
                <SortableTh
                      label="Дата"
                      sortKey="date"
                      sort={sort}
                      onSort={toggle}
                      preferred="desc"
                    />
                <SortableTh
                      label="Треков"
                      sortKey="tracks"
                      sort={sort}
                      onSort={toggle}
                      preferred="desc"
                    />
                <th />
              </tr>
            </thead>
            <tbody>
              {sorted.map((release) => (
                <tr key={release.id}>
                  <td>
                    <Link to={`/admin/releases/${release.id}`} className={styles.rowTitle}>
                      {release.title}
                    </Link>
                  </td>
                  <td>
                    <StatusChip
                      status={release.published ? "PUBLISHED" : "DRAFT"}
                      label={release.published ? "Опубликован" : "Снят с публикации"}
                    />
                  </td>
                  <td>{RELEASE_TYPE_LABELS[release.type]}</td>
                  <td>{release.releaseDate ? formatDate(parseUtcSafe(release.releaseDate)) : "—"}</td>
                  <td>{release.tracks?.length ?? 0}</td>
                  <td>
                    <div className={styles.rowActions}>
                      <Link
                        to={`/admin/releases/${release.id}`}
                        className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`}
                      >
                        Изменить
                      </Link>
                      <RowMenu
                        label={`Действия: ${release.title}`}
                        items={[
                          {
                            label: "Удалить",
                            danger: true,
                            onSelect: () => remove(release.id, release.title),
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
