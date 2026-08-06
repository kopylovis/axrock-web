import { Link, useRevalidator } from "react-router";
import type { Route } from "./+types/releases-list";
import { deleteRelease, listReleases } from "~/api/admin-api";
import { PageSkeleton } from "~/components/common/PageSkeleton";
import { EmptyState, ErrorState } from "~/components/common/States";
import { RowMenu } from "~/components/admin/RowMenu";
import { RELEASE_TYPE_LABELS } from "~/components/music/ReleaseCard";
import { formatDate, parseUtcSafe } from "~/utils/admin-format";
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
                <th>Название</th>
                <th>Тип</th>
                <th>Дата</th>
                <th>Треков</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {releases.map((release) => (
                <tr key={release.id}>
                  <td>
                    <Link to={`/admin/releases/${release.id}`} className={styles.rowTitle}>
                      {release.title}
                    </Link>
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
