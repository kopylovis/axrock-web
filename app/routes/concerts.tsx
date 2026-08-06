import type { Route } from "./+types/concerts";
import { AnimatedSection } from "~/components/common/AnimatedSection";
import { Pagination } from "~/components/common/Pagination";
import { EmptyState, ErrorState } from "~/components/common/States";
import { PageSkeleton } from "~/components/common/PageSkeleton";
import { ConcertCard } from "~/components/concerts/ConcertCard";
import { EventsStrip } from "~/components/concerts/EventsStrip";
import { fetchPastConcerts, fetchUpcomingConcerts } from "~/api/public-api";
import { breadcrumbs, buildMeta, jsonLd, ogImageFrom } from "~/lib/seo";
import { pluralize } from "~/utils/format";
import styles from "~/styles/page.module.css";

const PAGE_SIZE = 12;

async function load(request: Request) {
  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get("page") ?? 1) || 1);
  const city = url.searchParams.get("city");

  const [upcoming, past] = await Promise.all([
    fetchUpcomingConcerts(30).catch(() => null),
    fetchPastConcerts({ page, pageSize: PAGE_SIZE, city }).catch(() => null),
  ]);

  return { upcoming, past };
}

export async function loader({ request }: Route.LoaderArgs) {
  return load(request);
}

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  return load(request);
}

export function HydrateFallback() {
  return <PageSkeleton />;
}

export function meta({ location, matches }: Route.MetaArgs) {
  return [
    ...buildMeta({
      title: "Концерты",
      image: ogImageFrom(matches),
      description:
        "Афиша концертов группы «Ангел-Хранитель»: ближайшие выступления и архив прошедших концертов.",
      pathname: location.pathname,
    }),
    jsonLd(
      breadcrumbs([
        { name: "Главная", path: "/" },
        { name: "Концерты", path: "/concerts" },
      ]),
    ),
  ];
}

export default function Concerts({ loaderData }: Route.ComponentProps) {
  const { upcoming, past } = loaderData;
  const upcomingCount = upcoming?.length ?? 0;

  return (
    <div className={styles.page}>
      <div className="container">
        <header className={`${styles.header} ${styles.headerWide}`}>
          <span className={styles.eyebrow}>Афиша</span>
          <h1 className={styles.title}>Концерты</h1>
          <p className={styles.lead}>
            Билеты продаются на сайтах организаторов — мы только даём на них ссылку.
          </p>
        </header>

        <AnimatedSection className={styles.block} ariaLabelledby="upcoming-heading">
          <h2 id="upcoming-heading" className={styles.blockTitle}>
            Ближайшие
            {upcomingCount > 0
              ? ` — ${upcomingCount} ${pluralize(upcomingCount, ["дата", "даты", "дат"])}`
              : ""}
          </h2>

          {upcoming === null ? <ErrorState /> : null}

          {upcoming && upcoming.length === 0 ? (
            <EmptyState
              title="Новые даты скоро появятся"
              description="Подпишитесь на соцсети группы, чтобы узнать о них первыми."
            />
          ) : null}

          {upcoming && upcoming.length > 0 ? <EventsStrip concerts={upcoming} /> : null}
        </AnimatedSection>

        <AnimatedSection className={styles.block} ariaLabelledby="past-heading">
          <h2 id="past-heading" className={styles.blockTitle}>
            Архив
          </h2>

          {past === null ? <ErrorState /> : null}

          {past && past.items.length === 0 ? (
            <EmptyState title="Архив пока пуст" description="Здесь появятся отыгранные концерты." />
          ) : null}

          {past && past.items.length > 0 ? (
            <>
              <div>
                {past.items.map((concert) => (
                  <ConcertCard key={concert.id} concert={concert} showTickets={false} />
                ))}
              </div>
              <Pagination page={past.page} totalPages={past.totalPages} />
            </>
          ) : null}
        </AnimatedSection>
      </div>
    </div>
  );
}
