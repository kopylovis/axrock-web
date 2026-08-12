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
    managerName: initial.managerName ?? "",
    managerTelegram: initial.managerTelegram ?? "",
    managerMaxPhone: initial.managerMaxPhone ?? "",
    managerVkUrl: initial.managerVkUrl ?? "",
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
        managerName: form.managerName.trim() || null,
        managerTelegram: form.managerTelegram.trim() || null,
        managerMaxPhone: form.managerMaxPhone.trim() || null,
        managerVkUrl: form.managerVkUrl.trim() || null,
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
        <h2 className={styles.panelTitle}>Менеджмент и организация концертов</h2>
        <p className={styles.hint}>Из этих полей собирается страница «Контакты» на сайте.</p>

        <div className={styles.form}>
          <div className={`${styles.formGrid} ${styles.formGridTwo}`}>
            <TextField
              label="Имя менеджера"
              value={form.managerName}
              placeholder="Даниил Коровайный"
              onChange={(event) => update("managerName")(event.target.value)}
            />
            <TextField
              label="Телефон"
              value={form.contactPhone}
              placeholder="+7 909 443-35-14"
              onChange={(event) => update("contactPhone")(event.target.value)}
            />
          </div>

          <div className={`${styles.formGrid} ${styles.formGridTwo}`}>
            <TextField
              label="Telegram"
              value={form.managerTelegram}
              placeholder="@kordankras"
              onChange={(event) => update("managerTelegram")(event.target.value)}
            />
            <TextField
              label="Max"
              value={form.managerMaxPhone}
              placeholder="+7 909 443-35-14"
              hint="Номер в мессенджере Max — оставьте пустым, если его нет."
              onChange={(event) => update("managerMaxPhone")(event.target.value)}
            />
          </div>

          <div className={`${styles.formGrid} ${styles.formGridTwo}`}>
            <TextField
              label="Почта"
              type="email"
              value={form.bookingEmail}
              placeholder="booking@example.com"
              onChange={(event) => update("bookingEmail")(event.target.value)}
            />
            <TextField
              label="Страница ВКонтакте"
              value={form.managerVkUrl}
              placeholder="https://vk.com/id5368163"
              onChange={(event) => update("managerVkUrl")(event.target.value)}
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

      <GlassPanel className={styles.panel}>
        <h2 className={styles.panelTitle}>Остальные адреса</h2>
        <p className={styles.hint}>
          Показываются на главной странице и в документах о персональных данных. На страницу
          «Контакты» не попадают.
        </p>

        <div className={styles.form}>
          <div className={`${styles.formGrid} ${styles.formGridTwo}`}>
            <TextField
              label="Почта для прессы"
              type="email"
              value={form.pressEmail}
              hint="Для интервью, аккредитации и запросов материалов."
              onChange={(event) => update("pressEmail")(event.target.value)}
            />
            <TextField
              label="Общая почта"
              type="email"
              value={form.contactEmail}
              hint="Указывается в политике конфиденциальности и согласии на обработку данных."
              onChange={(event) => update("contactEmail")(event.target.value)}
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
