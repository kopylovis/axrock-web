import type { Route } from "./+types/contacts";
import { useSiteData } from "~/layouts/PublicLayout";
import { AnimatedSection } from "~/components/common/AnimatedSection";
import { EmptyState } from "~/components/common/States";
import { breadcrumbs, buildMeta, jsonLd, ogImageFrom } from "~/lib/seo";
import styles from "~/styles/page.module.css";

export function meta({ location, matches }: Route.MetaArgs) {
  return [
    ...buildMeta({
      title: "Контакты",
      image: ogImageFrom(matches),
      description:
        "Контакты группы «Ангел-Хранитель»: менеджмент и организация концертов, телефон, Telegram и почта.",
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
  const { settings } = useSiteData();

  const rows = [
    settings.contactPhone
      ? { label: "Tel.:", value: settings.contactPhone, href: telHref(settings.contactPhone) }
      : null,
    settings.managerTelegram
      ? {
          label: "Telegram:",
          value: settings.managerTelegram,
          href: telegramHref(settings.managerTelegram),
        }
      : null,
    settings.managerMaxPhone
      ? { label: "Max:", value: settings.managerMaxPhone, href: telHref(settings.managerMaxPhone) }
      : null,
    settings.bookingEmail
      ? { label: "E-mail:", value: settings.bookingEmail, href: `mailto:${settings.bookingEmail}` }
      : null,
    settings.managerVkUrl
      ? {
          label: null,
          value: settings.managerVkUrl.replace(/^https?:\/\//, ""),
          href: vkHref(settings.managerVkUrl),
        }
      : null,
  ].filter((row) => row !== null);

  return (
    <div className={styles.page}>
      <div className="container">
        <header className={styles.header}>
          <span className={styles.eyebrow}>Связаться</span>
          <h1 className={styles.title}>Контакты</h1>
        </header>

        {settings.managerName || rows.length > 0 ? (
          <AnimatedSection className={styles.block}>
            {settings.managerName ? (
              <p className={styles.contactLead}>
                Менеджмент/Организация концертов: {settings.managerName}
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
            title="Контакты скоро появятся"
            description="Раздел заполняется через административную панель сайта."
          />
        )}
      </div>
    </div>
  );
}
