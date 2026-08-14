import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router";
import { SocialLinks } from "./LinkLists";
import type { SocialLink } from "~/types/content";
import { useLang, useLocalPath, useT, withLang, type Strings } from "~/i18n";
import styles from "./Header.module.css";

const NAV_ITEMS: Array<{ to: string; key: keyof Strings["nav"] }> = [
  { to: "/about", key: "about" },
  { to: "/news", key: "news" },
  { to: "/concerts", key: "concerts" },
  { to: "/music", key: "music" },
  { to: "/media", key: "media" },
  { to: "/contacts", key: "contacts" },
];

export function Header({
  bandName,
  logo,
  socialLinks = [],
}: {
  bandName: string;
  logo: string | null;
  socialLinks?: SocialLink[];
}) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const t = useT();
  const lang = useLang();
  const lp = useLocalPath();
  const isHome = location.pathname === "/" || location.pathname === "/en";
  // Ссылка ведёт на ту же страницу на другом языке, а не на главную.
  const otherLang = lang === "ru" ? "en" : "ru";

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Над полноэкранным hero шапка прозрачная, дальше — плотная.
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    [styles.link, isActive ? styles.linkActive : null].filter(Boolean).join(" ");

  const drawerLinkClass = ({ isActive }: { isActive: boolean }) =>
    [styles.drawerLink, isActive ? styles.drawerLinkActive : null].filter(Boolean).join(" ");

  return (
    <>
      <header
        className={[styles.header, !isHome || scrolled || open ? styles.headerSolid : null]
          .filter(Boolean)
          .join(" ")}
      >
        <div className={`container ${styles.inner}`}>
          <NavLink to={lp("/")} className={styles.logo} aria-label={`${bandName} — ${t.header.toHome}`}>
            {logo ? (
              <span className={styles.logoBox}>
                {/* Изображение задаёт размер и несёт alt, цвет даёт слой по маске.
                    crossOrigin обязателен: без него картинка грузится в режиме no-cors
                    и оседает в кеше без CORS-заголовков, после чего маска её отвергает. */}
                <img
                  src={logo}
                  alt={bandName}
                  className={styles.logoImage}
                  crossOrigin="anonymous"
                />
                <span
                  className={styles.logoTint}
                  style={{
                    maskImage: `url("${logo}")`,
                    WebkitMaskImage: `url("${logo}")`,
                  }}
                  aria-hidden="true"
                />
              </span>
            ) : (
              <>
                <span className={styles.logoMark} aria-hidden="true">
                  АХ
                </span>
                <span>{bandName}</span>
              </>
            )}
          </NavLink>

          <nav className={styles.nav} aria-label={t.header.mainNav}>
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.to} to={lp(item.to)} className={linkClass}>
                {t.nav[item.key]}
              </NavLink>
            ))}
          </nav>

          {/* viewTransition просит браузер сделать кросс-фейд между версиями
              страницы: смена языка меняет почти весь текст сразу. */}
          <NavLink
            to={withLang(location.pathname, otherLang)}
            className={styles.langSwitch}
            hrefLang={otherLang}
            aria-label={t.header.switchTo}
            viewTransition
            preventScrollReset
          >
            {t.header.langShort}
          </NavLink>

          <button
            ref={toggleRef}
            type="button"
            className={styles.toggle}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? t.header.closeMenu : t.header.openMenu}
            onClick={() => setOpen((value) => !value)}
          >
            {/* Полосы складываются в крест: три отдельных элемента, чтобы
                переход был анимированным, а не подменой иконки. */}
            <span
              className={[styles.toggleIcon, open ? styles.toggleIconOpen : null]
                .filter(Boolean)
                .join(" ")}
              aria-hidden="true"
            >
              <span />
              <span />
              <span />
            </span>
          </button>
        </div>
      </header>

      {/* Панель всегда в разметке: если убирать её из дерева, закрытие происходит
          мгновенно — анимировать нечего. Скрытая, она не ловит фокус. */}
      <div
        className={[styles.drawer, open ? styles.drawerOpen : null].filter(Boolean).join(" ")}
        id="mobile-nav"
      >
        <nav className={styles.drawerNav} aria-label={t.header.mobileNav}>
          {NAV_ITEMS.map((item, index) => (
            <NavLink
              key={item.to}
              to={lp(item.to)}
              className={drawerLinkClass}
              /* Пункты проявляются по очереди — задержка своя у каждого. */
              style={{ "--stagger": `${index * 45}ms` } as React.CSSProperties}
            >
              <span className={styles.drawerIndex} aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              {t.nav[item.key]}
            </NavLink>
          ))}
        </nav>

        {socialLinks.length > 0 ? (
          <div className={styles.drawerFooter}>
            <span className={styles.drawerFooterLabel}>{t.header.online}</span>
            <SocialLinks links={socialLinks} />
          </div>
        ) : null}
      </div>
    </>
  );
}
