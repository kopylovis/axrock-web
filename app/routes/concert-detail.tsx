import { data, Link } from "react-router";
import type { Route } from "./+types/concert-detail";
import { Pill } from "~/components/common/GlassPanel";
import { ResponsiveImage } from "~/components/common/ResponsiveImage";
import { RichText } from "~/components/common/RichText";
import { PageSkeleton } from "~/components/common/PageSkeleton";
import { ConcertStatusBadge } from "~/components/concerts/ConcertStatusBadge";
import { TicketButton } from "~/components/concerts/TicketButton";
import { fetchConcertBySlug } from "~/api/public-api";
import { ApiError } from "~/api/errors";
import { SITE_URL, canonicalUrl } from "~/lib/config";
import { absoluteImageUrl } from "~/utils/images";
import { breadcrumbs, buildMeta, jsonLd, ogImageFrom } from "~/lib/seo";
import { isPrerenderPlaceholder } from "~/lib/prerender";
import { formatDate, formatDateTime, formatTime } from "~/utils/format";
import { isSafeExternalUrl } from "~/utils/url";
import detailStyles from "~/components/concerts/ConcertDetail.module.css";
import concertStyles from "~/components/concerts/concerts.module.css";
import styles from "~/styles/page.module.css";

const SCHEMA_STATUS: Record<string, string> = {
  ANNOUNCED: "https://schema.org/EventScheduled",
  SOLD_OUT: "https://schema.org/EventScheduled",
  COMPLETED: "https://schema.org/EventScheduled",
  CANCELLED: "https://schema.org/EventCancelled",
  POSTPONED: "https://schema.org/EventPostponed",
};

async function load(slug: string) {
  // Раздел пуст: страница собирается только чтобы пройти проверку пререндера
  // и удаляется из результата сборки.
  if (isPrerenderPlaceholder(slug)) return { concert: null };

  try {
    return { concert: await fetchConcertBySlug(slug) };
  } catch (error) {
    if (error instanceof ApiError && error.isNotFound) {
      throw data("Концерт не найден", { status: 404 });
    }
    throw error;
  }
}

export async function loader({ params }: Route.LoaderArgs) {
  return load(params.slug);
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  return load(params.slug);
}

export function HydrateFallback() {
  return <PageSkeleton />;
}

export function meta({ loaderData, location, matches }: Route.MetaArgs) {
  if (!loaderData?.concert) {
    return buildMeta({ title: "Концерт не найден", pathname: location.pathname, noindex: true });
  }

  const { concert } = loaderData;
  const displayDate = concert.newStartsAt ?? concert.startsAt;
  const description =
    concert.seoDescription ??
    concert.shortDescription ??
    `${formatDate(displayDate, concert.timezone)}, ${concert.city}, ${concert.venueName}.`;

  return [
    ...buildMeta({
      title: concert.seoTitle ?? `${concert.title} — ${concert.city}`,
      description,
      pathname: location.pathname,
      image: concert.posterImage ?? ogImageFrom(matches),
      type: "article",
    }),
    jsonLd({
      "@context": "https://schema.org",
      "@type": "MusicEvent",
      name: concert.title,
      startDate: displayDate.toISOString(),
      eventStatus: SCHEMA_STATUS[concert.eventStatus] ?? "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      image: absoluteImageUrl(concert.posterImage, SITE_URL) ? [absoluteImageUrl(concert.posterImage, SITE_URL)] : undefined,
      description,
      url: canonicalUrl(location.pathname),
      performer: { "@type": "MusicGroup", name: "Ангел-Хранитель" },
      location: {
        "@type": "Place",
        name: concert.venueName,
        address: {
          "@type": "PostalAddress",
          addressLocality: concert.city,
          addressCountry: concert.country,
          streetAddress: concert.venueAddress ?? undefined,
        },
      },
      organizer: concert.organizerName
        ? {
            "@type": "Organization",
            name: concert.organizerName,
            url: concert.organizerUrl ?? undefined,
          }
        : undefined,
      offers: isSafeExternalUrl(concert.ticketUrl)
        ? {
            "@type": "Offer",
            url: concert.ticketUrl,
            availability:
              concert.eventStatus === "SOLD_OUT"
                ? "https://schema.org/SoldOut"
                : "https://schema.org/InStock",
            seller: concert.ticketProvider
              ? { "@type": "Organization", name: concert.ticketProvider }
              : undefined,
          }
        : undefined,
    }),
    jsonLd(
      breadcrumbs([
        { name: "Главная", path: "/" },
        { name: "Концерты", path: "/concerts" },
        { name: concert.title, path: location.pathname },
      ]),
    ),
  ];
}

export default function ConcertDetailRoute({ loaderData }: Route.ComponentProps) {
  const { concert } = loaderData;
  if (!concert) return null;

  const displayDate = concert.newStartsAt ?? concert.startsAt;

  return (
    <div className={styles.page}>
      <div className="container">
        <Link to="/concerts" className={styles.back}>
          ← Все концерты
        </Link>

        <div className={detailStyles.layout}>
          <div className={detailStyles.main}>
            <div className={detailStyles.metaRow}>
              <ConcertStatusBadge status={concert.eventStatus} />
              {concert.ageRestriction ? <Pill>{concert.ageRestriction}</Pill> : null}
              <Pill>{concert.city}</Pill>
            </div>

            <h1 className={detailStyles.title}>{concert.title}</h1>

            {concert.shortDescription ? (
              <p className={detailStyles.short}>{concert.shortDescription}</p>
            ) : null}

            {concert.eventStatus === "CANCELLED" ? (
              <div className={`${concertStyles.alert} ${concertStyles.alertCancelled}`} role="status">
                <span className={concertStyles.alertTitle}>Концерт отменён</span>
                {concert.cancellationReason ? <span>{concert.cancellationReason}</span> : null}
              </div>
            ) : null}

            {concert.eventStatus === "POSTPONED" ? (
              <div className={`${concertStyles.alert} ${concertStyles.alertPostponed}`} role="status">
                <span className={concertStyles.alertTitle}>Концерт перенесён</span>
                <span>
                  Прежняя дата:{" "}
                  <span className={concertStyles.oldDate}>
                    {formatDateTime(concert.startsAt, concert.timezone)}
                  </span>
                </span>
                {concert.newStartsAt ? (
                  <span>Новая дата: {formatDateTime(concert.newStartsAt, concert.timezone)}</span>
                ) : (
                  <span>Новая дата будет объявлена дополнительно.</span>
                )}
                {concert.cancellationReason ? <span>{concert.cancellationReason}</span> : null}
              </div>
            ) : null}

            <div className={detailStyles.facts}>
              <div className={detailStyles.fact}>
                <span className={detailStyles.factLabel}>Дата и время</span>
                <span className={detailStyles.factValue}>
                  <time dateTime={displayDate.toISOString()}>
                    {formatDateTime(displayDate, concert.timezone)}
                  </time>{" "}
                  ({concert.timezone})
                </span>
              </div>

              {concert.doorsOpenAt ? (
                <div className={detailStyles.fact}>
                  <span className={detailStyles.factLabel}>Открытие дверей</span>
                  <span className={detailStyles.factValue}>
                    {formatTime(concert.doorsOpenAt, concert.timezone)}
                  </span>
                </div>
              ) : null}

              <div className={detailStyles.fact}>
                <span className={detailStyles.factLabel}>Площадка</span>
                <span className={detailStyles.factValue}>
                  {concert.venueName}
                  <br />
                  {concert.city}, {concert.country}
                  {concert.venueAddress ? (
                    <>
                      <br />
                      {concert.venueAddress}
                    </>
                  ) : null}
                  {isSafeExternalUrl(concert.mapUrl) ? (
                    <>
                      <br />
                      <a href={concert.mapUrl} target="_blank" rel="noopener noreferrer">
                        Открыть на карте →
                      </a>
                    </>
                  ) : null}
                </span>
              </div>

              {concert.organizerName ? (
                <div className={detailStyles.fact}>
                  <span className={detailStyles.factLabel}>Организатор</span>
                  <span className={detailStyles.factValue}>
                    {isSafeExternalUrl(concert.organizerUrl) ? (
                      <a href={concert.organizerUrl} target="_blank" rel="noopener noreferrer">
                        {concert.organizerName} →
                      </a>
                    ) : (
                      concert.organizerName
                    )}
                  </span>
                </div>
              ) : null}

              {concert.participants.length > 0 ? (
                <div className={detailStyles.fact}>
                  <span className={detailStyles.factLabel}>Участники</span>
                  <ul className={detailStyles.participants}>
                    {concert.participants.map((participant) => (
                      <li key={participant.id}>
                        {isSafeExternalUrl(participant.url) ? (
                          <a href={participant.url} target="_blank" rel="noopener noreferrer">
                            <Pill>{participant.name} →</Pill>
                          </a>
                        ) : (
                          <Pill>{participant.name}</Pill>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>

            <RichText doc={concert.description} />
          </div>

          <aside className={detailStyles.aside}>
            <ResponsiveImage
              src={concert.posterImage}
              spec="concertPoster"
              alt={`Афиша: ${concert.title}`}
              className={detailStyles.poster}
              priority
              sizes="(max-width: 960px) 100vw, 360px"
            />

            <div className={detailStyles.ticketBox}>
              <TicketButton concert={concert} fullWidth />
              <p className={detailStyles.ticketNote}>
                Продажа билетов ведётся на стороннем сайте организатора. Мы не принимаем оплату и не
                храним платёжные данные.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
