import { Link } from "react-router";
import type { ConcertSummary } from "~/types/content";
import { formatDayNumber, formatMonthShort } from "~/utils/format";
import { ConcertStatusBadge } from "./ConcertStatusBadge";
import { TicketButton } from "./TicketButton";
import styles from "./EventsStrip.module.css";

/** Компактная лента дат: дата — город — площадка — билеты. */
export function EventsStrip({ concerts }: { concerts: ConcertSummary[] }) {
  return (
    <div className={styles.list}>
      {concerts.map((concert) => {
        const displayDate = concert.newStartsAt ?? concert.startsAt;

        return (
          <article key={concert.id} className={styles.row}>
            <div className={styles.dateCol}>
              <p className={styles.date}>
                <time dateTime={displayDate.toISOString()}>
                  <span className={styles.day}>
                    {formatDayNumber(displayDate, concert.timezone)}
                  </span>{" "}
                  <span className={styles.month}>
                    {formatMonthShort(displayDate, concert.timezone)}
                  </span>
                </time>
                <span className={styles.year}>{displayDate.getUTCFullYear()}</span>
              </p>
              <ConcertStatusBadge status={concert.eventStatus} compact />
            </div>

            <div className={styles.place}>
              <h3 className={styles.city}>
                <Link to={`/concerts/${concert.slug}`} className={styles.cityLink}>
                  {concert.city}
                </Link>
              </h3>
              <p className={styles.venue}>
                {concert.venueName}
                {concert.ageRestriction ? ` · ${concert.ageRestriction}` : ""}
              </p>
            </div>

            <div className={styles.actions}>
              <TicketButton concert={concert} variant="primary" />
            </div>
          </article>
        );
      })}
    </div>
  );
}
