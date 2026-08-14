import type { Route } from "./+types/concerts";
import { AnimatedSection } from "~/components/common/AnimatedSection";
import { EmptyState, ErrorState } from "~/components/common/States";
import { PageSkeleton } from "~/components/common/PageSkeleton";
import { EventsStrip } from "~/components/concerts/EventsStrip";
import { fetchUpcomingConcerts } from "~/api/public-api";
import { breadcrumbs, buildMeta, jsonLd, ogImageFrom } from "~/lib/seo";
import { langFromPath, strings, useT } from "~/i18n";
import styles from "~/styles/page.module.css";

async function load(request: Request) {
  const lang = langFromPath(new URL(request.url).pathname);
  return { upcoming: await fetchUpcomingConcerts(30, lang).catch(() => null) };
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
  const lang = langFromPath(location.pathname);
  const t = strings(lang);

  return [
    ...buildMeta({
      title: t.concerts.metaTitle,
      image: ogImageFrom(matches),
      description: t.concerts.metaDescription,
      pathname: location.pathname,
    }),
    jsonLd(
      breadcrumbs(
        [
          { name: t.breadcrumbs.home, path: "/" },
          { name: t.nav.concerts, path: "/concerts" },
        ],
        lang,
      ),
    ),
  ];
}

export default function Concerts({ loaderData }: Route.ComponentProps) {
  const { upcoming } = loaderData;
  const t = useT();
  const upcomingCount = upcoming?.length ?? 0;

  return (
    <div className={styles.page}>
      <div className="container">
        <header className={`${styles.header} ${styles.headerWide}`}>
          <span className={styles.eyebrow}>{t.concerts.eyebrow}</span>
          <h1 className={styles.title}>{t.concerts.title}</h1>
          <p className={styles.lead}>
            {t.concerts.lead}
          </p>
        </header>

        <AnimatedSection className={styles.block} ariaLabelledby="upcoming-heading">
          <h2 id="upcoming-heading" className={styles.blockTitle}>
            {t.concerts.upcoming}
            {upcomingCount > 0 ? ` — ${t.concerts.upcomingCount(upcomingCount)}` : ""}
          </h2>

          {upcoming === null ? <ErrorState /> : null}

          {upcoming && upcoming.length === 0 ? (
            <EmptyState
              title={t.concerts.emptyTitle}
              description={t.concerts.emptyDescription}
            />
          ) : null}

          {upcoming && upcoming.length > 0 ? <EventsStrip concerts={upcoming} /> : null}
        </AnimatedSection>
      </div>
    </div>
  );
}
