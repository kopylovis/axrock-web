import { useState } from "react";
import styles from "./admin.module.css";

export type SortDirection = "asc" | "desc";

export interface SortState<K extends string> {
  key: K;
  direction: SortDirection;
}

/**
 * Сортировка таблицы по клику на заголовок.
 *
 * Первый клик по новому столбцу берёт направление, которое обычно и нужно:
 * у сумм и дат — по убыванию, у текста — по алфавиту. Повторный переключает.
 */
export function useTableSort<K extends string>(initial: SortState<K>) {
  const [sort, setSort] = useState<SortState<K>>(initial);

  function toggle(key: K, preferred: SortDirection = "asc") {
    setSort((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: preferred },
    );
  }

  return { sort, toggle };
}

export function compareValues(a: string | number, b: string | number, direction: SortDirection): number {
  const result =
    typeof a === "number" && typeof b === "number"
      ? a - b
      : String(a).localeCompare(String(b), "ru");
  return direction === "asc" ? result : -result;
}

interface SortableThProps<K extends string> {
  label: string;
  sortKey: K;
  sort: SortState<K>;
  onSort: (key: K, preferred?: SortDirection) => void;
  /** Направление первого клика: у чисел и дат осмысленнее убывание. */
  preferred?: SortDirection;
}

export function SortableTh<K extends string>({
  label,
  sortKey,
  sort,
  onSort,
  preferred = "asc",
}: SortableThProps<K>) {
  const active = sort.key === sortKey;

  return (
    <th aria-sort={active ? (sort.direction === "asc" ? "ascending" : "descending") : "none"}>
      <button type="button" className={styles.sortButton} onClick={() => onSort(sortKey, preferred)}>
        {label}
        <span className={active ? styles.sortMark : styles.sortMarkIdle} aria-hidden="true">
          {active ? (sort.direction === "asc" ? "▲" : "▼") : "↕"}
        </span>
      </button>
    </th>
  );
}
