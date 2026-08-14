import type { Route } from "./+types/about";
import { useSiteData } from "~/layouts/PublicLayout";
import { AnimatedSection } from "~/components/common/AnimatedSection";
import { ButtonLink } from "~/components/common/Button";
import { ResponsiveImage } from "~/components/common/ResponsiveImage";
import { RichText } from "~/components/common/RichText";
import { EmptyState } from "~/components/common/States";
import { PageSkeleton } from "~/components/common/PageSkeleton";
import { MemberCard } from "~/components/members/MemberCard";
import { ReleaseTile } from "~/components/music/ReleaseTile";
import { fetchMembers, fetchReleases } from "~/api/public-api";
import { breadcrumbs, buildMeta, jsonLd, ogImageFrom } from "~/lib/seo";
import { langFromPath, strings, useT } from "~/i18n";
import memberStyles from "~/components/members/MemberCard.module.css";
import releaseStyles from "~/components/music/ReleaseCard.module.css";
import styles from "~/styles/page.module.css";

async function load(request: Request) {
  const lang = langFromPath(new URL(request.url).pathname);
  const [releases, members] = await Promise.all([
    fetchReleases(lang).catch(() => []),
    fetchMembers(lang).catch(() => []),
  ]);
  return { releases, members };
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
      title: t.about.metaTitle,
      image: ogImageFrom(matches),
      description: t.about.metaDescription,
      pathname: location.pathname,
    }),
    jsonLd(
      breadcrumbs(
        [
          { name: t.breadcrumbs.home, path: "/" },
          { name: t.nav.about, path: "/about" },
        ],
        lang,
      ),
    ),
  ];
}

export default function About({ loaderData }: Route.ComponentProps) {
  const { releases, members } = loaderData;
  const { settings } = useSiteData();
  const t = useT();
  const currentMembers = members.filter((member) => member.currentMember);
  const formerMembers = members.filter((member) => !member.currentMember);

  return (
    <div className={styles.page}>
      <div className="container">
        <header className={`${styles.header} ${styles.headerWide}`}>
          <span className={styles.eyebrow}>{t.about.eyebrow}</span>
          <div className={styles.titleFit}>
            <h1 className={styles.title}>{settings.bandName}</h1>
          </div>
          {settings.shortBiography ? <p className={styles.lead}>{settings.shortBiography}</p> : null}
        </header>

        {settings.heroImage ? (
          <AnimatedSection className={styles.block}>
            <ResponsiveImage
              src={settings.heroImage}
              spec="hero"
              alt={t.about.photoAlt(settings.bandName)}
              aspectRatio="21 / 9"
              sizes="(max-width: 1180px) 100vw, 1180px"
              className={styles.wideImage}
            />
          </AnimatedSection>
        ) : null}

        <AnimatedSection className={styles.block}>
          {settings.fullBiography ? (
            <div className={`${styles.prose} ${styles.proseWide}`}>
              <RichText doc={settings.fullBiography} />
            </div>
          ) : (
            <EmptyState
              title={t.about.bioEmptyTitle}
              description={t.about.bioEmptyDescription}
            />
          )}
        </AnimatedSection>

        {currentMembers.length > 0 ? (
          <AnimatedSection className={styles.block} id="lineup">
            <h2 className={styles.blockTitle}>{t.about.lineup}</h2>
            <div className={memberStyles.grid}>
              {currentMembers.map((member) => (
                <MemberCard key={member.id} member={member} />
              ))}
            </div>
          </AnimatedSection>
        ) : null}

        {formerMembers.length > 0 ? (
          <AnimatedSection className={styles.block}>
            <h2 className={styles.blockTitle}>{t.about.formerMembers}</h2>
            <div className={memberStyles.grid}>
              {formerMembers.map((member) => (
                <MemberCard key={member.id} member={member} />
              ))}
            </div>
          </AnimatedSection>
        ) : null}

        {releases.length > 0 ? (
          <AnimatedSection className={styles.block}>
            <h2 className={styles.blockTitle}>{t.about.releases}</h2>
            <div className={releaseStyles.tileGrid}>
              {releases.map((release) => (
                <ReleaseTile key={release.id} release={release} />
              ))}
            </div>
            <div>
              <ButtonLink to="/music" variant="ghost">
                {t.about.allReleases}
              </ButtonLink>
            </div>
          </AnimatedSection>
        ) : null}

        <AnimatedSection className={styles.block}>
          <h2 className={styles.blockTitle}>{t.about.more}</h2>
          <div className={styles.actions}>
            <ButtonLink to="/news" variant="quiet">
              {t.about.bandNews}
            </ButtonLink>
            <ButtonLink to="/concerts" variant="quiet">
              {t.about.concertPoster}
            </ButtonLink>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}
