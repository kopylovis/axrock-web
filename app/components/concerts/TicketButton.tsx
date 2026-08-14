import { ExternalLinkButton } from "~/components/common/Button";
import type { ConcertSummary } from "~/types/content";
import { trackTicketClick } from "~/utils/analytics";
import { isSafeExternalUrl } from "~/utils/url";
import { useT } from "~/i18n";
import styles from "./concerts.module.css";

interface TicketButtonProps {
  concert: ConcertSummary & { ticketProvider?: string | null };
  variant?: "primary" | "ghost";
  fullWidth?: boolean;
}

/**
 * Сайт не продаёт билеты: кнопка — обычная внешняя ссылка на сайт организатора.
 * Если ссылки нет или статус её запрещает, кнопка не отображается.
 */
export function TicketButton({ concert, variant = "primary", fullWidth }: TicketButtonProps) {
  const t = useT();

  if (concert.eventStatus === "CANCELLED" || concert.eventStatus === "COMPLETED") {
    return null;
  }

  if (concert.eventStatus === "SOLD_OUT") {
    return <span className={styles.notice}>{t.concerts.soldOut}</span>;
  }

  if (!isSafeExternalUrl(concert.ticketUrl)) {
    return <span className={styles.notice}>{t.concerts.ticketsSoon}</span>;
  }

  const provider = concert.ticketProvider ?? null;

  return (
    <ExternalLinkButton
      href={concert.ticketUrl}
      variant={variant}
      fullWidth={fullWidth}
      hint={t.concerts.ticketHint}
      onNavigate={() =>
        trackTicketClick({
          id: concert.id,
          slug: concert.slug,
          city: concert.city,
          venueName: concert.venueName,
          ticketProvider: provider,
        })
      }
    >
      {t.concerts.buyTicket}
    </ExternalLinkButton>
  );
}
