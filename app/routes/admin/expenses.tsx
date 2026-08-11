import { useState } from "react";
import { useRevalidator, useRouteLoaderData } from "react-router";
import type { Route } from "./+types/expenses";
import {
  createExpense,
  deleteExpense,
  listAllExpenses,
  listExpenses,
  type Expense,
  type ExpenseSummary,
} from "~/api/admin-api";
import { GlassPanel } from "~/components/common/GlassPanel";
import { PageSkeleton } from "~/components/common/PageSkeleton";
import { EmptyState, ErrorState } from "~/components/common/States";
import { TextAreaField, TextField } from "~/components/admin/fields";
import { RowMenu } from "~/components/admin/RowMenu";
import { parseUtcSafe } from "~/utils/admin-format";
import { formatDate } from "~/utils/format";
import { formatMoney, parseMoneyToMinor } from "~/utils/crew-format";
import { canManageUsers } from "~/utils/roles";
import styles from "~/components/admin/admin.module.css";

export async function clientLoader() {
  try {
    // Сводку по всем видит не каждый — отсутствие прав не должно ронять страницу.
    const [mine, all] = await Promise.all([
      listExpenses(),
      listAllExpenses().catch(() => null),
    ]);
    return { mine, all, failed: false as const };
  } catch {
    return { mine: [] as Expense[], all: null as ExpenseSummary | null, failed: true as const };
  }
}

export function HydrateFallback() {
  return <PageSkeleton label="Загрузка расходов" />;
}

export default function AdminExpenses({ loaderData }: Route.ComponentProps) {
  const { mine, all, failed } = loaderData;
  const revalidator = useRevalidator();
  const layout = useRouteLoaderData("layouts/AdminLayout") as { admin?: { role?: string } } | undefined;
  const isManager = canManageUsers(layout?.admin?.role ?? "");

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [spentOn, setSpentOn] = useState(new Date().toISOString().slice(0, 10));
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function add() {
    const amountMinor = parseMoneyToMinor(amount);
    if (title.trim().length < 2) return setError("Укажите, на что потрачено");
    if (amountMinor === null) return setError("Сумма вводится числом: 1250 или 1250,40");

    setSaving(true);
    setError(null);
    try {
      await createExpense({
        title: title.trim(),
        amountMinor,
        currency: "RUB",
        spentOn: `${spentOn}T00:00:00`,
        comment: comment.trim() || null,
        receiptUrl: null,
      });
      setTitle("");
      setAmount("");
      setComment("");
      revalidator.revalidate();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Не удалось сохранить расход");
    } finally {
      setSaving(false);
    }
  }

  async function remove(expense: Expense) {
    if (!window.confirm(`Удалить «${expense.title}»?`)) return;
    await deleteExpense(expense.id);
    revalidator.revalidate();
  }

  const myTotal = mine.reduce((sum, item) => sum + item.amountMinor, 0);

  return (
    <>
      <div className={styles.pageHead}>
        <h1 className={styles.pageTitle}>Расходы</h1>
      </div>

      {failed ? <ErrorState /> : null}

      <GlassPanel className={styles.panel}>
        <h2 className={styles.panelTitle}>Добавить трату</h2>
        {error ? (
          <p className={styles.alert} role="alert">
            {error}
          </p>
        ) : null}

        <div className={styles.form}>
          <div className={`${styles.formGrid} ${styles.formGridTwo}`}>
            <TextField
              label="На что"
              value={title}
              placeholder="Такси до площадки"
              hint="Заголовок произвольный — к туру или концерту не привязывается."
              onChange={(event) => setTitle(event.target.value)}
            />
            <TextField
              label="Сумма, ₽"
              value={amount}
              placeholder="1250,40"
              inputMode="decimal"
              onChange={(event) => setAmount(event.target.value)}
            />
          </div>
          <div className={`${styles.formGrid} ${styles.formGridTwo}`}>
            <TextField
              label="Дата"
              type="date"
              value={spentOn}
              onChange={(event) => setSpentOn(event.target.value)}
            />
          </div>
          <TextAreaField
            label="Комментарий"
            value={comment}
            rows={2}
            onChange={(event) => setComment(event.target.value)}
          />
          <div className={styles.formActions}>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnPrimary}`}
              disabled={saving}
              onClick={add}
            >
              {saving ? "Сохраняю…" : "Добавить"}
            </button>
          </div>
        </div>
      </GlassPanel>

      <GlassPanel className={styles.panel}>
        <h2 className={styles.panelTitle}>Мои траты</h2>
        {mine.length === 0 ? (
          <EmptyState title="Пока пусто" description="Добавьте первую трату — она видна только вам." />
        ) : (
          <>
            <p className={styles.hint}>Итого: {formatMoney(myTotal, "RUB")}</p>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>На что</th>
                    <th>Сумма</th>
                    <th>Дата</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {mine.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <span className={styles.rowTitle}>{item.title}</span>
                        {item.comment ? <div className={styles.hint}>{item.comment}</div> : null}
                      </td>
                      <td>{formatMoney(item.amountMinor, item.currency)}</td>
                      <td>{formatDate(parseUtcSafe(item.spentOn))}</td>
                      <td>
                        <div className={styles.rowActions}>
                          <RowMenu
                            label={`Действия: ${item.title}`}
                            items={[{ label: "Удалить", danger: true, onSelect: () => remove(item) }]}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </GlassPanel>

      {isManager && all ? (
        <GlassPanel className={styles.panel}>
          <h2 className={styles.panelTitle}>Все участники</h2>
          <p className={styles.hint}>
            {all.totals.length > 0
              ? `Итого: ${all.totals.map((t) => formatMoney(t.amountMinor, t.currency)).join(" · ")}`
              : "Пока никто ничего не вносил."}
          </p>
          {all.items.length > 0 ? (
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
                  {all.items.map((item) => (
                    <tr key={item.id}>
                      <td>{item.userName ?? "—"}</td>
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
          ) : null}
        </GlassPanel>
      ) : null}
    </>
  );
}
