import type { Route } from "./+types/contacts";
import { useSiteData } from "~/layouts/PublicLayout";
import { AnimatedSection } from "~/components/common/AnimatedSection";
import { EmptyState } from "~/components/common/States";
import { breadcrumbs, buildMeta, jsonLd, ogImageFrom } from "~/lib/seo";
import homeStyles from "~/components/home/home.module.css";
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
      ? { label: "Телефон", value: settings.contactPhone, href: telHref(settings.contactPhone) }
      : null,
    settings.managerTelegram
      ? {
          label: "Telegram",
          value: settings.managerTelegram,
          href: telegramHref(settings.managerTelegram),
        }
      : null,
    settings.managerMaxPhone
      ? { label: "Max", value: settings.managerMaxPhone, href: telHref(settings.managerMaxPhone) }
      : null,
    settings.bookingEmail
      ? {
          label: "E-mail",
          value: settings.bookingEmail,
          href: `mailto:${settings.bookingEmail}`,
        }
      : null,
    settings.managerVkUrl
      ? {
          label: "ВКонтакте",
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
              <div>
                <p className={homeStyles.contactLabel}>Менеджмент / организация концертов</p>
                <p className={styles.managerName}>{settings.managerName}</p>
              </div>
            ) : null}

            <div className={homeStyles.contacts}>
              {rows.map((row) => (
                <div key={row.label} className={homeStyles.contactCard}>
                  <span className={homeStyles.contactLabel}>{row.label}</span>
                  <a
                    href={row.href}
                    className={homeStyles.contactValue}
                    {...(row.href.startsWith("http")
                      ? { target: "_blank", rel: "noreferrer" }
                      : {})}
                  >
                    {row.value}
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
      </div>
    </div>
  );
}
