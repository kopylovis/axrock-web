import type { Route } from "./+types/contacts";
import { useSiteData } from "~/layouts/PublicLayout";
import { AnimatedSection } from "~/components/common/AnimatedSection";
import { EmptyState } from "~/components/common/States";
import { MusicPlatformLinks, SocialLinks } from "~/components/layout/LinkLists";
import { breadcrumbs, buildMeta, jsonLd, ogImageFrom } from "~/lib/seo";
import homeStyles from "~/components/home/home.module.css";
import styles from "~/styles/page.module.css";

export function meta({ location, matches }: Route.MetaArgs) {
  return [
    ...buildMeta({
      title: "Контакты",
      image: ogImageFrom(matches),
      description:
        "Контакты группы «Ангел-Хранитель»: booking для организаторов, пресса, сотрудничество и соцсети.",
      pathname: location.pathname,
    }),
    jsonLd(
      breadcrumbs([
        { name: "Главная", path: "/" },
        { name: "Контакты", path: "/contacts" },
      ]),
    ),
  ];
}

export default function Contacts() {
  const { settings, socialLinks, musicLinks } = useSiteData();

  const contacts = [
    { label: "Организаторам и booking", value: settings.bookingEmail, type: "email" as const },
    { label: "Пресса", value: settings.pressEmail, type: "email" as const },
    { label: "Сотрудничество", value: settings.contactEmail, type: "email" as const },
    { label: "Телефон", value: settings.contactPhone, type: "phone" as const },
  ].filter((item) => Boolean(item.value));

  return (
    <div className={styles.page}>
      <div className="container">
        <header className={`${styles.header} ${styles.headerWide}`}>
          <span className={styles.eyebrow}>Связаться</span>
          <h1 className={styles.title}>Контакты</h1>
          <p className={styles.lead}>
            Пишите по вопросам концертов, интервью и совместных проектов.
          </p>
        </header>

        {contacts.length > 0 ? (
          <AnimatedSection className={styles.block}>
            <div className={homeStyles.contacts}>
              {contacts.map((contact) => (
                <div key={contact.label} className={homeStyles.contactCard}>
                  <span className={homeStyles.contactLabel}>{contact.label}</span>
                  <a
                    href={
                      contact.type === "email"
                        ? `mailto:${contact.value}`
                        : `tel:${contact.value?.replace(/[^\d+]/g, "")}`
                    }
                    className={homeStyles.contactValue}
                  >
                    {contact.value}
                  </a>
                </div>
              ))}
            </div>
          </AnimatedSection>
        ) : (
          <EmptyState
            title="Контакты скоро появятся"
            description="Раздел заполняется через административную панель сайта."
          />
        )}

        {socialLinks.length > 0 ? (
          <AnimatedSection className={styles.block}>
            <div className={homeStyles.linksGroup}>
              <p className={homeStyles.contactLabel}>Соцсети</p>
              <SocialLinks links={socialLinks} />
            </div>
          </AnimatedSection>
        ) : null}

        {musicLinks.length > 0 ? (
          <AnimatedSection className={styles.block}>
            <div className={homeStyles.linksGroup}>
              <p className={homeStyles.contactLabel}>Музыкальные площадки</p>
              <MusicPlatformLinks links={musicLinks} />
            </div>
          </AnimatedSection>
        ) : null}
      </div>
    </div>
  );
}
