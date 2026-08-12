import { Link } from "react-router";
import type { SiteData } from "~/types/content";
import styles from "./Footer.module.css";

const SECTIONS = [
  { to: "/about", label: "О группе" },
  { to: "/news", label: "Новости" },
  { to: "/concerts", label: "Концерты" },
];

const MORE = [
  { to: "/music", label: "Музыка" },
  { to: "/media", label: "Фото и видео" },
  { to: "/contacts", label: "Контакты" },
];

export function Footer({ site }: { site: SiteData }) {
  const { settings } = site;
  const year = new Date().getFullYear();

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
            <nav className={styles.column} aria-label="Разделы сайта">
              <p className={styles.columnTitle}>Разделы</p>
              <ul className={styles.columnList}>
                {SECTIONS.map((item) => (
                  <li key={item.to}>
                    <Link to={item.to} className={styles.columnLink}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <nav className={styles.column} aria-label="Дополнительные разделы">
              <p className={styles.columnTitle}>Ещё</p>
              <ul className={styles.columnList}>
                {MORE.map((item) => (
                  <li key={item.to}>
                    <Link to={item.to} className={styles.columnLink}>
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
            <Link to="/privacy">Политика конфиденциальности</Link>
            <Link to="/personal-data-consent">Согласие на обработку данных</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
