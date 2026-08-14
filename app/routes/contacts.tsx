import type { Route } from "./+types/contacts";
import { useSiteData } from "~/layouts/PublicLayout";
import { AnimatedSection } from "~/components/common/AnimatedSection";
import { EmptyState } from "~/components/common/States";
import { MusicPlatformLinks, SocialLinks } from "~/components/layout/LinkLists";
import { breadcrumbs, buildMeta, jsonLd, ogImageFrom } from "~/lib/seo";
import { langFromPath, strings, useT } from "~/i18n";
import styles from "~/styles/page.module.css";

export function meta({ location, matches }: Route.MetaArgs) {
  const lang = langFromPath(location.pathname);
  const t = strings(lang);

  return [
    ...buildMeta({
      title: t.contacts.metaTitle,
      image: ogImageFrom(matches),
      description: t.contacts.metaDescription,
      pathname: location.pathname,
    }),
    jsonLd(
      breadcrumbs(
        [
          { name: t.breadcrumbs.home, path: "/" },
          { name: t.nav.contacts, path: "/contacts" },
        ],
        lang,
      ),
    ),
  ];
}

/** Телефон в ссылке tel: не терпит пробелов и скобок. */
function telHref(value: string): string {
  return `tel:${value.replace(/[^\d+]/g, "")}`;
}

/** В админке пишут либо «@ник», либо готовую ссылку — принимаем оба варианта. */
function telegramHref(value: string): string {
  return value.startsWith("http") ? value : `https://t.me/${value.replace(/^@/, "")}`;
}

function vkHref(value: string): string {
  return value.startsWith("http") ? value : `https://${value}`;
}

export default function Contacts() {
  const { settings, socialLinks, musicLinks } = useSiteData();
  const t = useT();

  const rows = [
    settings.contactPhone
      ? { label: t.contacts.phone, value: settings.contactPhone, href: telHref(settings.contactPhone) }
      : null,
    settings.managerTelegram
      ? {
          label: t.contacts.telegram,
          value: settings.managerTelegram,
          href: telegramHref(settings.managerTelegram),
        }
      : null,
    settings.managerMaxPhone
      ? { label: t.contacts.max, value: settings.managerMaxPhone, href: telHref(settings.managerMaxPhone) }
      : null,
    settings.bookingEmail
      ? { label: t.contacts.email, value: settings.bookingEmail, href: `mailto:${settings.bookingEmail}` }
      : null,
    settings.managerVkUrl
      ? {
          label: t.contacts.vk,
          value: settings.managerVkUrl.replace(/^https?:\/\//, ""),
          href: vkHref(settings.managerVkUrl),
        }
      : null,
  ].filter((row) => row !== null);

  return (
    <div className={styles.page}>
      <div className="container">
        <header className={styles.header}>
          <span className={styles.eyebrow}>{t.contacts.eyebrow}</span>
          <h1 className={styles.title}>{t.contacts.title}</h1>
        </header>

        {settings.managerName || rows.length > 0 ? (
          <AnimatedSection className={styles.block}>
            {settings.managerName ? (
              <p className={styles.contactLead}>
                <span className={styles.contactKey}>{t.contacts.manager}</span>
                {settings.managerName}
              </p>
            ) : null}

            <ul className={styles.contactList}>
              {rows.map((row) => (
                <li key={row.value}>
                  {row.label ? <span className={styles.contactKey}>{row.label}</span> : null}
                  <a
                    href={row.href}
                    className={styles.contactLink}
                    {...(row.href.startsWith("http")
                      ? { target: "_blank", rel: "noreferrer" }
                      : {})}
                  >
                    {row.value}
                  </a>
                </li>
              ))}
            </ul>
          </AnimatedSection>
        ) : (
          <EmptyState
            title={t.contacts.emptyTitle}
            description={t.contacts.emptyDescription}
          />
        )}

        {socialLinks.length > 0 ? (
          <AnimatedSection className={styles.block} ariaLabelledby="social-heading">
            <h2 id="social-heading" className={styles.blockTitle}>
              {t.contacts.social}
            </h2>
            <SocialLinks links={socialLinks} />
          </AnimatedSection>
        ) : null}

        {musicLinks.length > 0 ? (
          <AnimatedSection className={styles.block} ariaLabelledby="listen-heading">
            <h2 id="listen-heading" className={styles.blockTitle}>
              {t.contacts.listen}
            </h2>
            <MusicPlatformLinks links={musicLinks} />
          </AnimatedSection>
        ) : null}
      </div>
    </div>
  );
}
