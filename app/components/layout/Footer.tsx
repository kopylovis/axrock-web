import { Link } from "react-router";
import type { SiteData } from "~/types/content";
import { useLocalPath, useT, type Strings } from "~/i18n";
import styles from "./Footer.module.css";

const SECTIONS: Array<{ to: string; key: keyof Strings["nav"] }> = [
  { to: "/about", key: "about" },
  { to: "/news", key: "news" },
  { to: "/concerts", key: "concerts" },
];

export function Footer({ site }: { site: SiteData }) {
  const { settings } = site;
  const t = useT();
  const lp = useLocalPath();
  const year = new Date().getFullYear();

  const more = [
    { to: "/music", label: t.nav.music },
    { to: "/media", label: t.footer.photoVideo },
    { to: "/contacts", label: t.nav.contacts },
  ];

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.top}>
          <div className={styles.brand}>
            {settings.logo ? (
              <img src={settings.logo} alt={settings.bandName} className={styles.brandLogo} />
            ) : (
              <p className={styles.brandName}>{settings.bandName}</p>
            )}
          </div>

          <div className={styles.columns}>
            <nav className={styles.column} aria-label={t.footer.siteSections}>
              <p className={styles.columnTitle}>{t.footer.sections}</p>
              <ul className={styles.columnList}>
                {SECTIONS.map((item) => (
                  <li key={item.to}>
                    <Link to={lp(item.to)} className={styles.columnLink}>
                      {t.nav[item.key]}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <nav className={styles.column} aria-label={t.footer.moreSections}>
              <p className={styles.columnTitle}>{t.footer.more}</p>
              <ul className={styles.columnList}>
                {more.map((item) => (
                  <li key={item.to}>
                    <Link to={lp(item.to)} className={styles.columnLink}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        <div className={styles.bottom}>
          <p>
            © {year} {settings.bandName}
          </p>
          <div className={styles.legal}>
            <Link to={lp("/privacy")}>{t.footer.privacy}</Link>
            <Link to={lp("/personal-data-consent")}>{t.footer.consent}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
