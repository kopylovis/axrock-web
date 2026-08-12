import { useState } from "react";
import { useRevalidator } from "react-router";
import type { Route } from "./+types/social-links";
import { createSocialLink, deleteSocialLink, listSocialLinks, updateSocialLink } from "~/api/admin-api";
import { GlassPanel } from "~/components/common/GlassPanel";
import { PageSkeleton } from "~/components/common/PageSkeleton";
import { EmptyState, ErrorState } from "~/components/common/States";
import { CheckboxField, SelectField, TextField } from "~/components/admin/fields";
import type { LinkKind, SocialLinkDto } from "~/api/dto";
import { SOCIAL_PLATFORMS, SocialIcon, hasSocialIcon } from "~/components/common/SocialIcon";
import { SortableTh, compareValues, useTableSort } from "~/components/admin/sortable-table";
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

const KIND_LABELS: Record<LinkKind, string> = {
  SOCIAL: "Соцсеть",
  MUSIC: "Музыкальная площадка",
};

const KIND_OPTIONS = (Object.keys(KIND_LABELS) as LinkKind[]).map((value) => ({
  value,
  label: KIND_LABELS[value],
}));

const KIND_HINTS: Record<LinkKind, string> = {
  SOCIAL: "Показывается на главной и на странице участников в блоке «Соцсети».",
  MUSIC:
    "Кнопки «Слушать» на главной и в разделе «Музыка». Ссылка должна вести на профиль группы на площадке, а не на конкретный альбом — ссылки альбомов задаются в самом релизе.",
};

/** Старые записи приходят без вида — это соцсети. */
function kindOf(link: { kind?: LinkKind }): LinkKind {
  return link.kind ?? "SOCIAL";
}

export default function AdminSocialLinks({ loaderData }: Route.ComponentProps) {
  const { links, failed } = loaderData;
  const { sort, toggle } = useTableSort<"title" | "platform" | "url" | "kind">({ key: "title", direction: "asc" });

  // Сортировка идёт по данным, а не по разметке: значения берутся из записи.
  const sorted = [...links].sort((a, b) => {
      if (sort.key === "title") return compareValues(a.title, b.title, sort.direction);
      if (sort.key === "platform") return compareValues(a.platform, b.platform, sort.direction);
      if (sort.key === "url") return compareValues(a.url, b.url, sort.direction);
      if (sort.key === "kind") return compareValues(KIND_LABELS[kindOf(a)], KIND_LABELS[kindOf(b)], sort.direction);
      return 0;
  });
  const revalidator = useRevalidator();

  const [kind, setKind] = useState<LinkKind>("SOCIAL");
  const [iconOnly, setIconOnly] = useState(false);
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
        kind,
        iconOnly: iconOnly && hasSocialIcon(platform),
        platform: platform.trim(),
        title: title.trim(),
        url: url.trim(),
        sortOrder: links.length,
        visible: true,
      });
      setPlatform("");
      setTitle("");
      setUrl("");
      setIconOnly(false);
      revalidator.revalidate();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Не удалось добавить ссылку");
    } finally {
      setSaving(false);
    }
  }

  // Правки ссылок в списке нет, поэтому вид кнопки переключаем прямо в строке.
  async function toggleIconOnly(link: SocialLinkDto) {
    setError(null);
    try {
      await updateSocialLink(link.id, {
        kind: kindOf(link),
        platform: link.platform,
        title: link.title,
        url: link.url,
        sortOrder: link.sortOrder,
        visible: link.visible ?? true,
        iconOnly: !link.iconOnly,
      });
      revalidator.revalidate();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Не удалось изменить вид ссылки");
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
        <h1 className={styles.pageTitle}>Ссылки группы</h1>
      </div>

      <GlassPanel className={styles.panel}>
        <h2 className={styles.panelTitle}>Добавить ссылку</h2>

        {error ? (
          <p className={styles.alert} role="alert">
            {error}
          </p>
        ) : null}

        <div className={styles.form}>
          <SelectField
            label="Где показывать"
            value={kind}
            options={KIND_OPTIONS}
            hint={KIND_HINTS[kind]}
            onChange={(event) => setKind(event.target.value as LinkKind)}
          />

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
          <CheckboxField
            label="Только значок, без названия"
            checked={iconOnly}
            disabled={!hasSocialIcon(platform)}
            hint={
              hasSocialIcon(platform)
                ? "Кнопка на сайте покажет один значок — название останется для читалок экрана."
                : "Доступно, когда у площадки есть значок."
            }
            onChange={(event) => setIconOnly(event.target.checked)}
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
        <EmptyState
          title="Ссылок пока нет"
          description="Добавьте профили группы в соцсетях и на музыкальных площадках."
        />
      ) : null}

      {links.length > 0 ? (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <SortableTh
                      label="Подпись"
                      sortKey="title"
                      sort={sort}
                      onSort={toggle}
                    />
                <SortableTh
                      label="Где показывать"
                      sortKey="kind"
                      sort={sort}
                      onSort={toggle}
                    />
                <SortableTh
                      label="Платформа"
                      sortKey="platform"
                      sort={sort}
                      onSort={toggle}
                    />
                <SortableTh
                      label="Адрес"
                      sortKey="url"
                      sort={sort}
                      onSort={toggle}
                    />
                <th />
              </tr>
            </thead>
            <tbody>
              {sorted.map((link) => (
                <tr key={link.id}>
                  <td>
                    <span className={styles.rowWithIcon}>
                      <SocialIcon platform={link.platform} className={styles.iconGlyph} />
                      <span className={styles.rowTitle}>{link.title}</span>
                    </span>
                  </td>
                  <td data-label="Тип">
                    <span
                      className={`${styles.chip} ${
                        kindOf(link) === "MUSIC" ? styles.chipPublished : styles.chipDraft
                      }`}
                    >
                      {KIND_LABELS[kindOf(link)]}
                    </span>
                  </td>
                  <td data-label="Площадка">{link.platform}</td>
                  <td data-label="Ссылка">
                    <a href={link.url} target="_blank" rel="noreferrer">
                      {link.url}
                    </a>
                  </td>
                  <td>
                    <div className={styles.rowActions}>
                      {hasSocialIcon(link.platform) ? (
                        <button
                          type="button"
                          className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`}
                          onClick={() => toggleIconOnly(link)}
                        >
                          {link.iconOnly ? "Показать название" : "Только значок"}
                        </button>
                      ) : null}
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
