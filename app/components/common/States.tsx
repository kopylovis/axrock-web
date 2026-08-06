import type { ReactNode } from "react";
import styles from "./ui.module.css";

interface StateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: StateProps) {
  return (
    <div className={styles.state}>
      <p className={styles.stateTitle}>{title}</p>
      {description ? <p>{description}</p> : null}
      {action}
    </div>
  );
}

export function ErrorState({
  title = "Не удалось загрузить данные",
  description = "Попробуйте обновить страницу немного позже.",
  action,
}: Partial<StateProps>) {
  return (
    <div className={`${styles.state} ${styles.stateError}`} role="alert">
      <p className={styles.stateTitle}>{title}</p>
      {description ? <p>{description}</p> : null}
      {action}
    </div>
  );
}
