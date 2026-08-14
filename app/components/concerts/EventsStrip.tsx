import { Link } from "react-router";
import type { ConcertSummary } from "~/types/content";
import { formatDayNumber, formatMonthShort } from "~/utils/format";
import { useLang, useLocalPath, useT } from "~/i18n";
import { ConcertStatusBadge } from "./ConcertStatusBadge";
import { TicketButton } from "./TicketButton";
import styles from "./EventsStrip.module.css";

/** Компактная лента дат: дата — город — площадка — билеты. */
export function EventsStrip({ concerts }: { concerts: ConcertSummary[] }) {
  const t = useT();
  const lang = useLang();
  const lp = useLocalPath();

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
                    {formatDayNumber(displayDate, concert.timezone, lang)}
                  </span>{" "}
                  <span className={styles.month}>
                    {formatMonthShort(displayDate, concert.timezone, lang)}
                  </span>
                </time>
                <span className={styles.year}>{displayDate.getUTCFullYear()}</span>
              </p>
              <ConcertStatusBadge status={concert.eventStatus} compact />
            </div>

            <div className={styles.place}>
              <h3 className={styles.city}>
                <Link to={lp(`/concerts/${concert.slug}`)} className={styles.cityLink}>
                  {concert.city}
                </Link>
              </h3>
              <p className={styles.venue}>
                {concert.venueName}
                {concert.ageRestriction ? ` · ${concert.ageRestriction}` : ""}
              </p>
              {concert.featured ? <p className={styles.headline}>{t.concerts.headliner}</p> : null}
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
