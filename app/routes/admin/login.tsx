import { Form, redirect, useNavigation } from "react-router";
import type { Route } from "./+types/login";
import { login, me } from "~/api/admin-api";
import { ApiError } from "~/api/errors";
import { GlassPanel } from "~/components/common/GlassPanel";
import styles from "~/components/admin/admin.module.css";

/**
 * Куда вернуть после входа. Принимаем только внутренние адреса админки:
 * иначе параметр в ссылке превратился бы в открытый редирект на чужой сайт.
 */
function safeReturnPath(raw: string | null): string {
  if (!raw || !raw.startsWith("/admin") || raw.startsWith("//")) return "/admin";
  return raw.startsWith("/admin/login") ? "/admin" : raw;
}

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const from = safeReturnPath(new URL(request.url).searchParams.get("from"));
  try {
    await me();
    throw redirect(from);
  } catch (error) {
    if (error instanceof Response) throw error;
    return null;
  }
}

/** Сетевую ошибку и CORS нельзя показывать как «неверный пароль» — это уводит от причины. */
function describeLoginError(error: unknown): string {
  if (!(error instanceof ApiError)) return "Не удалось выполнить вход";

  if (error.code === "BACKEND_UNAVAILABLE") {
    return (
      "Не удалось связаться с сервером. Проверьте, что backend запущен, " +
      "а текущий адрес сайта разрешён в AXROCK_ALLOWED_ORIGINS."
    );
  }

  switch (error.status) {
    case 401:
      return "Неверный логин или пароль";
    case 429:
      return "Слишком много попыток входа. Попробуйте позже.";
    default:
      return error.description;
  }
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!username || !password) {
    return { error: "Введите логин и пароль" };
  }

  try {
    await login({ username, password });
  } catch (error) {
    return { error: describeLoginError(error) };
  }

  throw redirect(safeReturnPath(new URL(request.url).searchParams.get("from")));
}

export const meta: Route.MetaFunction = () => [
  { title: "Вход в админку — Ангел-Хранитель" },
  { name: "robots", content: "noindex, nofollow" },
];

export function HydrateFallback() {
  return (
    <div className={styles.loginPage}>
      <GlassPanel className={styles.loginCard}>
        <h1 className={styles.loginTitle}>Вход в панель</h1>
        <p className={styles.hint} role="status">
          Загрузка…
        </p>
      </GlassPanel>
    </div>
  );
}

export default function AdminLogin({ actionData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";

  return (
    <div className={styles.loginPage}>
      <GlassPanel className={styles.loginCard}>
        <h1 className={styles.loginTitle}>Вход в панель</h1>

        {actionData?.error ? (
          <p className={styles.alert} role="alert">
            {actionData.error}
          </p>
        ) : null}

        <Form method="post" className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="username">
              Логин
            </label>
            <input
              id="username"
              name="username"
              type="text"
              className={styles.input}
              autoComplete="username"
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">
              Пароль
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className={styles.input}
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            className={`${styles.btn} ${styles.btnPrimary} ${styles.btnFull}`}
            disabled={submitting}
          >
            {submitting ? "Вход…" : "Войти"}
          </button>
        </Form>
      </GlassPanel>
    </div>
  );
}
