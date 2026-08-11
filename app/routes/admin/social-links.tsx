import { useState } from "react";
import { useRevalidator } from "react-router";
import type { Route } from "./+types/social-links";
import { createSocialLink, deleteSocialLink, listSocialLinks } from "~/api/admin-api";
import { GlassPanel } from "~/components/common/GlassPanel";
import { PageSkeleton } from "~/components/common/PageSkeleton";
import { EmptyState, ErrorState } from "~/components/common/States";
import { TextField } from "~/components/admin/fields";
import { SOCIAL_PLATFORMS, SocialIcon } from "~/components/common/SocialIcon";
import styles from "~/components/admin/admin.module.css";

export async function clientLoader() {
  try {
    return { links: await listSocialLinks(), failed: false as const };
  } catch {
    return { links: [], failed: true as const };
  }
}

export function HydrateFallback() {
  return <PageSkeleton label="Загрузка ссылок" />;
}

export default function AdminSocialLinks({ loaderData }: Route.ComponentProps) {
  const { links, failed } = loaderData;
  const revalidator = useRevalidator();

  const [platform, setPlatform] = useState("");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function add() {
    if (!platform.trim() || !title.trim()) {
      setError("Заполните платформу и подпись");
      return;
    }
    if (!/^https:\/\/\S+$/i.test(url.trim())) {
      setError("Ссылка должна начинаться с https://");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await createSocialLink({
        platform: platform.trim(),
        title: title.trim(),
        url: url.trim(),
        sortOrder: links.length,
        visible: true,
      });
      setPlatform("");
      setTitle("");
      setUrl("");
      revalidator.revalidate();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Не удалось добавить ссылку");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: number) {
    if (!window.confirm("Удалить ссылку?")) return;
    await deleteSocialLink(id);
    revalidator.revalidate();
  }

  return (
    <>
      <div className={styles.pageHead}>
        <h1 className={styles.pageTitle}>Ссылки на соцсети</h1>
      </div>

      <GlassPanel className={styles.panel}>
        <h2 className={styles.panelTitle}>Добавить ссылку</h2>

        {error ? (
          <p className={styles.alert} role="alert">
            {error}
          </p>
        ) : null}

        <div className={styles.form}>
          <div className={styles.field}>
            <span className={styles.label}>Значок площадки</span>
            <div className={styles.iconPicker}>
              {SOCIAL_PLATFORMS.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  className={`${styles.iconTile} ${platform === option.key ? styles.iconTileActive : ""}`}
                  onClick={() => {
                    setPlatform(option.key);
                    // Подпись подставляем, только если её ещё не трогали.
                    if (!title.trim()) setTitle(option.label);
                  }}
                  title={option.label}
                  aria-pressed={platform === option.key}
                >
                  <SocialIcon platform={option.key} className={styles.iconGlyph} />
                  <span className={styles.iconCaption}>{option.label}</span>
                </button>
              ))}
            </div>
            <span className={styles.hint}>
              Значок подставляется по выбранной площадке. Если нужной нет, впишите свой ключ ниже —
              ссылка останется текстовой.
            </span>
          </div>

          <div className={`${styles.formGrid} ${styles.formGridTwo}`}>
            <TextField
              label="Ключ платформы"
              value={platform}
              placeholder="vk"
              onChange={(event) => setPlatform(event.target.value)}
            />
            <TextField
              label="Подпись"
              value={title}
              placeholder="ВКонтакте"
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>
          <TextField
            label="Адрес"
            value={url}
            placeholder="https://vk.com/..."
            onChange={(event) => setUrl(event.target.value)}
          />
          <div className={styles.formActions}>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnPrimary}`}
              disabled={saving}
              onClick={add}
            >
              {saving ? "Добавляю…" : "Добавить"}
            </button>
          </div>
        </div>
      </GlassPanel>

      {failed ? <ErrorState /> : null}

      {!failed && links.length === 0 ? (
        <EmptyState title="Ссылок пока нет" description="Добавьте профили группы в соцсетях." />
      ) : null}

      {links.length > 0 ? (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Подпись</th>
                <th>Платформа</th>
                <th>Адрес</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {links.map((link) => (
                <tr key={link.id}>
                  <td>
                    <span className={styles.rowWithIcon}>
                      <SocialIcon platform={link.platform} className={styles.iconGlyph} />
                      <span className={styles.rowTitle}>{link.title}</span>
                    </span>
                  </td>
                  <td>{link.platform}</td>
                  <td>
                    <a href={link.url} target="_blank" rel="noreferrer">
                      {link.url}
                    </a>
                  </td>
                  <td>
                    <div className={styles.rowActions}>
                      <button type="button" className={`${styles.btn} ${styles.btnDanger} ${styles.btnSm}`} onClick={() => remove(link.id)}>
                        Удалить
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </>
  );
}
