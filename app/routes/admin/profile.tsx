import { useState } from "react";
import type { Route } from "./+types/profile";
import { changeOwnPassword, me, updateOwnProfile } from "~/api/admin-api";
import { ApiError } from "~/api/errors";
import { GlassPanel } from "~/components/common/GlassPanel";
import { PageSkeleton } from "~/components/common/PageSkeleton";
import { ErrorState } from "~/components/common/States";
import { TextField } from "~/components/admin/fields";
import { ADMIN_ROLE_HINTS, roleLabel, type AdminRole } from "~/utils/roles";
import styles from "~/components/admin/admin.module.css";

export async function clientLoader() {
  try {
    return { admin: await me(), failed: false as const };
  } catch {
    return { admin: null, failed: true as const };
  }
}

export function HydrateFallback() {
  return <PageSkeleton label="Загрузка профиля" />;
}

function describeError(cause: unknown): string {
  if (!(cause instanceof ApiError)) return "Не удалось сменить пароль";
  switch (cause.code) {
    case "INVALID_CREDENTIALS":
      return "Текущий пароль введён неверно";
    case "PASSWORD_TOO_SHORT":
      return "Новый пароль не может быть пустым";
    case "UNAUTHORIZED":
      return "Сессия истекла — войдите заново";
    case "BACKEND_UNAVAILABLE":
      return "Сервер не отвечает, попробуйте позже";
    default:
      return cause.description || "Не удалось сменить пароль";
  }
}

export default function AdminProfile({ loaderData }: Route.ComponentProps) {
  const { admin, failed } = loaderData;

  const [firstName, setFirstName] = useState(admin?.firstName ?? "");
  const [lastName, setLastName] = useState(admin?.lastName ?? "");
  const [nameSaving, setNameSaving] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [repeat, setRepeat] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (!current) {
      setError("Введите текущий пароль");
      return;
    }
    if (!next) {
      setError("Введите новый пароль");
      return;
    }
    if (next !== repeat) {
      setError("Новый пароль и подтверждение не совпадают");
      return;
    }
    if (next === current) {
      setError("Новый пароль совпадает с текущим");
      return;
    }

    setSaving(true);
    setError(null);
    setDone(false);
    try {
      await changeOwnPassword({ currentPassword: current, newPassword: next });
      setCurrent("");
      setNext("");
      setRepeat("");
      setDone(true);
    } catch (cause) {
      setError(describeError(cause));
    } finally {
      setSaving(false);
    }
  }

  async function saveName() {
    setNameSaving(true);
    setNameError(null);
    setNameSaved(false);
    try {
      await updateOwnProfile({
        firstName: firstName.trim() || null,
        lastName: lastName.trim() || null,
      });
      setNameSaved(true);
    } catch (cause) {
      setNameError(cause instanceof Error ? cause.message : "Не удалось сохранить имя");
    } finally {
      setNameSaving(false);
    }
  }

  if (failed || !admin) {
    return (
      <>
        <div className={styles.pageHead}>
          <h1 className={styles.pageTitle}>Профиль</h1>
        </div>
        <ErrorState />
      </>
    );
  }

  return (
    <>
      <div className={styles.pageHead}>
        <h1 className={styles.pageTitle}>Профиль</h1>
      </div>

      <GlassPanel className={styles.panel}>
        <h2 className={styles.panelTitle}>Учётная запись</h2>
        <div className={styles.form}>
          {nameError ? (
            <p className={styles.alert} role="alert">
              {nameError}
            </p>
          ) : null}
          {nameSaved ? (
            <p className={styles.success} role="status">
              Имя сохранено.
            </p>
          ) : null}

          <div className={`${styles.formGrid} ${styles.formGridTwo}`}>
            <TextField
              label="Имя"
              value={firstName}
              placeholder="Иван"
              onChange={(event) => setFirstName(event.target.value)}
            />
            <TextField
              label="Фамилия"
              value={lastName}
              placeholder="Копылов"
              onChange={(event) => setLastName(event.target.value)}
            />
          </div>
          <div className={styles.formActions}>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnSecondary}`}
              disabled={nameSaving}
              onClick={saveName}
            >
              {nameSaving ? "Сохраняю…" : "Сохранить имя"}
            </button>
          </div>
        </div>

        <dl className={styles.summary}>
          <div className={styles.summaryRow}>
            <dt>Логин</dt>
            <dd>{admin.username}</dd>
          </div>
          <div className={styles.summaryRow}>
            <dt>Роль</dt>
            <dd>
              {roleLabel(admin.role)}
              <span className={styles.summaryHint}>
                {ADMIN_ROLE_HINTS[admin.role as AdminRole]}
              </span>
            </dd>
          </div>
        </dl>
      </GlassPanel>

      <GlassPanel className={styles.panel}>
        <h2 className={styles.panelTitle}>Смена пароля</h2>

        {error ? (
          <p className={styles.alert} role="alert">
            {error}
          </p>
        ) : null}
        {done ? (
          <p className={styles.success}>
            Пароль изменён. Остальные ваши сессии завершены, эта вкладка продолжает работать.
          </p>
        ) : null}

        <div className={styles.form}>
          <TextField
            label="Текущий пароль"
            type="password"
            value={current}
            autoComplete="current-password"
            onChange={(event) => setCurrent(event.target.value)}
          />
          <div className={`${styles.formGrid} ${styles.formGridTwo}`}>
            <TextField
              label="Новый пароль"
              type="password"
              value={next}
              autoComplete="new-password"
              onChange={(event) => setNext(event.target.value)}
            />
            <TextField
              label="Повторите новый пароль"
              type="password"
              value={repeat}
              autoComplete="new-password"
              onChange={(event) => setRepeat(event.target.value)}
            />
          </div>
          <div className={styles.formActions}>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnPrimary}`}
              disabled={saving}
              onClick={submit}
            >
              {saving ? "Сохраняю…" : "Сменить пароль"}
            </button>
          </div>
        </div>
      </GlassPanel>
    </>
  );
}
