import styles from "./PageSkeleton.module.css";

export function PageSkeleton({ label = "Загрузка…" }: { label?: string }) {
  return (
    <div className={styles.wrap} role="status" aria-live="polite">
      <span className="visually-hidden">{label}</span>
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
