import { useState } from "react";
import type { Route } from "./+types/about";
import { getSettings, updateSettings } from "~/api/admin-api";
import type { SiteSettingsDto } from "~/api/dto";
import { GlassPanel } from "~/components/common/GlassPanel";
import { PageSkeleton } from "~/components/common/PageSkeleton";
import { ErrorState } from "~/components/common/States";
import { BilingualField, BilingualTextField } from "~/components/admin/fields";
import { RichTextEditor } from "~/components/admin/RichTextEditor";
import type { RichTextDoc } from "~/types/content";
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
  return <PageSkeleton label="Загрузка страницы" />;
}

export default function AdminAbout({ loaderData }: Route.ComponentProps) {
  if (!loaderData.settings) {
    return <ErrorState title="Не удалось загрузить текст страницы" />;
  }
  return <AboutForm initial={loaderData.settings} />;
}

/**
 * Тексты страницы «О группе» лежат в общей записи настроек, но искать их среди
 * логотипа и SEO неудобно — состав редактируется рядом, в «Участниках».
 */
function AboutForm({ initial }: { initial: SiteSettingsDto }) {
  const [shortBiography, setShortBiography] = useState(initial.shortBiography ?? "");
  const [fullBiography, setFullBiography] = useState<RichTextDoc | null>(initial.fullBiography);
  const [shortBiographyEn, setShortBiographyEn] = useState(initial.shortBiographyEn ?? "");
  const [fullBiographyEn, setFullBiographyEn] = useState<RichTextDoc | null>(
    initial.fullBiographyEn ?? null,
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      // Сохраняем запись целиком: у настроек один эндпоинт, и частичная
      // отправка обнулила бы всё, чего нет в этой форме.
      await updateSettings({
        ...initial,
        shortBiography: shortBiography.trim() || null,
        fullBiography,
        shortBiographyEn: shortBiographyEn.trim() || null,
        fullBiographyEn,
      });
      setSaved(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Не удалось сохранить текст");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className={`${styles.pageHead} ${styles.pageHeadSticky}`}>
        <h1 className={styles.pageTitle}>О группе</h1>
        <div className={styles.pageActions}>
          <a
            href={publicSiteUrl("about")}
            target="_blank"
            rel="noreferrer"
            className={`${styles.btn} ${styles.btnSecondary}`}
          >
            Открыть на сайте ↗
          </a>
        </div>
      </div>

      <p className={styles.pageNote}>
        Состав редактируется в разделе «Участники» — он выводится на этой же странице под биографией.
      </p>

      {error ? (
        <p className={styles.alert} role="alert">
          {error}
        </p>
      ) : null}
      {saved ? (
        <p className={styles.success} role="status">
          Текст сохранён. Чтобы изменения попали на сайт, нажмите «Обновить сайт».
        </p>
      ) : null}

      <GlassPanel className={styles.panel}>
        <h2 className={styles.panelTitle}>Тексты страницы</h2>

        <div className={styles.form}>
          <BilingualTextField
            label="Краткое описание группы"
            multiline
            rows={3}
            value={shortBiography}
            valueEn={shortBiographyEn}
            hint="Два-три предложения. Показываются крупным шрифтом в начале страницы «О группе» и в подвале сайта на всех страницах."
            onChange={setShortBiography}
            onChangeEn={setShortBiographyEn}
          />

          <BilingualField label="Полная биография" filledEn={Boolean(fullBiographyEn)}>
            {(lang) =>
              lang === "ru" ? (
                <RichTextEditor label="" value={fullBiography} onChange={setFullBiography} />
              ) : (
                <RichTextEditor label="" value={fullBiographyEn} onChange={setFullBiographyEn} />
              )
            }
          </BilingualField>
          <p className={styles.hint}>
            Основной текст страницы «О группе»: история, состав по годам, о чём песни. Можно
            разбивать подзаголовками, ставить ссылки и вставлять фотографии.
          </p>

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
