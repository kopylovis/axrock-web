import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { z } from "zod";
import type { ReleaseInput } from "~/api/admin-api";
import { createRelease, updateRelease } from "~/api/admin-api";
import type { ReleaseDetailDto } from "~/api/dto";
import type { ReleaseType } from "~/types/content";
import { fromDateInputValue, slugify, toDateInputValue } from "~/utils/admin-format";
import { CheckboxField, ImageField, SelectField, TextAreaField, TextField } from "./fields";
import styles from "./admin.module.css";

const schema = z.object({
  title: z.string().trim().min(1, "Укажите название"),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Только латиница в нижнем регистре, цифры и дефисы"),
});

interface Track {
  title: string;
  duration: string;
  trackNumber: number;
}

interface PlatformLink {
  platform: string;
  url: string;
}

export function ReleaseForm({ release }: { release: ReleaseDetailDto | null }) {
  const navigate = useNavigate();

  const [title, setTitle] = useState(release?.title ?? "");
  const [slug, setSlug] = useState(release?.slug ?? "");
  const [type, setType] = useState<ReleaseType>(release?.type ?? "ALBUM");
  const [coverImage, setCoverImage] = useState<string | null>(release?.coverImage ?? null);
  const [description, setDescription] = useState(release?.description ?? "");
  const [releaseDate, setReleaseDate] = useState(toDateInputValue(release?.releaseDate));
  const [published, setPublished] = useState(false);
  const [sortOrder, setSortOrder] = useState(String(release?.sortOrder ?? 0));
  const [tracks, setTracks] = useState<Track[]>(
    (release?.tracks ?? []).map((track) => ({
      title: track.title,
      duration: track.duration ?? "",
      trackNumber: track.trackNumber,
    })),
  );
  const [links, setLinks] = useState<PlatformLink[]>(
    (release?.links ?? []).map((link) => ({ platform: link.platform, url: link.url })),
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  async function submit() {
    const parsed = schema.safeParse({ title, slug });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string") next[key] = issue.message;
      }
      setErrors(next);
      return;
    }

    const badLink = links.find((link) => link.url && !/^https:\/\/\S+$/i.test(link.url));
    if (badLink) {
      setErrors({ links: "Ссылки на площадки принимаются только по https" });
      return;
    }

    setErrors({});
    setSaving(true);
    setServerError(null);

    const payload: ReleaseInput = {
      title: title.trim(),
      slug: slug.trim(),
      type,
      coverImage,
      description: description.trim() || null,
      releaseDate: releaseDate ? fromDateInputValue(releaseDate) : null,
      published,
      sortOrder: Number(sortOrder) || 0,
      seoTitle: null,
      seoDescription: null,
      tracks: tracks
        .filter((track) => track.title.trim())
        .map((track, index) => ({
          title: track.title.trim(),
          duration: track.duration.trim() || null,
          trackNumber: track.trackNumber || index + 1,
        })),
      links: links
        .filter((link) => link.platform.trim() && link.url.trim())
        .map((link, index) => ({
          platform: link.platform.trim(),
          url: link.url.trim(),
          sortOrder: index,
        })),
    };

    try {
      const saved = release ? await updateRelease(release.id, payload) : await createRelease(payload);
      navigate(`/admin/releases/${saved.id}`, { replace: true });
    } catch (cause) {
      setServerError(cause instanceof Error ? cause.message : "Не удалось сохранить релиз");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className={styles.pageHead}>
        <h1 className={styles.pageTitle}>{release ? "Редактирование релиза" : "Новый релиз"}</h1>
        <div className={styles.pageActions}>
          <Link to="/admin/releases" className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`}>
            К списку
          </Link>
        </div>
      </div>

      {serverError ? (
        <p className={styles.alert} role="alert">
          {serverError}
        </p>
      ) : null}

      <div className={styles.form}>
        <div className={`${styles.formGrid} ${styles.formGridTwo}`}>
          <TextField
            label="Название"
            required
            value={title}
            error={errors.title}
            onChange={(event) => {
              setTitle(event.target.value);
              if (!release) setSlug(slugify(event.target.value));
            }}
          />
          <TextField
            label="Slug"
            required
            value={slug}
            error={errors.slug}
            onChange={(event) => setSlug(event.target.value)}
          />
        </div>

        <div className={`${styles.formGrid} ${styles.formGridTwo}`}>
          <SelectField
            label="Тип релиза"
            value={type}
            onChange={(event) => setType(event.target.value as ReleaseType)}
            options={[
              { value: "ALBUM", label: "Альбом" },
              { value: "EP", label: "EP" },
              { value: "SINGLE", label: "Сингл" },
              { value: "LIVE", label: "Концертный" },
              { value: "COMPILATION", label: "Сборник" },
            ]}
          />
          <TextField
            label="Дата релиза"
            type="date"
            value={releaseDate}
            onChange={(event) => setReleaseDate(event.target.value)}
          />
        </div>

        <ImageField label="Обложка" spec="releaseCover" value={coverImage} onChange={setCoverImage} />

        <TextAreaField
          label="Описание"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />

        <div className={styles.field}>
          <span className={styles.label}>Треклист</span>
          <div className={styles.repeater}>
            {tracks.map((track, index) => (
              <div key={index} className={`${styles.repeaterRow} ${styles.repeaterRowFour}`}>
                <TextField
                  label="№"
                  type="number"
                  value={String(track.trackNumber)}
                  onChange={(event) =>
                    setTracks((prev) =>
                      prev.map((item, i) =>
                        i === index ? { ...item, trackNumber: Number(event.target.value) || 0 } : item,
                      ),
                    )
                  }
                />
                <TextField
                  label="Название трека"
                  value={track.title}
                  onChange={(event) =>
                    setTracks((prev) =>
                      prev.map((item, i) => (i === index ? { ...item, title: event.target.value } : item)),
                    )
                  }
                />
                <TextField
                  label="Длительность"
                  value={track.duration}
                  placeholder="3:45"
                  onChange={(event) =>
                    setTracks((prev) =>
                      prev.map((item, i) => (i === index ? { ...item, duration: event.target.value } : item)),
                    )
                  }
                />
                <button
                  type="button"
                  className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`}
                  onClick={() => setTracks((prev) => prev.filter((_, i) => i !== index))}
                >
                  Убрать
                </button>
              </div>
            ))}
            <button
              type="button"
              className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`}
              onClick={() =>
                setTracks((prev) => [...prev, { title: "", duration: "", trackNumber: prev.length + 1 }])
              }
            >
              + Трек
            </button>
          </div>
        </div>

        <div className={styles.field}>
          <span className={styles.label}>Ссылки на площадки</span>
          {errors.links ? (
            <span className={styles.error} role="alert">
              {errors.links}
            </span>
          ) : null}
          <div className={styles.repeater}>
            {links.map((link, index) => (
              <div key={index} className={`${styles.repeaterRow} ${styles.repeaterRowThree}`}>
                <TextField
                  label="Площадка"
                  value={link.platform}
                  placeholder="Яндекс Музыка"
                  onChange={(event) =>
                    setLinks((prev) =>
                      prev.map((item, i) => (i === index ? { ...item, platform: event.target.value } : item)),
                    )
                  }
                />
                <TextField
                  label="Ссылка"
                  value={link.url}
                  placeholder="https://"
                  onChange={(event) =>
                    setLinks((prev) =>
                      prev.map((item, i) => (i === index ? { ...item, url: event.target.value } : item)),
                    )
                  }
                />
                <button
                  type="button"
                  className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`}
                  onClick={() => setLinks((prev) => prev.filter((_, i) => i !== index))}
                >
                  Убрать
                </button>
              </div>
            ))}
            <button
              type="button"
              className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`}
              onClick={() => setLinks((prev) => [...prev, { platform: "", url: "" }])}
            >
              + Площадка
            </button>
          </div>
        </div>

        <div className={`${styles.formGrid} ${styles.formGridTwo}`}>
          <TextField
            label="Порядок отображения"
            type="number"
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value)}
          />
          <CheckboxField
            label="Опубликован"
            checked={published}
            onChange={(event) => setPublished(event.target.checked)}
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
    </>
  );
}
