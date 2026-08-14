import type { ConcertEventStatus } from "~/types/content";
import { useT } from "~/i18n";
import styles from "./concerts.module.css";

const STATUS_CLASS: Record<ConcertEventStatus, string | undefined> = {
  ANNOUNCED: styles.badgeAnnounced,
  SOLD_OUT: styles.badgeSoldOut,
  CANCELLED: styles.badgeCancelled,
  POSTPONED: styles.badgePostponed,
  COMPLETED: styles.badgeCompleted,
};

export function ConcertStatusBadge({
  status,
  compact = false,
}: {
  status: ConcertEventStatus;
  compact?: boolean;
}) {
  const t = useT();

  return (
    <span className={`${styles.badge} ${STATUS_CLASS[status]}`}>
      <span className={styles.badgeDot} aria-hidden="true" />
      {/* В узкой колонке даты слово «концерт» лишнее — оно очевидно из контекста. */}
      {compact ? t.concertStatusShort[status] : t.concertStatus[status]}
    </span>
  );
}
