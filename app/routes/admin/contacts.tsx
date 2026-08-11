import { useState } from "react";
import type { Route } from "./+types/contacts";
import { getSettings, updateSettings } from "~/api/admin-api";
import type { SiteSettingsDto } from "~/api/dto";
import { GlassPanel } from "~/components/common/GlassPanel";
import { PageSkeleton } from "~/components/common/PageSkeleton";
import { ErrorState } from "~/components/common/States";
import { TextField } from "~/components/admin/fields";
import { publicSiteUrl } from "~/utils/site-url";
import styles from "~/components/admin/admin.module.css";

export async function clientLoader() {
  try {
    return { settings: await getSettings() };
  } catch {
    return { settings: null };
  }
}

export function HydrateFallback() {
  return <PageSkeleton label="Загрузка контактов" />;
}

export default function AdminContacts({ loaderData }: Route.ComponentProps) {
  if (!loaderData.settings) {
    return <ErrorState title="Не удалось загрузить контакты" />;
  }
  return <ContactsForm initial={loaderData.settings} />;
}

/**
 * Контакты — часть той же записи настроек, но правят их отдельно от логотипа и
 * SEO, поэтому и раздел отдельный: искать почту среди картинок неудобно.
 */
function ContactsForm({ initial }: { initial: SiteSettingsDto }) {
  const [form, setForm] = useState({
    bookingEmail: initial.bookingEmail ?? "",
    pressEmail: initial.pressEmail ?? "",
    contactEmail: initial.contactEmail ?? "",
    contactPhone: initial.contactPhone ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (key: keyof typeof form) => (value: string) =>
    setForm((previous) => ({ ...previous, [key]: value }));

  async function submit() {
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      // Сохраняем запись целиком: у настроек один эндпоинт, и частичная
      // отправка обнулила бы всё, чего нет в этой форме.
      await updateSettings({
        ...initial,
        bookingEmail: form.bookingEmail.trim() || null,
        pressEmail: form.pressEmail.trim() || null,
        contactEmail: form.contactEmail.trim() || null,
        contactPhone: form.contactPhone.trim() || null,
      });
      setSaved(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Не удалось сохранить контакты");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className={`${styles.pageHead} ${styles.pageHeadSticky}`}>
        <h1 className={styles.pageTitle}>Контакты</h1>
        <div className={styles.pageActions}>
          <a
            href={publicSiteUrl("contacts")}
            target="_blank"
            rel="noreferrer"
            className={`${styles.btn} ${styles.btnSecondary}`}
          >
            Открыть на сайте ↗
          </a>
        </div>
      </div>

      {error ? (
        <p className={styles.alert} role="alert">
          {error}
        </p>
      ) : null}
      {saved ? (
        <p className={styles.success} role="status">
          Контакты сохранены. Чтобы изменения попали на сайт, нажмите «Обновить сайт».
        </p>
      ) : null}

      <GlassPanel className={styles.panel}>
        <h2 className={styles.panelTitle}>Почта и телефон</h2>

        <div className={styles.form}>
          <div className={`${styles.formGrid} ${styles.formGridTwo}`}>
            <TextField
              label="Почта для организаторов"
              type="email"
              value={form.bookingEmail}
              hint="Для приглашений на концерты и вопросов по райдеру."
              onChange={(event) => update("bookingEmail")(event.target.value)}
            />
            <TextField
              label="Почта для прессы"
              type="email"
              value={form.pressEmail}
              hint="Для интервью, аккредитации и запросов материалов."
              onChange={(event) => update("pressEmail")(event.target.value)}
            />
          </div>

          <div className={`${styles.formGrid} ${styles.formGridTwo}`}>
            <TextField
              label="Общая почта"
              type="email"
              value={form.contactEmail}
              hint="Показывается, когда для запроса не подходит ни одна из специальных."
              onChange={(event) => update("contactEmail")(event.target.value)}
            />
            <TextField
              label="Телефон"
              value={form.contactPhone}
              hint="Публикуется на сайте — оставьте пустым, если не нужен."
              onChange={(event) => update("contactPhone")(event.target.value)}
            />
          </div>

          <div className={`${styles.formActions} ${styles.formActionsSticky}`}>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnPrimary}`}
              disabled={saving}
              onClick={submit}
            >
              {saving ? "Сохраняю…" : "Сохранить"}
            </button>
          </div>
        </div>
      </GlassPanel>
    </>
  );
}
