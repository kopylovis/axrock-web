import { Link } from "react-router";
import { ResponsiveImage } from "~/components/common/ResponsiveImage";
import type { ConcertSummary } from "~/types/content";
import { formatDate, formatTime } from "~/utils/format";
import { ConcertStatusBadge } from "./ConcertStatusBadge";
import { TicketButton } from "./TicketButton";
import styles from "./concerts.module.css";

interface ConcertCardProps {
  concert: ConcertSummary;
  showTickets?: boolean;
}

export function ConcertCard({ concert, showTickets = true }: ConcertCardProps) {
  const href = `/concerts/${concert.slug}`;
  const displayDate = concert.newStartsAt ?? concert.startsAt;

  return (
    <article className={`${styles.card} ${styles.cardWide}`}>
      <Link to={href} className={styles.poster} tabIndex={-1} aria-hidden="true">
        <ResponsiveImage
          src={concert.posterImage}
          spec="concertPoster"
          alt=""
          className={styles.posterImage}
          sizes="120px"
          compactPlaceholder
        />
      </Link>

      <div className={styles.body}>
        <div className={styles.meta}>
          <span className={styles.date}>
            <time dateTime={displayDate.toISOString()}>
              {formatDate(displayDate, concert.timezone)}
            </time>
            {" · "}
            {formatTime(displayDate, concert.timezone)}
          </span>
          <ConcertStatusBadge status={concert.eventStatus} />
        </div>

        <h3 className={styles.title}>
          <Link to={href} className={styles.titleLink}>
            {concert.title}
          </Link>
        </h3>

        <p className={styles.place}>
          {concert.city} · {concert.venueName}
          {concert.ageRestriction ? ` · ${concert.ageRestriction}` : ""}
        </p>

        {concert.shortDescription ? (
          <p className={styles.description}>{concert.shortDescription}</p>
        ) : null}
      </div>

      {showTickets ? (
        <div className={styles.actions}>
          <TicketButton concert={concert} variant="ghost" />
        </div>
      ) : null}
    </article>
  );
}
