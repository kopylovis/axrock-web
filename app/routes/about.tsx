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
import memberStyles from "~/components/members/MemberCard.module.css";
import releaseStyles from "~/components/music/ReleaseCard.module.css";
import styles from "~/styles/page.module.css";
import homeStyles from "~/components/home/home.module.css";

async function load() {
  const [releases, members] = await Promise.all([
    fetchReleases().catch(() => []),
    fetchMembers().catch(() => []),
  ]);
  return { releases, members };
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
      title: "О группе",
      image: ogImageFrom(matches),
      description:
        "История рок-группы «Ангел-Хранитель», состав музыкантов, музыкальное направление и релизы.",
      pathname: location.pathname,
    }),
    jsonLd(
      breadcrumbs([
        { name: "Главная", path: "/" },
        { name: "О группе", path: "/about" },
      ]),
    ),
  ];
}

export default function About({ loaderData }: Route.ComponentProps) {
  const { releases, members } = loaderData;
  const { settings } = useSiteData();
  const currentMembers = members.filter((member) => member.currentMember);
  const formerMembers = members.filter((member) => !member.currentMember);

  return (
    <div className={styles.page}>
      <div className="container">
        <header className={`${styles.header} ${styles.headerWide}`}>
          <span className={styles.eyebrow}>О группе</span>
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
              alt={`Группа ${settings.bandName}`}
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
              title="Биография скоро появится"
              description="Раздел наполняется через административную панель сайта."
            />
          )}
        </AnimatedSection>

        {currentMembers.length > 0 ? (
          <AnimatedSection className={styles.block} id="lineup">
            <h2 className={styles.blockTitle}>Состав</h2>
            <div className={memberStyles.grid}>
              {currentMembers.map((member) => (
                <MemberCard key={member.id} member={member} />
              ))}
            </div>
          </AnimatedSection>
        ) : null}

        {formerMembers.length > 0 ? (
          <AnimatedSection className={styles.block}>
            <h2 className={styles.blockTitle}>Бывшие участники</h2>
            <div className={memberStyles.grid}>
              {formerMembers.map((member) => (
                <MemberCard key={member.id} member={member} />
              ))}
            </div>
          </AnimatedSection>
        ) : null}

        {releases.length > 0 ? (
          <AnimatedSection className={styles.block}>
            <h2 className={styles.blockTitle}>Релизы</h2>
            <div className={releaseStyles.tileGrid}>
              {releases.map((release) => (
                <ReleaseTile key={release.id} release={release} />
              ))}
            </div>
            <div>
              <ButtonLink to="/music" variant="ghost">
                Вся дискография
              </ButtonLink>
            </div>
          </AnimatedSection>
        ) : null}

        <AnimatedSection className={styles.block}>
          <div className={homeStyles.sectionFooter}>
            <ButtonLink to="/news" variant="quiet">
              Новости группы
            </ButtonLink>
            <ButtonLink to="/concerts" variant="quiet">
              Афиша концертов
            </ButtonLink>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}
