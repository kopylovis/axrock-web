import { Link } from "react-router";
import type { Route } from "./+types/personal-data-consent";
import { useSiteData } from "~/layouts/PublicLayout";
import { buildMeta } from "~/lib/seo";
import { langFromPath, strings, useLocalPath, useT } from "~/i18n";
import styles from "~/styles/page.module.css";

export function meta({ location }: Route.MetaArgs) {
  const t = strings(langFromPath(location.pathname));

  return buildMeta({
    title: t.consent.metaTitle,
    description: t.consent.metaDescription,
    pathname: location.pathname,
  });
}

export default function PersonalDataConsent() {
  const { settings } = useSiteData();
  const t = useT();
  const lp = useLocalPath();
  const contact = settings.contactEmail ?? settings.bookingEmail;

  return (
    <div className={styles.page}>
      <div className="container">
        <header className={styles.header}>
          <span className={styles.eyebrow}>{t.legal.eyebrow}</span>
          <h1 className={styles.title}>{t.consent.title}</h1>
        </header>

        <div className={styles.prose}>
          <h2>{t.consent.subjectTitle}</h2>
          <p>{t.consent.subjectText}</p>

          <h2>{t.consent.dataTitle}</h2>
          <ul>
            {t.consent.dataItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <h2>{t.consent.purposeTitle}</h2>
          <p>{t.consent.purposeText}</p>

          <h2>{t.consent.actionsTitle}</h2>
          <p>{t.consent.actionsText}</p>

          <h2>{t.consent.revokeTitle}</h2>
          <p>
            {t.consent.revokeText}
            {contact ? (
              <>
                {" "}
                {t.consent.revokeOn} <a href={`mailto:${contact}`}>{contact}</a>
              </>
            ) : null}
            {t.consent.revokeTail}
          </p>

          <h2>{t.consent.relatedTitle}</h2>
          <p>
            {t.consent.relatedText}{" "}
            <Link to={lp("/privacy")}>{t.consent.relatedLink}</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
