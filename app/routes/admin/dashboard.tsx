import { Link, useFetcher } from "react-router";
import type { Route } from "./+types/dashboard";
import { dashboard, requestSiteRebuild } from "~/api/admin-api";
import { GlassPanel } from "~/components/common/GlassPanel";
import { PageSkeleton } from "~/components/common/PageSkeleton";
import { ErrorState } from "~/components/common/States";
import { formatDateTime, parseUtcSafe } from "~/utils/admin-format";
import styles from "~/components/admin/admin.module.css";

const KIND_LABELS: Record<string, string> = {
  NEWS: "Новость",
  CONCERT: "Концерт",
  RELEASE: "Релиз",
  MEMBER: "Участник",
};

export async function clientLoader() {
  try {
    return { data: await dashboard(), failed: false as const };
  } catch {
    return { data: null, failed: true as const };
  }
}

export async function clientAction() {
  try {
    await requestSiteRebuild();
    return { rebuilt: true, error: null };
  } catch (error) {
    return {
      rebuilt: false,
      error: error instanceof Error ? error.message : "Не удалось запустить пересборку",
    };
  }
}

export function HydrateFallback() {
  return <PageSkeleton label="Загрузка обзора" />;
}

export default function AdminDashboard({ loaderData }: Route.ComponentProps) {
  const { data, failed } = loaderData;
  const rebuild = useFetcher<typeof clientAction>();
  const recentlyUpdated = data?.recentlyUpdated ?? [];

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
          <rebuild.Form method="post">
            <button type="submit" className={`${styles.btn} ${styles.btnSecondary}`} disabled={rebuild.state !== "idle"}>
              {rebuild.state !== "idle" ? "Запускаю…" : "Обновить сайт"}
            </button>
          </rebuild.Form>
        </div>
      </div>

      {rebuild.data?.rebuilt ? (
        <p className={styles.success}>
          Пересборка запущена. Изменения появятся на сайте через несколько минут.
        </p>
      ) : null}
      {rebuild.data?.error ? (
        <p className={styles.alert} role="alert">
          {rebuild.data.error}
        </p>
      ) : null}

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
          <p>
            <Link to={`/admin/concerts/${data.nextConcert.id}`} className={styles.rowTitle}>
              {data.nextConcert.title}
            </Link>
            {" — "}
            {formatDateTime(parseUtcSafe(data.nextConcert.startsAt), data.nextConcert.timezone)},{" "}
            {data.nextConcert.city}
          </p>
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
                  <th>Тип</th>
                  <th>Название</th>
                  <th>Изменено</th>
                </tr>
              </thead>
              <tbody>
                {recentlyUpdated.map((item) => (
                  <tr key={`${item.kind}-${item.id}`}>
                    <td>{KIND_LABELS[item.kind] ?? item.kind}</td>
                    <td className={styles.rowTitle}>{item.title}</td>
                    <td>{formatDateTime(parseUtcSafe(item.updatedAt))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassPanel>
    </>
  );
}
