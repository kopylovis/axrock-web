import { useState } from "react";
import { useRevalidator } from "react-router";
import type { Route } from "./+types/expenses";
import {
  createExpense,
  deleteExpense,
  listExpenses,
  listTours,
  updateExpense,
  type Expense,
  type TourListItem,
} from "~/api/admin-api";
import { GlassPanel } from "~/components/common/GlassPanel";
import { PageSkeleton } from "~/components/common/PageSkeleton";
import { EmptyState, ErrorState } from "~/components/common/States";
import { SelectField, TextAreaField, TextField } from "~/components/admin/fields";
import { RowMenu } from "~/components/admin/RowMenu";
import { SortableTh, compareValues, useTableSort } from "~/components/admin/sortable-table";
import { parseUtcSafe } from "~/utils/admin-format";
import { formatDate } from "~/utils/format";
import { formatMoney, formatMoneyInput, parseMoneyToMinor } from "~/utils/crew-format";
import { csvAmount, downloadCsv, printPage } from "~/utils/export";
import styles from "~/components/admin/admin.module.css";

export async function clientLoader() {
  try {
    // Список выездов нужен для необязательной привязки траты.
    const [mine, tours] = await Promise.all([listExpenses(), listTours().catch(() => [])]);
    return { mine, tours, failed: false as const };
  } catch {
    return { mine: [] as Expense[], tours: [] as TourListItem[], failed: true as const };
  }
}

export function HydrateFallback() {
  return <PageSkeleton label="Загрузка расходов" />;
}

export default function AdminExpenses({ loaderData }: Route.ComponentProps) {
  const { mine, tours, failed } = loaderData;
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
  const [tourId, setTourId] = useState("");
  // null — форма создаёт новую трату, иначе правит существующую.
  const [editingId, setEditingId] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setAmount("");
    setComment("");
    setTourId("");
    setSpentOn(new Date().toISOString().slice(0, 10));
  }

  function startEdit(expense: Expense) {
    setEditingId(expense.id);
    setTitle(expense.title);
    setAmount(formatMoneyInput(expense.amountMinor));
    setSpentOn(expense.spentOn.slice(0, 10));
    setComment(expense.comment ?? "");
    setTourId(expense.tourId ? String(expense.tourId) : "");
    setError(null);
    // Форма наверху страницы — иначе непонятно, что именно правится.
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit() {
    const amountMinor = parseMoneyToMinor(amount);
    if (title.trim().length < 2) return setError("Укажите, на что потрачено");
    if (amountMinor === null) return setError("Сумма вводится числом: 1250 или 1250,40");

    setSaving(true);
    setError(null);
    const payload = {
      title: title.trim(),
      amountMinor,
      currency: "RUB",
      spentOn: `${spentOn}T00:00:00`,
      comment: comment.trim() || null,
      receiptUrl: null,
      tourId: tourId ? Number(tourId) : null,
    };

    try {
      if (editingId === null) await createExpense(payload);
      else await updateExpense(editingId, payload);
      resetForm();
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
        <h2 className={styles.panelTitle}>{editingId === null ? "Добавить трату" : "Изменить трату"}</h2>
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
            <SelectField
              label="Выезд"
              value={tourId}
              options={[
                { value: "", label: "Не привязывать" },
                ...tours.map((tour) => ({ value: String(tour.id), label: tour.title })),
              ]}
              hint="Необязательно. Нужно, чтобы в сводке видеть траты по конкретному туру."
              onChange={(event) => setTourId(event.target.value)}
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
              onClick={submit}
            >
              {saving ? "Сохраняю…" : editingId === null ? "Добавить" : "Сохранить"}
            </button>
            {editingId !== null ? (
              <button
                type="button"
                className={`${styles.btn} ${styles.btnSecondary}`}
                disabled={saving}
                onClick={resetForm}
              >
                Отмена
              </button>
            ) : null}
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
                    <tr key={item.id} className={item.id === editingId ? styles.rowEditing : undefined}>
                      <td>
                        <span className={styles.rowTitle}>{item.title}</span>
                        {item.tourTitle ? <div className={styles.hint}>{item.tourTitle}</div> : null}
                        {item.comment ? <div className={styles.hint}>{item.comment}</div> : null}
                      </td>
                      <td>{formatMoney(item.amountMinor, item.currency)}</td>
                      <td>{formatDate(parseUtcSafe(item.spentOn))}</td>
                      <td>
                        <div className={styles.rowActions}>
                          <RowMenu
                            label={`Действия: ${item.title}`}
                            items={[
                              { label: "Изменить", onSelect: () => startEdit(item) },
                              { label: "Удалить", danger: true, onSelect: () => remove(item) },
                            ]}
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
