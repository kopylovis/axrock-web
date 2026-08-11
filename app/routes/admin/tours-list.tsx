import { Link, useNavigate, useRevalidator, useRouteLoaderData } from "react-router";
import type { Route } from "./+types/tours-list";
import { deleteTour, listTours } from "~/api/admin-api";
import { PageSkeleton } from "~/components/common/PageSkeleton";
import { EmptyState, ErrorState } from "~/components/common/States";
import { RowMenu } from "~/components/admin/RowMenu";
import { parseUtcSafe } from "~/utils/admin-format";
import { formatDateTime } from "~/utils/format";
import { SortableTh, compareValues, useTableSort } from "~/components/admin/sortable-table";
import { canEditContent } from "~/utils/roles";
import styles from "~/components/admin/admin.module.css";

export async function clientLoader() {
  try {
    return { tours: await listTours(), failed: false as const };
  } catch {
    return { tours: [], failed: true as const };
  }
}

export function HydrateFallback() {
  return <PageSkeleton label="Загрузка туров" />;
}

function period(startsOn: string | null, endsOn: string | null): string {
  const from = parseUtcSafe(startsOn);
  const to = parseUtcSafe(endsOn);
  if (!from && !to) return "—";
  const left = from ? formatDateTime(from).split(",")[0] : "…";
  const right = to ? formatDateTime(to).split(",")[0] : "…";
  return `${left} — ${right}`;
}

export default function AdminToursList({ loaderData }: Route.ComponentProps) {
  const { tours, failed } = loaderData;
  const { sort, toggle } = useTableSort<"title" | "date" | "concerts" | "logistics">({ key: "date", direction: "desc" });

  // Сортировка идёт по данным, а не по разметке: значения берутся из записи.
  const sorted = [...tours].sort((a, b) => {
      if (sort.key === "title") return compareValues(a.title, b.title, sort.direction);
      if (sort.key === "date") return compareValues(a.startsOn ?? "", b.startsOn ?? "", sort.direction);
      if (sort.key === "concerts") return compareValues(a.concerts, b.concerts, sort.direction);
      if (sort.key === "logistics") return compareValues(a.logisticsItems, b.logisticsItems, sort.direction);
      return 0;
  });
  const revalidator = useRevalidator();
  const navigate = useNavigate();
  const layout = useRouteLoaderData("layouts/AdminLayout") as { admin?: { role?: string } } | undefined;
  const canEdit = canEditContent(layout?.admin?.role ?? "");

  async function remove(id: number, title: string) {
    if (!window.confirm(`Удалить тур «${title}»? Логистика удалится вместе с ним, концерты останутся.`)) return;
    await deleteTour(id);
    revalidator.revalidate();
  }

  return (
    <>
      <div className={styles.pageHead}>
        <h1 className={styles.pageTitle}>Туры и концерты</h1>
        {canEdit ? (
          <div className={styles.pageActions}>
            <Link to="/admin/tours/new" className={`${styles.btn} ${styles.btnPrimary}`}>
              + Добавить
            </Link>
          </div>
        ) : null}
      </div>

      {/* Подпись вне блока кнопок: внутри она растягивала контейнер и сдвигала кнопку. */}
      <p className={styles.pageNote}>
        Логистика и сет-листы на сайте не показываются — это внутренние данные группы.
      </p>

      {failed ? <ErrorState /> : null}

      {!failed && tours.length === 0 ? (
        <EmptyState
          title="Пока пусто"
          description="Логистика ведётся на выезд целиком. Одиночное мероприятие заводится так же — просто с одной датой."
        />
      ) : null}

      {tours.length > 0 ? (
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
                      label="Даты"
                      sortKey="date"
                      sort={sort}
                      onSort={toggle}
                      preferred="desc"
                    />
                <SortableTh
                      label="Концертов"
                      sortKey="concerts"
                      sort={sort}
                      onSort={toggle}
                      preferred="desc"
                    />
                <SortableTh
                      label="Пунктов логистики"
                      sortKey="logistics"
                      sort={sort}
                      onSort={toggle}
                      preferred="desc"
                    />
                <th />
              </tr>
            </thead>
            <tbody>
              {sorted.map((tour) => (
                <tr key={tour.id} className={styles.rowLinked}>
                  <td>
                    <Link to={`/admin/tours/${tour.id}`} className={styles.rowLink}>
                      {tour.title}
                    </Link>
                  </td>
                  <td>{period(tour.startsOn, tour.endsOn)}</td>
                  <td>{tour.concerts}</td>
                  <td>{tour.logisticsItems}</td>
                  <td>
                    <div className={styles.rowActions}>
                      <RowMenu
                        label={`Действия: ${tour.title}`}
                        items={[
                          { label: "Открыть", onSelect: () => navigate(`/admin/tours/${tour.id}`) },
                          ...(canEdit
                            ? [
                                {
                                  label: "Удалить",
                                  danger: true,
                                  onSelect: () => remove(tour.id, tour.title),
                                },
                              ]
                            : []),
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
