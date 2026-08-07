import { NavLink, Outlet, redirect, useNavigate } from "react-router";
import { useState } from "react";
import type { Route } from "./+types/AdminLayout";
import { logout, me } from "~/api/admin-api";
import { PageSkeleton } from "~/components/common/PageSkeleton";
import { RebuildButton } from "~/components/admin/RebuildButton";
import { canManageUsers, roleLabel } from "~/utils/roles";
import styles from "~/components/admin/admin.module.css";

const NAV = [
  { to: "/admin", label: "Обзор", end: true },
  { to: "/admin/news", label: "Новости" },
  { to: "/admin/concerts", label: "Концерты" },
  { to: "/admin/members", label: "Участники" },
  { to: "/admin/releases", label: "Релизы" },
  { to: "/admin/media", label: "Медиа" },
  { to: "/admin/social-links", label: "Соцссылки" },
  { to: "/admin/settings", label: "Настройки" },
  { to: "/admin/users", label: "Пользователи", requiresUserManager: true },
];

export async function clientLoader() {
  try {
    return { admin: await me() };
  } catch {
    throw redirect("/admin/login");
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
  const navigate = useNavigate();
  const [leaving, setLeaving] = useState(false);

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
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.brandTitle}>Ангел-Хранитель</span>
          <span className={styles.brandSub}>Панель управления</span>
        </div>

        <nav className={styles.nav} aria-label="Разделы админки">
          {NAV.filter((item) => !item.requiresUserManager || canManageUsers(admin.role)).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                [styles.navLink, isActive ? styles.navLinkActive : null].filter(Boolean).join(" ")
              }
            >
              {item.label}
            </NavLink>
          ))}
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
            <span className={styles.sidebarUserName}>{admin.username}</span>
            <span className={styles.sidebarUserRole}>{roleLabel(admin.role)}</span>
          </NavLink>
          <RebuildButton compact />
          <a href="/" target="_blank" rel="noreferrer" className={styles.navLink}>
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
