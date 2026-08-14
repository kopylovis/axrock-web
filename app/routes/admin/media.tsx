import { useEffect, useState } from "react";
import { useRevalidator } from "react-router";
import type { Route } from "./+types/media";
import type { MediaAlbumInput, MediaInput } from "~/api/admin-api";
import type { MediaAlbumDto, MediaItemDto } from "~/api/dto";
import {
  createMedia,
  createMediaAlbum,
  deleteMedia,
  deleteMediaAlbum,
  listMedia,
  listMediaAlbums,
  updateMedia,
  updateMediaAlbum,
} from "~/api/admin-api";
import { parseVideoEmbed } from "~/utils/video-embed";
import { GlassPanel } from "~/components/common/GlassPanel";
import { PageSkeleton } from "~/components/common/PageSkeleton";
import { EmptyState, ErrorState } from "~/components/common/States";
import { BilingualTextField, ImageField, SelectField, TextField } from "~/components/admin/fields";
import type { MediaType, PublicationStatus } from "~/types/content";
import { SortableTh, compareValues, useTableSort } from "~/components/admin/sortable-table";
import { useFlash } from "~/components/admin/flash";
import { formatDate } from "~/utils/format";
import { parseUtcSafe } from "~/utils/admin-format";
import styles from "~/components/admin/admin.module.css";

export async function clientLoader() {
  try {
    // Альбомы необязательны: без них страница работает как обычный список.
    const [items, albums] = await Promise.all([listMedia(), listMediaAlbums().catch(() => [])]);
    return { items, albums, failed: false as const };
  } catch {
    return { items: [], albums: [] as MediaAlbumDto[], failed: true as const };
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

const STATUSES = [
  { value: "PUBLISHED", label: "Опубликовано" },
  { value: "DRAFT", label: "Черновик" },
];

const NO_ALBUM = "";

/**
 * Гасит подсветку, когда список открыли мышью или пальцем. После закрытия он
 * остаётся в фокусе, а :focus-visible у <select> срабатывает и от указателя —
 * рамка так и висит, хотя со списком уже закончили. С клавиатуры подсветка
 * нужна, поэтому метка снимается на первом же нажатии клавиши.
 */
const pointerFocus = {
  onPointerDown(event: React.PointerEvent<HTMLSelectElement>) {
    event.currentTarget.dataset.pointerFocus = "";
  },
  onKeyDown(event: React.KeyboardEvent<HTMLSelectElement>) {
    delete event.currentTarget.dataset.pointerFocus;
  },
  onBlur(event: React.FocusEvent<HTMLSelectElement>) {
    delete event.currentTarget.dataset.pointerFocus;
  },
};

/**
 * Превью строки. Свой файл важнее всего, для ссылки на площадку берётся кадр
 * ролика — иначе в списке не отличить одно видео от другого.
 */
function RowThumb({ item }: { item: MediaItemDto }) {
  const embed = parseVideoEmbed(item.externalUrl);
  const primary = item.previewImageUrl ?? item.fileUrl ?? embed?.posterUrl ?? null;
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [primary]);

  const src = failed ? embed?.posterFallbackUrl ?? null : primary;

  if (!src) {
    return (
      <span className={`${styles.rowThumb} ${styles.rowThumbEmpty}`} aria-hidden="true">
        {item.type === "VIDEO" ? "▶" : "—"}
      </span>
    );
  }

  return (
    <span className={styles.rowThumbBox}>
      <img
        className={styles.rowThumb}
        src={src}
        alt=""
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
      />
      {item.type === "VIDEO" ? (
        <span className={styles.rowThumbPlay} aria-hidden="true">
          ▶
        </span>
      ) : null}
    </span>
  );
}

/**
 * Правка альбома идёт через полный набор полей материала: отдельной ручки
 * «перенести» на сервере нет, а списку она и не нужна.
 */
function mediaPayload(item: MediaItemDto, albumId: number | null): MediaInput {
  return {
    type: item.type,
    title: item.title,
    description: item.description,
    fileUrl: item.fileUrl,
    previewImageUrl: item.previewImageUrl,
    externalUrl: item.externalUrl,
    concertId: item.concertId,
    albumId,
    // В списке приходит только дата публикации — по ней и восстанавливаем статус.
    status: item.publishedAt ? "PUBLISHED" : "DRAFT",
    sortOrder: item.sortOrder,
    titleEn: item.titleEn ?? null,
    descriptionEn: item.descriptionEn ?? null,
  };
}

export default function AdminMedia({ loaderData }: Route.ComponentProps) {
  const { items, albums, failed } = loaderData;
  const { sort, toggle } = useTableSort<"title" | "type" | "album" | "url">({
    key: "title",
    direction: "asc",
  });
  const albumTitle = (id: number | null | undefined) =>
    albums.find((album) => album.id === id)?.title ?? "";
  const sorted = [...items].sort((a, b) => {
    if (sort.key === "title") return compareValues(a.title ?? "", b.title ?? "", sort.direction);
    if (sort.key === "type") return compareValues(a.type, b.type, sort.direction);
    if (sort.key === "album") return compareValues(albumTitle(a.albumId), albumTitle(b.albumId), sort.direction);
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
  const [albumId, setAlbumId] = useState<string>(NO_ALBUM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { message: notice, flash } = useFlash();

  // --- Альбом ---------------------------------------------------------------

  const [editingAlbum, setEditingAlbum] = useState<number | null>(null);
  const [albumName, setAlbumName] = useState("");
  const [albumNameEn, setAlbumNameEn] = useState("");
  const [albumDate, setAlbumDate] = useState("");
  const [albumStatus, setAlbumStatus] = useState<PublicationStatus>("PUBLISHED");
  const [albumSaving, setAlbumSaving] = useState(false);
  const [albumError, setAlbumError] = useState<string | null>(null);
  const { message: albumNotice, flash: flashAlbum } = useFlash();

  const albumOptions = [
    { value: NO_ALBUM, label: "Без альбома" },
    ...albums.map((album) => ({
      value: String(album.id),
      label: album.published === false ? `${album.title} (черновик)` : album.title,
    })),
  ];

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
      albumId: albumId === NO_ALBUM ? null : Number(albumId),
      status,
      sortOrder: 0,
      titleEn: titleEn.trim() || null,
      descriptionEn: null,
    };

    try {
      await createMedia(payload);
      setTitle("");
      setTitleEn("");
      setFileUrl(null);
      setExternalUrl("");
      // Тип, статус и альбом оставляем: материалы обычно загружаются пачкой.
      flash(
        status === "PUBLISHED"
          ? "Материал добавлен — он в списке ниже."
          : "Материал сохранён как черновик — на сайте не отображается.",
      );
      revalidator.revalidate();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Не удалось добавить материал");
    } finally {
      setSaving(false);
    }
  }

  async function moveToAlbum(item: MediaItemDto, value: string) {
    setError(null);
    try {
      await updateMedia(item.id, mediaPayload(item, value === NO_ALBUM ? null : Number(value)));
      revalidator.revalidate();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Не удалось перенести материал");
    }
  }

  async function remove(id: number) {
    if (!window.confirm("Удалить материал?")) return;
    await deleteMedia(id);
    revalidator.revalidate();
  }

  function resetAlbumForm() {
    setEditingAlbum(null);
    setAlbumName("");
    setAlbumNameEn("");
    setAlbumDate("");
    setAlbumStatus("PUBLISHED");
  }

  function startAlbumEdit(album: MediaAlbumDto) {
    setEditingAlbum(album.id);
    setAlbumName(album.title);
    setAlbumNameEn(album.titleEn ?? "");
    setAlbumDate(album.happenedOn ? album.happenedOn.slice(0, 10) : "");
    setAlbumStatus(album.published === false ? "DRAFT" : "PUBLISHED");
    setAlbumError(null);
  }

  async function submitAlbum() {
    if (albumName.trim().length < 2) {
      setAlbumError("Укажите название альбома");
      return;
    }

    setAlbumSaving(true);
    setAlbumError(null);

    const payload: MediaAlbumInput = {
      title: albumName.trim(),
      titleEn: albumNameEn.trim() || null,
      description: null,
      descriptionEn: null,
      // Время не спрашиваем: у подборки важна дата события, а не час.
      happenedOn: albumDate ? `${albumDate}T00:00:00` : null,
      coverImageUrl: null,
      status: albumStatus,
      sortOrder: 0,
    };

    try {
      if (editingAlbum === null) await createMediaAlbum(payload);
      else await updateMediaAlbum(editingAlbum, payload);
      flashAlbum(editingAlbum === null ? "Альбом создан." : "Изменения сохранены.");
      resetAlbumForm();
      revalidator.revalidate();
    } catch (cause) {
      setAlbumError(cause instanceof Error ? cause.message : "Не удалось сохранить альбом");
    } finally {
      setAlbumSaving(false);
    }
  }

  async function removeAlbum(album: MediaAlbumDto) {
    if (!window.confirm(`Удалить альбом «${album.title}»? Материалы останутся в общем списке.`)) {
      return;
    }
    try {
      await deleteMediaAlbum(album.id);
      if (editingAlbum === album.id) resetAlbumForm();
      revalidator.revalidate();
    } catch (cause) {
      setAlbumError(cause instanceof Error ? cause.message : "Не удалось удалить альбом");
    }
  }

  function albumCount(id: number) {
    return items.filter((item) => item.albumId === id).length;
  }

  return (
    <>
      <div className={styles.pageHead}>
        <h1 className={styles.pageTitle}>Медиа</h1>
      </div>

      <GlassPanel className={styles.panel}>
        <h2 className={styles.panelTitle}>
          {editingAlbum === null ? "Добавить альбом" : "Изменить альбом"}
        </h2>

        {albumError ? (
          <p className={styles.alert} role="alert">
            {albumError}
          </p>
        ) : null}
        {albumNotice ? (
          <p className={styles.success} role="status">
            {albumNotice}
          </p>
        ) : null}

        <div className={styles.form}>
          <BilingualTextField
            label="Название"
            value={albumName}
            valueEn={albumNameEn}
            placeholder="Концерт в Москве, октябрь 2026"
            hint="Заголовок раздела на странице «Фото и видео»."
            onChange={setAlbumName}
            onChangeEn={setAlbumNameEn}
          />

          <div className={`${styles.formGrid} ${styles.formGridTwo}`}>
            <TextField
              label="Дата события"
              type="date"
              value={albumDate}
              hint="По ней альбомы идут от свежих к старым. Можно не заполнять."
              onChange={(event) => setAlbumDate(event.target.value)}
            />
            <SelectField
              label="Статус"
              value={albumStatus}
              options={STATUSES}
              onChange={(event) => setAlbumStatus(event.target.value as PublicationStatus)}
            />
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnPrimary}`}
              disabled={albumSaving}
              onClick={submitAlbum}
            >
              {albumSaving ? "Сохраняю…" : editingAlbum === null ? "Создать альбом" : "Сохранить"}
            </button>
            {editingAlbum !== null ? (
              <button
                type="button"
                className={`${styles.btn} ${styles.btnSecondary}`}
                onClick={resetAlbumForm}
              >
                Отмена
              </button>
            ) : null}
          </div>
        </div>

        {albums.length > 0 ? (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Альбом</th>
                  <th>Дата</th>
                  <th>Материалов</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {albums.map((album) => (
                  <tr key={album.id}>
                    <td className={styles.rowTitle}>
                      {album.title}
                      {album.published === false ? (
                        <span className={`${styles.chip} ${styles.chipDraft}`}>Черновик</span>
                      ) : null}
                    </td>
                    <td data-label="Дата">
                      {album.happenedOn
                        ? formatDate(parseUtcSafe(album.happenedOn) ?? new Date(0))
                        : "—"}
                    </td>
                    <td data-label="Материалов">{albumCount(album.id)}</td>
                    <td>
                      <div className={styles.rowActions}>
                        <button
                          type="button"
                          className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`}
                          onClick={() => startAlbumEdit(album)}
                        >
                          Изменить
                        </button>
                        <button
                          type="button"
                          className={`${styles.btn} ${styles.btnDanger} ${styles.btnSm}`}
                          onClick={() => removeAlbum(album)}
                        >
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
      </GlassPanel>

      <GlassPanel className={styles.panel}>
        <h2 className={styles.panelTitle}>Добавить материал</h2>

        {error ? (
          <p className={styles.alert} role="alert">
            {error}
          </p>
        ) : null}
        {notice ? (
          <p className={styles.success} role="status">
            {notice}
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
              options={STATUSES}
            />
          </div>

          <SelectField
            label="Альбом"
            value={albumId}
            options={albumOptions}
            hint="Без альбома материал попадёт в общую ленту под разделами."
            onChange={(event) => setAlbumId(event.target.value)}
          />

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
                <th className={styles.rowThumbCell}>Превью</th>
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
                      label="Альбом"
                      sortKey="album"
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
                  <td className={styles.rowThumbCell}>
                    <RowThumb item={item} />
                  </td>
                  <td className={styles.rowTitle}>{item.title ?? "—"}</td>
                  <td data-label="Тип">
                    {TYPES.find((entry) => entry.value === item.type)?.label ?? item.type}
                  </td>
                  <td data-label="Альбом">
                    {/* Перенос прямо в строке: отдельный редактор материала ради
                        одного поля был бы лишним шагом. */}
                    <select
                      className={styles.rowSelect}
                      value={item.albumId ? String(item.albumId) : NO_ALBUM}
                      onChange={(event) => moveToAlbum(item, event.target.value)}
                      aria-label="Альбом материала"
                      {...pointerFocus}
                    >
                      {albumOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
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
