import { useState } from "react";
import { useSearchParams } from "react-router";
import type { Route } from "./+types/expenses-summary";
import { listAllExpenses, type ExpenseSummary } from "~/api/admin-api";
import { ApiError } from "~/api/errors";
import { GlassPanel } from "~/components/common/GlassPanel";
import { PageSkeleton } from "~/components/common/PageSkeleton";
import { EmptyState, ErrorState } from "~/components/common/States";
import { TextField } from "~/components/admin/fields";
import { parseUtcSafe } from "~/utils/admin-format";
import { formatDate } from "~/utils/format";
import { formatMoney } from "~/utils/crew-format";
import { csvAmount, downloadCsv, printPage } from "~/utils/export";
import styles from "~/components/admin/admin.module.css";

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const url = new URL(request.url);
  const from = url.searchParams.get("from") ?? "";
  const to = url.searchParams.get("to") ?? "";

  try {
    // Границы включительные: «по 31-е» должно захватывать весь последний день.
    const summary = await listAllExpenses({
      from: from ? `${from}T00:00:00` : undefined,
      to: to ? `${to}T23:59:59` : undefined,
    });
    return { summary, from, to, denied: false as const, failed: false as const };
  } catch (cause) {
    const denied = cause instanceof ApiError && cause.status === 403;
    return {
      summary: null as ExpenseSummary | null,
      from,
      to,
      denied,
      failed: !denied,
    };
  }
}

export function HydrateFallback() {
  return <PageSkeleton label="Загрузка сводки" />;
}

export default function AdminExpensesSummary({ loaderData }: Route.ComponentProps) {
  const { summary, denied, failed } = loaderData;
  const [searchParams, setSearchParams] = useSearchParams();
  const [from, setFrom] = useState(loaderData.from);
  const [to, setTo] = useState(loaderData.to);

  function apply() {
    const next = new URLSearchParams(searchParams);
    if (from) next.set("from", from);
    else next.delete("from");
    if (to) next.set("to", to);
    else next.delete("to");
    setSearchParams(next);
  }

  function reset() {
    setFrom("");
    setTo("");
    setSearchParams(new URLSearchParams());
  }

  if (denied) {
    return (
      <>
        <div className={styles.pageHead}>
          <h1 className={styles.pageTitle}>Общие расходы</h1>
        </div>
        <EmptyState
          title="Раздел недоступен"
          description="Сводку по тратам всех участников видят владелец и администратор."
        />
      </>
    );
  }

  // По людям удобнее сверять, кому и сколько возмещать.
  const byUser = new Map<string, { full: string | null; amount: number }>();
  for (const item of summary?.items ?? []) {
    const key = item.userName ?? "—";
    const entry = byUser.get(key) ?? { full: item.userFullName ?? null, amount: 0 };
    entry.amount += item.amountMinor;
    byUser.set(key, entry);
  }

  return (
    <>
      <div className={`${styles.pageHead} ${styles.printHide}`}>
        <h1 className={styles.pageTitle}>Общие расходы</h1>
        <div className={styles.pageActions}>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnSecondary}`}
            disabled={!summary || summary.items.length === 0}
            onClick={() =>
              downloadCsv(
                `raskhody-obshchie-${loaderData.from || "vse"}-${loaderData.to || "vse"}`,
                ["Кто", "На что", "Сумма", "Валюта", "Дата", "Комментарий"],
                (summary?.items ?? []).map((item) => [
                  item.userFullName || item.userName || "",
                  item.title,
                  csvAmount(item.amountMinor),
                  item.currency,
                  formatDate(parseUtcSafe(item.spentOn)),
                  item.comment ?? "",
                ]),
              )
            }
          >
            Таблица
          </button>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnSecondary}`}
            disabled={!summary || summary.items.length === 0}
            onClick={printPage}
          >
            Печать / PDF
          </button>
        </div>
      </div>

      {/* Заголовок для печати: на бумаге нужен период, а элементы фильтра — нет. */}
      <p className={styles.printOnly}>
        Общие расходы{" "}
        {loaderData.from || loaderData.to
          ? `за период ${loaderData.from || "начало"} — ${loaderData.to || "сегодня"}`
          : "за всё время"}
      </p>

      {failed ? <ErrorState /> : null}

      <GlassPanel className={`${styles.panel} ${styles.printHide}`}>
        <h2 className={styles.panelTitle}>Период</h2>
        <div className={styles.form}>
          <div className={`${styles.formGrid} ${styles.formGridTwo}`}>
            <TextField
              label="С"
              type="date"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
            />
            <TextField
              label="По"
              type="date"
              value={to}
              hint="Границы включительно. Пустые поля — за всё время."
              onChange={(event) => setTo(event.target.value)}
            />
          </div>
          <div className={styles.formActions}>
            <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={apply}>
              Показать
            </button>
            <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={reset}>
              Сбросить
            </button>
          </div>
        </div>
      </GlassPanel>

      {summary && summary.items.length === 0 ? (
        <EmptyState title="Ничего не найдено" description="За выбранный период трат нет." />
      ) : null}

      {summary && summary.items.length > 0 ? (
        <>
          <GlassPanel className={styles.panel}>
            <h2 className={styles.panelTitle}>Итого</h2>
            <p className={styles.hint}>
              {summary.totals.map((total) => formatMoney(total.amountMinor, total.currency)).join(" · ")}
            </p>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Участник</th>
                    <th>Сумма</th>
                  </tr>
                </thead>
                <tbody>
                  {[...byUser.entries()]
                    .sort((a, b) => b[1].amount - a[1].amount)
                    .map(([login, entry]) => (
                      <tr key={login}>
                        <td>
                          <span className={styles.rowTitle}>{entry.full ?? login}</span>
                          {entry.full ? <div className={styles.hint}>{login}</div> : null}
                        </td>
                        <td>{formatMoney(entry.amount, summary.totals[0]?.currency ?? "RUB")}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </GlassPanel>

          <GlassPanel className={styles.panel}>
            <h2 className={styles.panelTitle}>Все траты</h2>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Кто</th>
                    <th>На что</th>
                    <th>Сумма</th>
                    <th>Дата</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <span className={styles.rowTitle}>{item.userFullName ?? item.userName ?? "—"}</span>
                        {item.userFullName ? <div className={styles.hint}>{item.userName}</div> : null}
                      </td>
                      <td>
                        <span className={styles.rowTitle}>{item.title}</span>
                        {item.comment ? <div className={styles.hint}>{item.comment}</div> : null}
                      </td>
                      <td>{formatMoney(item.amountMinor, item.currency)}</td>
                      <td>{formatDate(parseUtcSafe(item.spentOn))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassPanel>
        </>
      ) : null}
    </>
  );
}
