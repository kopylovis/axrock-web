import type { ConcertEventStatus } from "~/types/content";
import { CONCERT_STATUS_LABELS } from "~/utils/format";
import styles from "./concerts.module.css";

const STATUS_CLASS: Record<ConcertEventStatus, string | undefined> = {
  ANNOUNCED: styles.badgeAnnounced,
  SOLD_OUT: styles.badgeSoldOut,
  CANCELLED: styles.badgeCancelled,
  POSTPONED: styles.badgePostponed,
  COMPLETED: styles.badgeCompleted,
};

/** В узкой колонке даты слово «концерт» лишнее — оно и так очевидно из контекста. */
const SHORT_LABELS: Record<ConcertEventStatus, string> = {
  ANNOUNCED: "Анонсирован",
  SOLD_OUT: "Продано",
  CANCELLED: "Отменён",
  POSTPONED: "Перенесён",
  COMPLETED: "Состоялся",
};

export function ConcertStatusBadge({
  status,
  compact = false,
}: {
  status: ConcertEventStatus;
  compact?: boolean;
}) {
  return (
    <span className={`${styles.badge} ${STATUS_CLASS[status]}`}>
      <span className={styles.badgeDot} aria-hidden="true" />
      {compact ? SHORT_LABELS[status] : CONCERT_STATUS_LABELS[status]}
    </span>
  );
}
