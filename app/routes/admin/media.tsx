import { useState } from "react";
import { useRevalidator } from "react-router";
import type { Route } from "./+types/media";
import type { MediaInput } from "~/api/admin-api";
import { createMedia, deleteMedia, listMedia } from "~/api/admin-api";
import { GlassPanel } from "~/components/common/GlassPanel";
import { PageSkeleton } from "~/components/common/PageSkeleton";
import { EmptyState, ErrorState } from "~/components/common/States";
import { BilingualTextField, ImageField, SelectField, TextField } from "~/components/admin/fields";
import type { MediaType, PublicationStatus } from "~/types/content";
import { SortableTh, compareValues, useTableSort } from "~/components/admin/sortable-table";
import styles from "~/components/admin/admin.module.css";

export async function clientLoader() {
  try {
    return { items: await listMedia(), failed: false as const };
  } catch {
    return { items: [], failed: true as const };
  }
}

export function HydrateFallback() {
  return <PageSkeleton label="Загрузка медиа" />;
}

const TYPES = [
  { value: "PHOTO", label: "Фото" },
  { value: "VIDEO", label: "Видео" },
  { value: "POSTER", label: "Афиша" },
  { value: "COVER", label: "Обложка" },
  { value: "BACKSTAGE", label: "Backstage" },
];

export default function AdminMedia({ loaderData }: Route.ComponentProps) {
  const { items, failed } = loaderData;
  const { sort, toggle } = useTableSort<"title" | "type" | "url">({ key: "title", direction: "asc" });
  const sorted = [...(items)].sort((a, b) => {
    if (sort.key === "title") return compareValues(a.title ?? "", b.title ?? "", sort.direction);
    if (sort.key === "type") return compareValues(a.type, b.type, sort.direction);
    if (sort.key === "url") return compareValues(a.fileUrl ?? a.externalUrl ?? "", b.fileUrl ?? b.externalUrl ?? "", sort.direction);
    return 0;
  });
  const revalidator = useRevalidator();

  const [type, setType] = useState<MediaType>("PHOTO");
  const [title, setTitle] = useState("");
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [externalUrl, setExternalUrl] = useState("");
  const [status, setStatus] = useState<PublicationStatus>("PUBLISHED");
  const [titleEn, setTitleEn] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function add() {
    if (!fileUrl && !externalUrl.trim()) {
      setError("Загрузите файл или укажите внешнюю ссылку");
      return;
    }

    setSaving(true);
    setError(null);

    const payload: MediaInput = {
      type,
      title: title.trim() || null,
      description: null,
      fileUrl,
      previewImageUrl: fileUrl,
      externalUrl: externalUrl.trim() || null,
      concertId: null,
      status,
      sortOrder: 0,
      titleEn: titleEn.trim() || null,
      descriptionEn: null,
    };

    try {
      await createMedia(payload);
      setTitle("");
      setFileUrl(null);
      setExternalUrl("");
      revalidator.revalidate();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Не удалось добавить материал");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: number) {
    if (!window.confirm("Удалить материал?")) return;
    await deleteMedia(id);
    revalidator.revalidate();
  }

  return (
    <>
      <div className={styles.pageHead}>
        <h1 className={styles.pageTitle}>Медиа</h1>
      </div>

      <GlassPanel className={styles.panel}>
        <h2 className={styles.panelTitle}>Добавить материал</h2>

        {error ? (
          <p className={styles.alert} role="alert">
            {error}
          </p>
        ) : null}

        <div className={styles.form}>
          <div className={`${styles.formGrid} ${styles.formGridTwo}`}>
            <SelectField
              label="Тип"
              value={type}
              onChange={(event) => setType(event.target.value as MediaType)}
              options={TYPES}
            />
            <SelectField
              label="Статус"
              value={status}
              onChange={(event) => setStatus(event.target.value as PublicationStatus)}
              options={[
                { value: "PUBLISHED", label: "Опубликовано" },
                { value: "DRAFT", label: "Черновик" },
              ]}
            />
          </div>

          <BilingualTextField
            label="Подпись"
            value={title}
            valueEn={titleEn}
            onChange={setTitle}
            onChangeEn={setTitleEn}
          />

          <ImageField label="Файл" spec="gallery" value={fileUrl} onChange={setFileUrl} />

          <TextField
            label="Внешняя ссылка"
            value={externalUrl}
            placeholder="https://"
            hint="Например ссылка на видео. Используется, если файл не загружается."
            onChange={(event) => setExternalUrl(event.target.value)}
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

      {!failed && items.length === 0 ? (
        <EmptyState title="Медиа пока нет" description="Загрузите фотографии или добавьте видео." />
      ) : null}

      {items.length > 0 ? (
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
                      label="Тип"
                      sortKey="type"
                      sort={sort}
                      onSort={toggle}
                    />
                <SortableTh
                      label="Ссылка"
                      sortKey="url"
                      sort={sort}
                      onSort={toggle}
                    />
                <th />
              </tr>
            </thead>
            <tbody>
              {sorted.map((item) => (
                <tr key={item.id}>
                  <td className={styles.rowTitle}>{item.title ?? "—"}</td>
                  <td data-label="Тип">
                    {TYPES.find((entry) => entry.value === item.type)?.label ?? item.type}
                  </td>
                  <td data-label="Ссылка">
                    {item.fileUrl || item.externalUrl ? (
                      <a
                        href={item.fileUrl ?? item.externalUrl ?? "#"}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Открыть ↗
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>
                    <div className={styles.rowActions}>
                      <button type="button" className={`${styles.btn} ${styles.btnDanger} ${styles.btnSm}`} onClick={() => remove(item.id)}>
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
