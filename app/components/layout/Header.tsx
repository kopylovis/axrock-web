import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router";
import { SocialLinks } from "./LinkLists";
import type { SocialLink } from "~/types/content";
import styles from "./Header.module.css";

const NAV_ITEMS = [
  { to: "/about", label: "О группе" },
  { to: "/news", label: "Новости" },
  { to: "/concerts", label: "Концерты" },
  { to: "/music", label: "Музыка" },
  { to: "/media", label: "Медиа" },
  { to: "/contacts", label: "Контакты" },
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
  const isHome = location.pathname === "/";

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
          <NavLink to="/" className={styles.logo} aria-label={`${bandName} — на главную`}>
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

          <nav className={styles.nav} aria-label="Основная навигация">
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.to} to={item.to} className={linkClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <button
            ref={toggleRef}
            type="button"
            className={styles.toggle}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Закрыть меню" : "Открыть меню"}
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

      {open ? (
        <div className={styles.drawer} id="mobile-nav">
          <nav className={styles.drawerNav} aria-label="Мобильная навигация">
            {NAV_ITEMS.map((item, index) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={drawerLinkClass}
                /* Пункты проявляются по очереди — задержка своя у каждого. */
                style={{ "--stagger": `${index * 45}ms` } as React.CSSProperties}
              >
                <span className={styles.drawerIndex} aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {item.label}
              </NavLink>
            ))}
          </nav>

          {socialLinks.length > 0 ? (
            <div className={styles.drawerFooter}>
              <span className={styles.drawerFooterLabel}>Мы в сети</span>
              <SocialLinks links={socialLinks} />
            </div>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
