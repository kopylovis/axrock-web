import { Link, redirect } from "react-router";
import type { Route } from "./+types/dashboard";
import { dashboard, me } from "~/api/admin-api";
import { canEditContent } from "~/utils/roles";
import { GlassPanel } from "~/components/common/GlassPanel";
import { RebuildButton } from "~/components/admin/RebuildButton";
import { PageSkeleton } from "~/components/common/PageSkeleton";
import { ErrorState } from "~/components/common/States";
import { formatDateTime, parseUtcSafe } from "~/utils/admin-format";
import { SortableTh, compareValues, useTableSort } from "~/components/admin/sortable-table";
import styles from "~/components/admin/admin.module.css";

const KIND_LABELS: Record<string, string> = {
  NEWS: "Новость",
  CONCERT: "Концерт",
  RELEASE: "Релиз",
  MEMBER: "Участник",
};

const KIND_PATHS: Record<string, string> = {
  NEWS: "news",
  CONCERT: "concerts",
  RELEASE: "releases",
  MEMBER: "members",
};

export async function clientLoader() {
  try {
    // Сводка по сайту музыканту недоступна — сразу отправляем в его раздел.
    const admin = await me();
    if (!canEditContent(admin.role)) throw redirect("/admin/tours");

    return { data: await dashboard(), failed: false as const };
  } catch (error) {
    if (error instanceof Response) throw error;
    return { data: null, failed: true as const };
  }
}

export function HydrateFallback() {
  return <PageSkeleton label="Загрузка обзора" />;
}

export default function AdminDashboard({ loaderData }: Route.ComponentProps) {
  const { data, failed } = loaderData;
  const recentlyUpdated = data?.recentlyUpdated ?? [];
  const { sort, toggle } = useTableSort<"kind" | "title" | "updated">({
    key: "updated",
    direction: "desc",
  });
  const sortedRecent = [...recentlyUpdated].sort((a, b) => {
    if (sort.key === "kind") return compareValues(KIND_LABELS[a.kind] ?? a.kind, KIND_LABELS[b.kind] ?? b.kind, sort.direction);
    if (sort.key === "title") return compareValues(a.title, b.title, sort.direction);
    return compareValues(a.updatedAt, b.updatedAt, sort.direction);
  });

  if (failed || !data) {
    return (
      <>
        <div className={styles.pageHead}>
          <h1 className={styles.pageTitle}>Обзор</h1>
        </div>
        <ErrorState
          title="Backend недоступен"
          description="Не удалось получить данные панели. Проверьте, что Ktor-сервис запущен."
        />
      </>
    );
  }

  return (
    <>
      <div className={styles.pageHead}>
        <h1 className={styles.pageTitle}>Обзор</h1>
        <div className={styles.pageActions}>
          <Link to="/admin/news/new" className={`${styles.btn} ${styles.btnPrimary}`}>
            + Новость
          </Link>
          <Link to="/admin/concerts/new" className={`${styles.btn} ${styles.btnPrimary}`}>
            + Концерт
          </Link>
          <RebuildButton />
        </div>
      </div>

      <div className={styles.stats}>
        <GlassPanel className={styles.statCard}>
          <span className={styles.statValue}>{data.publishedNews}</span>
          <span className={styles.statLabel}>Опубликовано новостей</span>
        </GlassPanel>
        <GlassPanel className={styles.statCard}>
          <span className={styles.statValue}>{data.draftNews}</span>
          <span className={styles.statLabel}>Черновиков новостей</span>
        </GlassPanel>
        <GlassPanel className={styles.statCard}>
          <span className={styles.statValue}>{data.upcomingConcerts}</span>
          <span className={styles.statLabel}>Предстоящих концертов</span>
        </GlassPanel>
        <GlassPanel className={styles.statCard}>
          <span className={styles.statValue}>{data.draftConcerts}</span>
          <span className={styles.statLabel}>Черновиков концертов</span>
        </GlassPanel>
      </div>

      <GlassPanel className={styles.panel}>
        <h2 className={styles.panelTitle}>Ближайший концерт</h2>
        {data.nextConcert ? (
          <Link to={`/admin/concerts/${data.nextConcert.id}`} className={styles.nextConcert}>
            <span className={styles.rowTitle}>{data.nextConcert.title}</span>
            <span>
              {formatDateTime(parseUtcSafe(data.nextConcert.startsAt), data.nextConcert.timezone)},{" "}
              {data.nextConcert.city}
            </span>
          </Link>
        ) : (
          <p className={styles.hint}>Предстоящих концертов нет.</p>
        )}
      </GlassPanel>

      <GlassPanel className={styles.panel}>
        <h2 className={styles.panelTitle}>Недавно изменённое</h2>
        {recentlyUpdated.length === 0 ? (
          <p className={styles.hint}>Пока ничего не менялось.</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <SortableTh label="Тип" sortKey="kind" sort={sort} onSort={toggle} />
                  <SortableTh label="Название" sortKey="title" sort={sort} onSort={toggle} />
                  <SortableTh label="Изменено" sortKey="updated" sort={sort} onSort={toggle} preferred="desc" />
                </tr>
              </thead>
              <tbody>
                {sortedRecent.map((item) => {
                  const section = KIND_PATHS[item.kind];
                  return (
                    <tr key={`${item.kind}-${item.id}`} className={section ? styles.rowLinked : undefined}>
                      <td>{KIND_LABELS[item.kind] ?? item.kind}</td>
                      <td>
                        {section ? (
                          <Link to={`/admin/${section}/${item.id}`} className={styles.rowLink}>
                            {item.title}
                          </Link>
                        ) : (
                          <span className={styles.rowTitle}>{item.title}</span>
                        )}
                      </td>
                      <td>{formatDateTime(parseUtcSafe(item.updatedAt))}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </GlassPanel>
    </>
  );
}
