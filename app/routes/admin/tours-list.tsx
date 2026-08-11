import { Link, useNavigate, useRevalidator } from "react-router";
import type { Route } from "./+types/tours-list";
import { deleteTour, listTours } from "~/api/admin-api";
import { PageSkeleton } from "~/components/common/PageSkeleton";
import { EmptyState, ErrorState } from "~/components/common/States";
import { RowMenu } from "~/components/admin/RowMenu";
import { parseUtcSafe } from "~/utils/admin-format";
import { formatDateTime } from "~/utils/format";
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
  const revalidator = useRevalidator();
  const navigate = useNavigate();

  async function remove(id: number, title: string) {
    if (!window.confirm(`Удалить тур «${title}»? Логистика удалится вместе с ним, концерты останутся.`)) return;
    await deleteTour(id);
    revalidator.revalidate();
  }

  return (
    <>
      <div className={styles.pageHead}>
        <h1 className={styles.pageTitle}>Туры</h1>
        <div className={styles.pageActions}>
          <Link to="/admin/tours/new" className={`${styles.btn} ${styles.btnPrimary}`}>
            + Тур
          </Link>
          <span className={styles.rebuildNote}>
            Логистика и сет-листы на сайте не показываются — это внутренние данные для музыкантов.
          </span>
        </div>
      </div>

      {failed ? <ErrorState /> : null}

      {!failed && tours.length === 0 ? (
        <EmptyState
          title="Туров пока нет"
          description="Тур объединяет несколько дат: логистика ведётся на выезд целиком."
        />
      ) : null}

      {tours.length > 0 ? (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Тур</th>
                <th>Даты</th>
                <th>Концертов</th>
                <th>Пунктов логистики</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {tours.map((tour) => (
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
                          { label: "Удалить", danger: true, onSelect: () => remove(tour.id, tour.title) },
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
