import { useState, useSyncExternalStore } from "react";
import { useRouteLoaderData } from "react-router";
import { requestSiteRebuild, type RebuildStatus } from "~/api/admin-api";
import { ApiError } from "~/api/errors";
import { getRebuildSnapshot, refreshRebuild, subscribeRebuild } from "./rebuild-store";
import styles from "./admin.module.css";

function describe(status: RebuildStatus | null, starting: boolean): string {
  if (starting) return "Запускаю…";
  if (!status) return "Обновить сайт";
  if (!status.configured) return "Обновление не настроено";
  if (status.running) return "Идёт сборка…";
  return "Обновить сайт";
}

/** Итог прошлой сборки — чтобы не гадать, доехали ли изменения. */
function lastResult(status: RebuildStatus | null): string | null {
  if (!status || status.running || !status.conclusion) return null;
  if (status.conclusion === "success") return "Последняя сборка прошла успешно";
  if (status.conclusion === "cancelled") return "Последняя сборка отменена";
  return "Последняя сборка завершилась ошибкой";
}

export function RebuildButton({ compact = false }: { compact?: boolean }) {
  // Ссылка на журнал ведёт в приватный репозиторий и полезна только владельцу.
  const layout = useRouteLoaderData("layouts/AdminLayout") as { admin?: { role?: string } } | undefined;
  const isOwner = layout?.admin?.role === "OWNER";
  // Состояние общее для всех кнопок панели, поэтому они не расходятся.
  const status = useSyncExternalStore(subscribeRebuild, getRebuildSnapshot, () => null);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    setStarting(true);
    setError(null);
    try {
      await requestSiteRebuild();
      const next = await refreshRebuild();
      // GitHub заводит запуск не мгновенно: если сразу после запроса он ещё
      // не виден, перечитываем через несколько секунд.
      if (next && !next.running) setTimeout(() => void refreshRebuild(), 4000);
    } catch (cause) {
      if (cause instanceof ApiError && cause.code === "REBUILD_ALREADY_RUNNING") {
        setError("Сборка уже идёт — дождитесь её завершения.");
        void refreshRebuild();
      } else if (cause instanceof ApiError && cause.code === "REBUILD_NOT_CONFIGURED") {
        setError("На сервере не заданы AXROCK_GITHUB_REPOSITORY и AXROCK_GITHUB_TOKEN.");
      } else {
        setError(cause instanceof Error ? cause.message : "Не удалось запустить пересборку");
      }
    } finally {
      setStarting(false);
    }
  }

  const busy = starting || Boolean(status?.running);
  const disabled = busy || status?.configured === false;
  const result = lastResult(status);

  if (compact) {
    return (
      <div className={styles.rebuildCompact}>
        <button type="button" className={styles.navLink} onClick={start} disabled={disabled}>
          {describe(status, starting)}
        </button>
        {error ? <span className={styles.rebuildNote}>{error}</span> : null}
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        className={`${styles.btn} ${styles.btnSecondary}`}
        onClick={start}
        disabled={disabled}
      >
        {describe(status, starting)}
      </button>
      {(error || result || status?.running) && (
        <span className={styles.rebuildNote}>
          {error ?? (status?.running ? "Обычно занимает 2–3 минуты" : result)}
          {isOwner && status?.url ? (
            <>
              {" "}
              <a href={status.url} target="_blank" rel="noreferrer">
                журнал
              </a>
            </>
          ) : null}
        </span>
      )}
    </>
  );
}
