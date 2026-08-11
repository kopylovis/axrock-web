import { useState } from "react";
import type { Route } from "./+types/settings";
import { getSettings, updateSettings } from "~/api/admin-api";
import type { SiteSettingsDto } from "~/api/dto";
import { PageSkeleton } from "~/components/common/PageSkeleton";
import { ErrorState } from "~/components/common/States";
import { ImageField, TextAreaField, TextField, VectorField } from "~/components/admin/fields";
import { RichTextEditor } from "~/components/admin/RichTextEditor";
import type { RichTextDoc } from "~/types/content";
import styles from "~/components/admin/admin.module.css";

export async function clientLoader() {
  try {
    return { settings: await getSettings() };
  } catch {
    return { settings: null };
  }
}

export function HydrateFallback() {
  return <PageSkeleton label="Загрузка настроек" />;
}

export default function AdminSettings({ loaderData }: Route.ComponentProps) {
  if (!loaderData.settings) {
    return <ErrorState title="Не удалось загрузить настройки" />;
  }

  return <SettingsForm initial={loaderData.settings} />;
}

function SettingsForm({ initial }: { initial: SiteSettingsDto }) {
  const [form, setForm] = useState({
    siteName: initial.siteName,
    bandName: initial.bandName,
    heroTitle: initial.heroTitle,
    shortBiography: initial.shortBiography ?? "",
    contactEmail: initial.contactEmail ?? "",
    contactPhone: initial.contactPhone ?? "",
    bookingEmail: initial.bookingEmail ?? "",
    pressEmail: initial.pressEmail ?? "",
    defaultSeoTitle: initial.defaultSeoTitle ?? "",
    defaultSeoDescription: initial.defaultSeoDescription ?? "",
  });

  const [heroImage, setHeroImage] = useState<string | null>(initial.heroImage);
  const [logo, setLogo] = useState<string | null>(initial.logo);
  const [ogImage, setOgImage] = useState<string | null>(initial.defaultOgImage);
  const [fullBiography, setFullBiography] = useState<RichTextDoc | null>(initial.fullBiography);
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
      await updateSettings({
        siteName: form.siteName.trim(),
        bandName: form.bandName.trim(),
        heroTitle: form.heroTitle.trim(),
        heroSubtitle: "",
        heroImage,
        logo,
        shortBiography: form.shortBiography.trim() || null,
        fullBiography,
        contactEmail: form.contactEmail.trim() || null,
        contactPhone: form.contactPhone.trim() || null,
        bookingEmail: form.bookingEmail.trim() || null,
        pressEmail: form.pressEmail.trim() || null,
        defaultSeoTitle: form.defaultSeoTitle.trim() || null,
        defaultSeoDescription: form.defaultSeoDescription.trim() || null,
        defaultOgImage: ogImage,
      });
      setSaved(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Не удалось сохранить настройки");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className={`${styles.pageHead} ${styles.pageHeadSticky}`}>
        <h1 className={styles.pageTitle}>Настройки сайта</h1>
      </div>

      {error ? (
        <p className={styles.alert} role="alert">
          {error}
        </p>
      ) : null}
      {saved ? <p className={styles.success}>Настройки сохранены.</p> : null}

      <div className={styles.form}>
        <div className={`${styles.formGrid} ${styles.formGridTwo}`}>
          <TextField
            label="Название сайта"
            value={form.siteName}
            onChange={(event) => update("siteName")(event.target.value)}
          />
          <TextField
            label="Название группы"
            value={form.bandName}
            onChange={(event) => update("bandName")(event.target.value)}
          />
        </div>

        <TextField
          label="Заголовок первого экрана"
          value={form.heroTitle}
          hint="Крупная надпись на главной поверх фотографии. Если загружен логотип, вместо неё показывается он, а этот текст остаётся альтернативным описанием картинки для незрячих и поисковиков."
          onChange={(event) => update("heroTitle")(event.target.value)}
        />

        <VectorField label="Логотип группы" value={logo} onChange={setLogo} />

        <ImageField label="Главная фотография" spec="hero" value={heroImage} onChange={setHeroImage} />

        <TextAreaField
          label="Краткое описание группы"
          value={form.shortBiography}
          onChange={(event) => update("shortBiography")(event.target.value)}
        />

        <RichTextEditor
          label="Полная биография"
          value={fullBiography}
          onChange={setFullBiography}
        />

        <div className={`${styles.formGrid} ${styles.formGridTwo}`}>
          <TextField
            label="SEO-заголовок по умолчанию"
            value={form.defaultSeoTitle}
            hint="Подставляется в заголовок вкладки браузера и в синюю ссылку выдачи Яндекса и Google на тех страницах, где свой заголовок не задан. До 60 символов."
            onChange={(event) => update("defaultSeoTitle")(event.target.value)}
          />
          <TextField
            label="SEO-описание по умолчанию"
            value={form.defaultSeoDescription}
            hint="Серый текст под ссылкой в результатах поиска — используется, когда у страницы нет своего описания. 120–160 символов."
            onChange={(event) => update("defaultSeoDescription")(event.target.value)}
          />
        </div>

        <ImageField
          label="Картинка для ссылок в мессенджерах"
          spec="ogImage"
          hint="Превью, которое подтягивают ВКонтакте, Telegram и WhatsApp, когда кто-то отправляет ссылку на сайт. Берётся, если у конкретной страницы нет своей картинки."
          value={ogImage}
          onChange={setOgImage}
        />

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
    </>
  );
}
