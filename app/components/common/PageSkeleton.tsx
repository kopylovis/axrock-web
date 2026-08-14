import { useT } from "~/i18n";
import styles from "./PageSkeleton.module.css";

export function PageSkeleton({ label }: { label?: string }) {
  const t = useT();

  return (
    <div className={styles.wrap} role="status" aria-live="polite">
      <span className="visually-hidden">{label ?? t.common.loading}</span>
      <div className={styles.bar} style={{ width: "30%" }} />
      <div className={styles.bar} style={{ width: "70%", height: 42 }} />
      <div className={styles.bar} style={{ width: "55%" }} />
      <div className={styles.grid}>
        <div className={styles.block} />
        <div className={styles.block} />
        <div className={styles.block} />
      </div>
    </div>
  );
}
