import { useState } from "react";
import { useRevalidator } from "react-router";
import type { Route } from "./+types/users";
import {
  createAdminUser,
  deleteAdminUser,
  listAdminUsers,
  me,
  updateAdminUser,
  type AdminUser,
  type AdminUserListItem,
} from "~/api/admin-api";
import { ApiError } from "~/api/errors";
import { GlassPanel } from "~/components/common/GlassPanel";
import { PageSkeleton } from "~/components/common/PageSkeleton";
import { EmptyState, ErrorState } from "~/components/common/States";
import { RowMenu } from "~/components/admin/RowMenu";
import { SelectField, TextField } from "~/components/admin/fields";
import { parseUtcDate } from "~/api/mappers";
import { formatDateTime } from "~/utils/format";
import {
  ADMIN_ROLE_HINTS,
  ASSIGNABLE_ROLES,
  canManageUsers,
  roleLabel,
  type AdminRole,
} from "~/utils/roles";
import styles from "~/components/admin/admin.module.css";

const ROLE_OPTIONS = ASSIGNABLE_ROLES.map((role) => ({
  value: role,
  label: roleLabel(role),
}));

export async function clientLoader() {
  try {
    const admin = await me();
    if (!canManageUsers(admin.role)) {
      return { admin, users: [] as AdminUserListItem[], forbidden: true as const, failed: false as const };
    }
    return {
      admin,
      users: await listAdminUsers(),
      forbidden: false as const,
      failed: false as const,
    };
  } catch {
    return {
      admin: null as AdminUser | null,
      users: [] as AdminUserListItem[],
      forbidden: false as const,
      failed: true as const,
    };
  }
}

export function HydrateFallback() {
  return <PageSkeleton label="Загрузка пользователей" />;
}

/** Даты приходят без смещения — их разбирает parseUtcDate, пустые показываем прочерком. */
function formatDate(value: Date | null): string {
  return value ? formatDateTime(value) : "—";
}

function describeError(cause: unknown, fallback: string): string {
  if (!(cause instanceof ApiError)) return fallback;
  switch (cause.code) {
    case "USERNAME_ALREADY_TAKEN":
      return "Такой логин уже занят";
    case "PASSWORD_TOO_SHORT":
      return "Пароль не может быть пустым";
    case "OWNER_PROTECTED":
      return "Владельца может изменить только он сам";
    case "ROLE_NOT_ALLOWED":
      return "Такой роли не существует";
    case "FORBIDDEN":
      return "Недостаточно прав";
    case "ADMIN_USER_NOT_FOUND":
      return "Пользователь уже удалён — обновите страницу";
    case "UNAUTHORIZED":
      return "Сессия истекла — войдите заново";
    case "BACKEND_UNAVAILABLE":
      return "Сервер не отвечает, попробуйте позже";
    case "INVALID_FORMAT":
      return "Логин короче трёх символов";
    default:
      return cause.description || fallback;
  }
}

export default function AdminUsers({ loaderData }: Route.ComponentProps) {
  const { admin, users, forbidden, failed } = loaderData;
  const revalidator = useRevalidator();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AdminRole>("EDITOR");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function add() {
    if (username.trim().length < 3) {
      setError("Логин должен быть не короче трёх символов");
      return;
    }
    if (!password) {
      setError("Задайте пароль");
      return;
    }

    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      await createAdminUser({ username: username.trim(), password, role });
      setUsername("");
      setPassword("");
      setRole("EDITOR");
      setNotice("Пользователь создан");
      revalidator.revalidate();
    } catch (cause) {
      setError(describeError(cause, "Не удалось создать пользователя"));
    } finally {
      setSaving(false);
    }
  }

  async function changeRole(user: AdminUserListItem, next: AdminRole) {
    // Владелец может снять роль только с себя — и тогда потеряет часть доступа
    // до перезапуска сервера, который вернёт роль по AXROCK_ADMIN_USERNAME.
    if (
      user.role === "OWNER" &&
      !window.confirm(
        "Вы снимаете с себя роль владельца. Вернуть её сможет только перезапуск сервера. Продолжить?",
      )
    ) {
      return;
    }

    setError(null);
    setNotice(null);
    try {
      await updateAdminUser(user.id, { role: next });
      setNotice(`«${user.username}» — теперь ${roleLabel(next).toLowerCase()}`);
      revalidator.revalidate();
    } catch (cause) {
      setError(describeError(cause, "Не удалось сменить роль"));
    }
  }

  async function resetPassword(user: AdminUserListItem) {
    const next = window.prompt(`Новый пароль для «${user.username}»:`);
    if (next === null) return;
    if (!next) {
      setError("Пароль не может быть пустым");
      return;
    }

    setError(null);
    setNotice(null);
    try {
      await updateAdminUser(user.id, { password: next });
      setNotice(
        user.id === admin?.id
          ? "Пароль изменён"
          : `Пароль изменён, активные сессии «${user.username}» сброшены`,
      );
    } catch (cause) {
      setError(describeError(cause, "Не удалось сменить пароль"));
    }
  }

  async function remove(user: AdminUserListItem) {
    if (!window.confirm(`Удалить пользователя «${user.username}»?`)) return;

    setError(null);
    setNotice(null);
    try {
      await deleteAdminUser(user.id);
      revalidator.revalidate();
    } catch (cause) {
      setError(describeError(cause, "Не удалось удалить пользователя"));
    }
  }

  if (forbidden) {
    return (
      <>
        <div className={styles.pageHead}>
          <h1 className={styles.pageTitle}>Пользователи</h1>
        </div>
        <EmptyState
          title="Раздел недоступен"
          description="Управлять пользователями могут владелец и администраторы."
        />
      </>
    );
  }

  return (
    <>
      <div className={styles.pageHead}>
        <h1 className={styles.pageTitle}>Пользователи</h1>
      </div>

      <GlassPanel className={styles.panel}>
        <h2 className={styles.panelTitle}>Добавить пользователя</h2>

        {error ? (
          <p className={styles.alert} role="alert">
            {error}
          </p>
        ) : null}
        {notice ? <p className={styles.success}>{notice}</p> : null}

        <div className={styles.form}>
          <div className={`${styles.formGrid} ${styles.formGridTwo}`}>
            <TextField
              label="Логин"
              value={username}
              autoComplete="off"
              placeholder="editor"
              onChange={(event) => setUsername(event.target.value)}
            />
            <TextField
              label="Пароль"
              type="password"
              value={password}
              autoComplete="new-password"
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          <SelectField
            label="Роль"
            value={role}
            options={ROLE_OPTIONS}
            hint={ADMIN_ROLE_HINTS[role]}
            onChange={(event) => setRole(event.target.value as AdminRole)}
          />
          <div className={styles.formActions}>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnPrimary}`}
              disabled={saving}
              onClick={add}
            >
              {saving ? "Создаю…" : "Создать"}
            </button>
          </div>
        </div>
      </GlassPanel>

      {failed ? <ErrorState /> : null}

      {!failed && users.length === 0 ? (
        <EmptyState title="Пользователей нет" description="Добавьте первого сотрудника." />
      ) : null}

      {users.length > 0 ? (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Логин</th>
                <th>Роль</th>
                <th>Создан</th>
                <th>Последний вход</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const itsSelf = user.id === admin?.id;
                // Владельца трогает только он сам — то же правило проверяет бэкенд.
                const locked = user.role === "OWNER" && !itsSelf;

                const items = [
                  ...ASSIGNABLE_ROLES.filter((next) => next !== user.role).map((next) => ({
                    label: `Сделать ${roleLabel(next).toLowerCase()}ом`,
                    onSelect: () => changeRole(user, next),
                  })),
                  { label: "Сменить пароль", onSelect: () => resetPassword(user) },
                  ...(user.role === "OWNER" || itsSelf
                    ? []
                    : [{ label: "Удалить", danger: true, onSelect: () => remove(user) }]),
                ];

                return (
                  <tr key={user.id}>
                    <td className={styles.rowTitle}>
                      {user.username}
                      {itsSelf ? <span className={styles.rowNote}> — это вы</span> : null}
                    </td>
                    <td>
                      <span
                        className={`${styles.chip} ${
                          user.role === "OWNER" ? styles.chipPublished : styles.chipDraft
                        }`}
                      >
                        {roleLabel(user.role)}
                      </span>
                    </td>
                    <td>{formatDate(parseUtcDate(user.createdAt))}</td>
                    <td>{formatDate(parseUtcDate(user.lastLoginAt))}</td>
                    <td>
                      <div className={styles.rowActions}>
                        {locked ? (
                          <span className={styles.rowNote}>Защищён</span>
                        ) : (
                          <RowMenu label={`Действия: ${user.username}`} items={items} />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </>
  );
}
