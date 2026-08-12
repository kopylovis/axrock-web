import { useState } from "react";
import { Link, useRevalidator } from "react-router";
import type { Route } from "./+types/releases-list";
import { deleteRelease, listMusicSections, listReleases, saveMusicSection } from "~/api/admin-api";
import { GlassPanel } from "~/components/common/GlassPanel";
import { ImageField } from "~/components/admin/fields";
import { RELEASE_CATEGORIES, RELEASE_TYPE_LABELS } from "~/utils/release-categories";
import { PageSkeleton } from "~/components/common/PageSkeleton";
import { EmptyState, ErrorState } from "~/components/common/States";
import { RowMenu } from "~/components/admin/RowMenu";
import { StatusChip } from "~/components/admin/fields";
import { formatDate, parseUtcSafe } from "~/utils/admin-format";
import { SortableTh, compareValues, useTableSort } from "~/components/admin/sortable-table";
import styles from "~/components/admin/admin.module.css";

export async function clientLoader() {
  try {
    const [releases, sections] = await Promise.all([
      listReleases(),
      listMusicSections().catch(() => []),
    ]);
    return { releases, sections, failed: false as const };
  } catch {
    return { releases: [], sections: [], failed: true as const };
  }
}

export function HydrateFallback() {
  return <PageSkeleton label="Загрузка релизов" />;
}

export default function AdminReleasesList({ loaderData }: Route.ComponentProps) {
  const { releases, sections, failed } = loaderData;
  // Картинку сохраняем сразу после выбора: отдельной кнопки тут не нужно.
  const [covers, setCovers] = useState<Record<string, string | null>>(
    Object.fromEntries(sections.map((section) => [section.slug, section.image])),
  );
  const [coverError, setCoverError] = useState<string | null>(null);
  const { sort, toggle } = useTableSort<"title" | "status" | "type" | "date" | "tracks">({ key: "date", direction: "desc" });

  // Сортировка идёт по данным, а не по разметке: значения берутся из записи.
  const sorted = [...releases].sort((a, b) => {
      if (sort.key === "title") return compareValues(a.title, b.title, sort.direction);
      if (sort.key === "status") return compareValues(Number(a.published ?? false), Number(b.published ?? false), sort.direction);
      if (sort.key === "type") return compareValues(a.type, b.type, sort.direction);
      if (sort.key === "date") return compareValues(a.releaseDate ?? "", b.releaseDate ?? "", sort.direction);
      if (sort.key === "tracks") return compareValues(a.tracks?.length ?? 0, b.tracks?.length ?? 0, sort.direction);
      return 0;
  });
  const revalidator = useRevalidator();

  async function changeCover(slug: string, image: string | null) {
    setCovers((prev) => ({ ...prev, [slug]: image }));
    setCoverError(null);
    try {
      await saveMusicSection(slug, image);
    } catch (cause) {
      setCoverError(cause instanceof Error ? cause.message : "Не удалось сохранить обложку раздела");
    }
  }

  async function remove(id: number, title: string) {
    if (!window.confirm(`Удалить релиз «${title}»?`)) return;
    await deleteRelease(id);
    revalidator.revalidate();
  }

  return (
    <>
      <div className={styles.pageHead}>
        <h1 className={styles.pageTitle}>Релизы</h1>
        <div className={styles.pageActions}>
          <Link to="/admin/releases/new" className={`${styles.btn} ${styles.btnPrimary}`}>
            + Релиз
          </Link>
        </div>
      </div>

      {failed ? <ErrorState /> : null}

      {!failed && releases.length === 0 ? (
        <EmptyState title="Дискография пуста" description="Добавьте первый релиз." />
      ) : null}

      {releases.length > 0 ? (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <SortableTh
                      label="Название"
                      sortKey="title"
                      sort={sort}
                      onSort={toggle}
                    />
                <SortableTh
                      label="Статус"
                      sortKey="status"
                      sort={sort}
                      onSort={toggle}
                      preferred="desc"
                    />
                <SortableTh
                      label="Тип"
                      sortKey="type"
                      sort={sort}
                      onSort={toggle}
                    />
                <SortableTh
                      label="Дата"
                      sortKey="date"
                      sort={sort}
                      onSort={toggle}
                      preferred="desc"
                    />
                <SortableTh
                      label="Треков"
                      sortKey="tracks"
                      sort={sort}
                      onSort={toggle}
                      preferred="desc"
                    />
                <th />
              </tr>
            </thead>
            <tbody>
              {sorted.map((release) => (
                <tr key={release.id}>
                  <td>
                    <Link to={`/admin/releases/${release.id}`} className={styles.rowTitle}>
                      {release.title}
                    </Link>
                  </td>
                  <td data-label="Статус">
                    <StatusChip
                      status={release.published ? "PUBLISHED" : "DRAFT"}
                      label={release.published ? "Опубликован" : "Снят с публикации"}
                    />
                  </td>
                  <td data-label="Тип">{RELEASE_TYPE_LABELS[release.type]}</td>
                  <td data-label="Дата">
                    {release.releaseDate ? formatDate(parseUtcSafe(release.releaseDate)) : "—"}
                  </td>
                  <td data-label="Треков">{release.tracks?.length ?? 0}</td>
                  <td>
                    <div className={styles.rowActions}>
                      <Link
                        to={`/admin/releases/${release.id}`}
                        className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`}
                      >
                        Изменить
                      </Link>
                      <RowMenu
                        label={`Действия: ${release.title}`}
                        items={[
                          {
                            label: "Удалить",
                            danger: true,
                            onSelect: () => remove(release.id, release.title),
                          },
                        ]}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <GlassPanel className={styles.panel}>
        <h2 className={styles.panelTitle}>Обложки разделов</h2>
        <p className={styles.panelNote}>
          Картинка плитки раздела на странице «Музыка». Если не задать, собирается коллаж из
          обложек релизов раздела.
        </p>

        {coverError ? (
          <p className={styles.alert} role="alert">
            {coverError}
          </p>
        ) : null}

        <div className={`${styles.formGrid} ${styles.formGridTwo}`}>
          {RELEASE_CATEGORIES.map((category) => (
            <ImageField
              key={category.slug}
              label={category.title}
              spec="releaseCover"
              value={covers[category.slug] ?? null}
              hint={
                releases.some((release) => release.type === category.type)
                  ? undefined
                  : "Пока нет релизов — на сайте раздел не показывается."
              }
              onChange={(image) => changeCover(category.slug, image)}
            />
          ))}
        </div>
      </GlassPanel>
    </>
  );
}
