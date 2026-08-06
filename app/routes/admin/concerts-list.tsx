import { Link, useNavigate, useRevalidator, useSearchParams } from "react-router";
import type { Route } from "./+types/concerts-list";
import { concertAction, deleteConcert, listConcerts } from "~/api/admin-api";
import { PageSkeleton } from "~/components/common/PageSkeleton";
import { EmptyState, ErrorState } from "~/components/common/States";
import { StatusChip } from "~/components/admin/fields";
import { RowMenu } from "~/components/admin/RowMenu";
import { CONCERT_STATUS_LABELS } from "~/utils/format";
import { formatDateTime, parseUtcSafe } from "~/utils/admin-format";
import styles from "~/components/admin/admin.module.css";

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get("page") ?? 1) || 1);

  try {
    return {
      data: await listConcerts({
        page,
        status: url.searchParams.get("status"),
        query: url.searchParams.get("query"),
      }),
      failed: false as const,
    };
  } catch {
    return { data: null, failed: true as const };
  }
}

export function HydrateFallback() {
  return <PageSkeleton label="Загрузка концертов" />;
}

const FILTERS = [
  { value: "", label: "Все" },
  { value: "DRAFT", label: "Черновики" },
  { value: "PUBLISHED", label: "Опубликованные" },
  { value: "ARCHIVED", label: "Архив" },
];

export default function AdminConcertsList({ loaderData }: Route.ComponentProps) {
  const { data, failed } = loaderData;
  const [searchParams, setSearchParams] = useSearchParams();
  const revalidator = useRevalidator();
  const navigate = useNavigate();
  const activeStatus = searchParams.get("status") ?? "";

  async function run(action: () => Promise<unknown>) {
    await action();
    revalidator.revalidate();
  }

  return (
    <>
      <div className={styles.pageHead}>
        <h1 className={styles.pageTitle}>Концерты</h1>
        <div className={styles.pageActions}>
          <Link to="/admin/concerts/new" className={`${styles.btn} ${styles.btnPrimary}`}>
            + Концерт
          </Link>
        </div>
      </div>

      <div className={styles.filters}>
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
        <EmptyState title="Концертов пока нет" description="Добавьте первый концерт в афишу." />
      ) : null}

      {data && data.items.length > 0 ? (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Событие</th>
                <th>Дата</th>
                <th>Город</th>
                <th>Публикация</th>
                <th>Статус</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {data.items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <Link to={`/admin/concerts/${item.id}`} className={styles.rowTitle}>
                      {item.title}
                    </Link>
                    <div className={styles.hint}>{item.venueName}</div>
                  </td>
                  <td>{formatDateTime(parseUtcSafe(item.startsAt))}</td>
                  <td>{item.city}</td>
                  <td>
                    <StatusChip status={item.publicationStatus} />
                  </td>
                  <td>{CONCERT_STATUS_LABELS[item.eventStatus]}</td>
                  <td>
                    <div className={styles.rowActions}>
                      <button
                        type="button"
                        className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`}
                        onClick={() => navigate(`/admin/concerts/${item.id}`)}
                      >
                        Изменить
                      </button>
                      <RowMenu
                        label={`Действия: ${item.title}`}
                        items={[
                          {
                            label:
                              item.publicationStatus === "PUBLISHED"
                                ? "Снять с публикации"
                                : "Опубликовать",
                            onSelect: () =>
                              run(() =>
                                concertAction(
                                  item.id,
                                  item.publicationStatus === "PUBLISHED" ? "unpublish" : "publish",
                                ),
                              ),
                          },
                          {
                            label: "Отметить sold out",
                            onSelect: () => run(() => concertAction(item.id, "sold-out")),
                          },
                          {
                            label: "Отменить концерт",
                            onSelect: () => {
                              const reason = window.prompt("Причина отмены (необязательно)") ?? undefined;
                              run(() => concertAction(item.id, "cancel", { reason }));
                            },
                          },
                          {
                            label: "Удалить",
                            danger: true,
                            onSelect: () => {
                              if (!window.confirm(`Удалить «${item.title}»?`)) return;
                              run(() => deleteConcert(item.id));
                            },
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
