import { useState } from "react";
import { useRevalidator } from "react-router";
import type { Route } from "./+types/expenses";
import { createExpense, deleteExpense, listExpenses, type Expense } from "~/api/admin-api";
import { GlassPanel } from "~/components/common/GlassPanel";
import { PageSkeleton } from "~/components/common/PageSkeleton";
import { EmptyState, ErrorState } from "~/components/common/States";
import { TextAreaField, TextField } from "~/components/admin/fields";
import { RowMenu } from "~/components/admin/RowMenu";
import { SortableTh, compareValues, useTableSort } from "~/components/admin/sortable-table";
import { parseUtcSafe } from "~/utils/admin-format";
import { formatDate } from "~/utils/format";
import { formatMoney, parseMoneyToMinor } from "~/utils/crew-format";
import { csvAmount, downloadCsv, printPage } from "~/utils/export";
import styles from "~/components/admin/admin.module.css";

export async function clientLoader() {
  try {
    return { mine: await listExpenses(), failed: false as const };
  } catch {
    return { mine: [] as Expense[], failed: true as const };
  }
}

export function HydrateFallback() {
  return <PageSkeleton label="Загрузка расходов" />;
}

export default function AdminExpenses({ loaderData }: Route.ComponentProps) {
  const { mine, failed } = loaderData;
  const revalidator = useRevalidator();
  const { sort, toggle } = useTableSort<"title" | "amount" | "date">({
    key: "date",
    direction: "desc",
  });
  const sorted = [...mine].sort((a, b) => {
    if (sort.key === "title") return compareValues(a.title, b.title, sort.direction);
    if (sort.key === "amount") return compareValues(a.amountMinor, b.amountMinor, sort.direction);
    return compareValues(a.spentOn, b.spentOn, sort.direction);
  });

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
      <div className={`${styles.pageHead} ${styles.printHide}`}>
        <h1 className={styles.pageTitle}>Мои расходы</h1>
        <div className={styles.pageActions}>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnSecondary}`}
            disabled={mine.length === 0}
            onClick={() =>
              downloadCsv(
                `raskhody-${new Date().toISOString().slice(0, 10)}`,
                ["На что", "Сумма", "Валюта", "Дата", "Комментарий"],
                mine.map((item) => [
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
            disabled={mine.length === 0}
            onClick={printPage}
          >
            Печать / PDF
          </button>
        </div>
      </div>

      {failed ? <ErrorState /> : null}

      <GlassPanel className={`${styles.panel} ${styles.printHide}`}>
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
            <p className={styles.panelTotal}>Итого: {formatMoney(myTotal, "RUB")}</p>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <SortableTh label="На что" sortKey="title" sort={sort} onSort={toggle} />
                    <SortableTh label="Сумма" sortKey="amount" sort={sort} onSort={toggle} preferred="desc" />
                    <SortableTh label="Дата" sortKey="date" sort={sort} onSort={toggle} preferred="desc" />
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((item) => (
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

    </>
  );
}
