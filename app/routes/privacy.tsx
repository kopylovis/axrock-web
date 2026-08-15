import type { Route } from "./+types/privacy";
import { useSiteData } from "~/layouts/PublicLayout";
import { buildMeta } from "~/lib/seo";
import { langFromPath, strings, useT } from "~/i18n";
import styles from "~/styles/page.module.css";

export function meta({ location }: Route.MetaArgs) {
  const t = strings(langFromPath(location.pathname));

  return buildMeta({
    title: t.privacy.metaTitle,
    description: t.privacy.metaDescription,
    pathname: location.pathname,
  });
}

export default function Privacy() {
  const { settings } = useSiteData();
  const t = useT();
  const contact = settings.contactEmail ?? settings.bookingEmail;

  return (
    <div className={styles.page}>
      <div className="container">
        <header className={`${styles.header} ${styles.headerLegal}`}>
          <span className={styles.eyebrow}>{t.legal.eyebrow}</span>
          <h1 className={styles.title}>{t.privacy.title}</h1>
        </header>

        <div className={styles.prose}>
          <h2>{t.privacy.generalTitle}</h2>
          <p>{t.privacy.generalText(settings.bandName)}</p>

          <h2>{t.privacy.dataTitle}</h2>
          <p>{t.privacy.dataIntro}</p>
          <ul>
            {t.privacy.dataItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <h2>{t.privacy.notCollectedTitle}</h2>
          <p>{t.privacy.notCollectedText}</p>

          <h2>{t.privacy.cookiesTitle}</h2>
          <p>{t.privacy.cookiesText}</p>

          <h2>{t.privacy.thirdPartiesTitle}</h2>
          <p>{t.privacy.thirdPartiesText}</p>

          <h2>{t.privacy.retentionTitle}</h2>
          <p>{t.privacy.retentionText}</p>

          <h2>{t.privacy.rightsTitle}</h2>
          <p>
            {t.privacy.rightsText}
            {contact ? (
              <>
                {" "}
                {t.privacy.rightsContact} <a href={`mailto:${contact}`}>{contact}</a>.
              </>
            ) : null}
          </p>

          <h2>{t.privacy.changesTitle}</h2>
          <p>{t.privacy.changesText}</p>
        </div>
      </div>
    </div>
  );
}
