import type { ReactNode } from "react";
import { useT } from "~/i18n";
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

export function ErrorState({ title, description, action }: Partial<StateProps>) {
  const t = useT();
  const heading = title ?? t.common.errorTitle;
  const text = description ?? t.common.errorDescription;

  return (
    <div className={`${styles.state} ${styles.stateError}`} role="alert">
      <p className={styles.stateTitle}>{heading}</p>
      {text ? <p>{text}</p> : null}
      {action}
    </div>
  );
}
