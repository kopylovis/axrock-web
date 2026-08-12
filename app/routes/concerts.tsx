import type { Route } from "./+types/concerts";
import { AnimatedSection } from "~/components/common/AnimatedSection";
import { EmptyState, ErrorState } from "~/components/common/States";
import { PageSkeleton } from "~/components/common/PageSkeleton";
import { EventsStrip } from "~/components/concerts/EventsStrip";
import { fetchUpcomingConcerts } from "~/api/public-api";
import { breadcrumbs, buildMeta, jsonLd, ogImageFrom } from "~/lib/seo";
import { pluralize } from "~/utils/format";
import styles from "~/styles/page.module.css";

async function load() {
  return { upcoming: await fetchUpcomingConcerts(30).catch(() => null) };
}

export async function loader() {
  return load();
}

export async function clientLoader() {
  return load();
}

export function HydrateFallback() {
  return <PageSkeleton />;
}

export function meta({ location, matches }: Route.MetaArgs) {
  return [
    ...buildMeta({
      title: "Концерты",
      image: ogImageFrom(matches),
      description: "Афиша концертов группы «Ангел-Хранитель»: ближайшие выступления и билеты.",
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
  const { upcoming } = loaderData;
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
      </div>
    </div>
  );
}
