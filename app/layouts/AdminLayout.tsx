import { NavLink, Outlet, redirect, useLocation, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import type { Route } from "./+types/AdminLayout";
import { logout, me } from "~/api/admin-api";
import { PageSkeleton } from "~/components/common/PageSkeleton";
import { RebuildButton } from "~/components/admin/RebuildButton";
import { canEditContent, canManageUsers, roleLabel } from "~/utils/roles";
import { publicSiteUrl } from "~/utils/site-url";
import styles from "~/components/admin/admin.module.css";

/** Обзор стоит отдельно: это не раздел, а точка входа. */
const OVERVIEW = { to: "/admin", label: "Обзор" };

const NAV_GROUPS: Array<{
  id: string;
  label: string;
  requiresUserManager?: boolean;
  /** Скрыто от музыканта: он в панели только смотрит свой выезд и траты. */
  requiresEditor?: boolean;
  /** Раздел готов, но пока не используется — убран из меню до востребования. */
  hidden?: boolean;
  items: Array<{ to: string; label: string }>;
}> = [
  {
    id: "content",
    label: "Сайт",
    requiresEditor: true,
    items: [
      { to: "/admin/news", label: "Новости" },
      { to: "/admin/concerts", label: "Концерты" },
      { to: "/admin/about", label: "О группе" },
      { to: "/admin/members", label: "Участники" },
      { to: "/admin/releases", label: "Релизы" },
      { to: "/admin/media", label: "Медиа" },
    ],
  },
  {
    id: "crew",
    label: "Для группы",
    hidden: true,
    items: [
      { to: "/admin/tours", label: "Туры/Концерты" },
      { to: "/admin/expenses", label: "Мои расходы" },
    ],
  },
  {
    id: "settings",
    label: "Настройки сайта",
    requiresEditor: true,
    items: [
      { to: "/admin/contacts", label: "Контакты" },
      { to: "/admin/social-links", label: "Ссылки группы" },
      { to: "/admin/settings", label: "Общие" },
    ],
  },
  {
    id: "money",
    label: "Финансы",
    requiresUserManager: true,
    hidden: true,
    items: [{ to: "/admin/expenses-summary", label: "Общие расходы" }],
  },
  {
    id: "access",
    label: "Доступ",
    requiresUserManager: true,
    items: [{ to: "/admin/users", label: "Пользователи" }],
  },
];

const COLLAPSED_KEY = "axrock:admin-nav-collapsed";

/** Название текущего раздела — им подписана мобильная шапка. */
function currentSection(pathname: string): string {
  for (const group of NAV_GROUPS) {
    const item = group.items.find((entry) => pathname.startsWith(entry.to));
    if (item) return item.label;
  }
  return pathname.startsWith("/admin/profile") ? "Профиль" : OVERVIEW.label;
}

function loadCollapsed(): string[] {
  try {
    const raw = localStorage.getItem(COLLAPSED_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  try {
    return { admin: await me() };
  } catch {
    // Запоминаем, куда шли: после входа вернём туда же, а не на обзор.
    const { pathname, search } = new URL(request.url);
    const from = `${pathname}${search}`;
    throw redirect(from === "/admin" ? "/admin/login" : `/admin/login?from=${encodeURIComponent(from)}`);
  }
}

export const meta: Route.MetaFunction = () => [
  { title: "Администрирование — Ангел-Хранитель" },
  { name: "robots", content: "noindex, nofollow" },
];

export function HydrateFallback() {
  return <PageSkeleton label="Проверка доступа" />;
}

export default function AdminLayout({ loaderData }: Route.ComponentProps) {
  const { admin } = loaderData;
  const canEdit = canEditContent(admin.role);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [leaving, setLeaving] = useState(false);
  // Состояние групп переживает переходы между страницами.
  const [collapsed, setCollapsed] = useState<string[]>(loadCollapsed);
  // На узком экране меню выезжает поверх контента, иначе оно занимает первый
  // экран на каждой странице.
  const [menuOpen, setMenuOpen] = useState(false);

  // Перешли в раздел — меню закрывается само, руками его убирать не нужно.
  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  function toggleGroup(id: string) {
    setCollapsed((prev) => {
      const next = prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id];
      try {
        localStorage.setItem(COLLAPSED_KEY, JSON.stringify(next));
      } catch {
        // Приватный режим — просто не запоминаем.
      }
      return next;
    });
  }

  // Через <Form> выход не сделать: форма отправляется в текущий листовой
  // маршрут, а не в макет, где она объявлена.
  async function handleLogout() {
    setLeaving(true);
    try {
      await logout();
    } finally {
      navigate("/admin/login", { replace: true });
    }
  }

  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <button
          type="button"
          className={styles.burger}
          onClick={() => setMenuOpen(true)}
          aria-label="Открыть меню"
          aria-expanded={menuOpen}
          aria-controls="admin-nav"
        >
          <span className={styles.burgerIcon} aria-hidden="true" />
        </button>
        <span className={styles.topbarTitle}>{currentSection(pathname)}</span>
      </header>

      {menuOpen ? (
        <button
          type="button"
          className={styles.scrim}
          aria-label="Закрыть меню"
          onClick={() => setMenuOpen(false)}
        />
      ) : null}

      <aside
        id="admin-nav"
        className={[styles.sidebar, menuOpen ? styles.sidebarOpen : null].filter(Boolean).join(" ")}
      >
        <div className={styles.brand}>
          <span className={styles.brandTitle}>Ангел-Хранитель</span>
          <span className={styles.brandSub}>Панель управления</span>
          <button
            type="button"
            className={styles.sidebarClose}
            onClick={() => setMenuOpen(false)}
            aria-label="Закрыть меню"
          >
            ✕
          </button>
        </div>

        <nav className={styles.nav} aria-label="Разделы админки">
          {canEdit ? (
            <NavLink
              to={OVERVIEW.to}
              end
              className={({ isActive }) =>
                [styles.navLink, isActive ? styles.navLinkActive : null].filter(Boolean).join(" ")
              }
            >
              {OVERVIEW.label}
            </NavLink>
          ) : null}

          {NAV_GROUPS.filter(
            (group) =>
              !group.hidden &&
              (!group.requiresUserManager || canManageUsers(admin.role)) &&
              (!group.requiresEditor || canEdit),
          ).map((group) => {
            // Группу с текущим разделом не даём держать закрытой: иначе непонятно,
            // где находишься, и до соседних страниц не добраться.
            const hasActive = group.items.some((item) => pathname.startsWith(item.to));
            const open = hasActive || !collapsed.includes(group.id);

            return (
              <div key={group.id} className={styles.navGroup}>
                <button
                  type="button"
                  className={styles.navGroupTitle}
                  aria-expanded={open}
                  onClick={() => toggleGroup(group.id)}
                  disabled={hasActive}
                >
                  <span className={styles.navGroupChevron} aria-hidden="true">
                    {open ? "▾" : "▸"}
                  </span>
                  {group.label}
                </button>

                {open ? (
                  <div className={styles.navGroupItems}>
                    {group.items.map((item) => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                          [styles.navLink, isActive ? styles.navLinkActive : null]
                            .filter(Boolean)
                            .join(" ")
                        }
                      >
                        {item.label}
                      </NavLink>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <NavLink
            to="/admin/profile"
            className={({ isActive }) =>
              [styles.sidebarUser, isActive ? styles.sidebarUserActive : null]
                .filter(Boolean)
                .join(" ")
            }
          >
            <span className={styles.sidebarUserName}>
              {[admin.firstName, admin.lastName].filter(Boolean).join(" ") || admin.username}
            </span>
            <span className={styles.sidebarUserRole}>{roleLabel(admin.role)}</span>
          </NavLink>
          {canEdit ? <RebuildButton compact /> : null}
          <a href={publicSiteUrl()} target="_blank" rel="noreferrer" className={styles.navLink}>
            Открыть сайт ↗
          </a>
          <button type="button" className={styles.navLink} onClick={handleLogout} disabled={leaving}>
            {leaving ? "Выхожу…" : "Выйти"}
          </button>
        </div>
      </aside>

      <main className={styles.content}>
        <div className={styles.contentInner}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
