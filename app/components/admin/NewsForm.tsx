import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { z } from "zod";
import type { NewsInput } from "~/api/admin-api";
import { createNews, updateNews } from "~/api/admin-api";
import type { NewsCategoryDto, NewsDetailDto } from "~/api/dto";
import type { PublicationStatus, RichTextDoc } from "~/types/content";
import { fromDateTimeLocalValue, slugify, toDateTimeLocalValue } from "~/utils/admin-format";
import { CheckboxField, ImageField, SelectField, StatusChip, TextAreaField, TextField } from "./fields";
import { RichTextEditor } from "./RichTextEditor";
import styles from "./admin.module.css";

const schema = z.object({
  title: z.string().trim().min(3, "Заголовок не короче 3 символов"),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Только латиница в нижнем регистре, цифры и дефисы"),
});

interface NewsFormProps {
  article: NewsDetailDto | null;
  categories: NewsCategoryDto[];
}

export function NewsForm({ article, categories }: NewsFormProps) {
  const navigate = useNavigate();

  const [title, setTitle] = useState(article?.title ?? "");
  const [slug, setSlug] = useState(article?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(article));
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? "");
  const [content, setContent] = useState<RichTextDoc | null>(article?.content ?? null);
  const [coverImage, setCoverImage] = useState<string | null>(article?.coverImage ?? null);
  const [categoryId, setCategoryId] = useState(article?.category?.id ? String(article.category.id) : "");
  const [status, setStatus] = useState<PublicationStatus>(
    (article?.status as PublicationStatus | undefined) ?? "DRAFT",
  );
  const [publishedAt, setPublishedAt] = useState(toDateTimeLocalValue(article?.publishedAt));
  const [featured, setFeatured] = useState(article?.featured ?? false);
  const [seoTitle, setSeoTitle] = useState(article?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(article?.seoDescription ?? "");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  function handleTitle(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  async function submit(nextStatus?: PublicationStatus) {
    const effectiveStatus = nextStatus ?? status;
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

    setErrors({});
    setSaving(true);
    setServerError(null);
    setSavedMessage(null);

    const payload: NewsInput = {
      title: title.trim(),
      slug: slug.trim(),
      excerpt: excerpt.trim() || null,
      content,
      coverImage,
      categoryId: categoryId ? Number(categoryId) : null,
      status: effectiveStatus,
      publishedAt: publishedAt ? fromDateTimeLocalValue(publishedAt) : null,
      featured,
      seoTitle: seoTitle.trim() || null,
      seoDescription: seoDescription.trim() || null,
    };

    try {
      const saved = article ? await updateNews(article.id, payload) : await createNews(payload);
      setStatus(effectiveStatus);
      setSavedMessage(
        effectiveStatus === "PUBLISHED"
          ? "Опубликовано. Чтобы изменения попали на сайт, нажмите «Обновить сайт»."
          : "Сохранено как черновик — на сайте не отображается.",
      );
      navigate(`/admin/news/${saved.id}`, { replace: true });
    } catch (cause) {
      setServerError(cause instanceof Error ? cause.message : "Не удалось сохранить новость");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className={`${styles.pageHead} ${styles.pageHeadSticky}`}>
        <div className={styles.pageHeadStatus}>
          <h1 className={styles.pageTitle}>{article ? "Редактирование новости" : "Новая новость"}</h1>
          {article ? <StatusChip status={status} /> : null}
        </div>
        <div className={styles.pageActions}>
          <Link to="/admin/news" className={`${styles.btn} ${styles.btnSecondary}`}>
            К списку
          </Link>
          {article && status === "PUBLISHED" ? (
            <a
              href={`/news/${article.slug}`}
              target="_blank"
              rel="noreferrer"
              className={`${styles.btn} ${styles.btnSecondary}`}
            >
              Открыть на сайте ↗
            </a>
          ) : null}
        </div>
      </div>

      {serverError ? (
        <p className={styles.alert} role="alert">
          {serverError}
        </p>
      ) : null}
      {savedMessage ? (
        <p className={styles.success} role="status">
          {savedMessage}
        </p>
      ) : null}

      <div className={styles.form}>
        <div className={`${styles.formGrid} ${styles.formGridTwo}`}>
          <TextField
            label="Заголовок"
            required
            value={title}
            error={errors.title}
            onChange={(event) => handleTitle(event.target.value)}
          />
          <TextField
            label="Slug"
            required
            value={slug}
            error={errors.slug}
            hint="Часть адреса: /news/<slug>"
            onChange={(event) => {
              setSlugTouched(true);
              setSlug(event.target.value);
            }}
          />
        </div>

        <TextAreaField
          label="Краткое описание"
          value={excerpt}
          hint="Показывается в карточке и в превью ссылки. Если пусто — возьмётся начало текста."
          onChange={(event) => setExcerpt(event.target.value)}
        />

        <ImageField label="Обложка" spec="newsCover" value={coverImage} onChange={setCoverImage} />

        <RichTextEditor label="Текст новости" value={content} onChange={setContent} />

        <div className={`${styles.formGrid} ${styles.formGridTwo}`}>
          <SelectField
            label="Категория"
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            options={[
              { value: "", label: "Без категории" },
              ...categories.map((category) => ({
                value: String(category.id),
                label: category.name,
              })),
            ]}
          />
          <SelectField
            label="Статус"
            value={status}
            onChange={(event) => setStatus(event.target.value as PublicationStatus)}
            options={[
              { value: "DRAFT", label: "Черновик" },
              { value: "PUBLISHED", label: "Опубликовано" },
              { value: "ARCHIVED", label: "В архиве" },
            ]}
          />
        </div>

        <div className={`${styles.formGrid} ${styles.formGridTwo}`}>
          <TextField
            label="Дата публикации"
            type="datetime-local"
            value={publishedAt}
            hint="Если оставить пустым, дата проставится при публикации."
            onChange={(event) => setPublishedAt(event.target.value)}
          />
          <CheckboxField
            label="Выделенная новость"
            hint="Помечается значком «Важное» и занимает всю ширину в списке новостей."
            checked={featured}
            onChange={(event) => setFeatured(event.target.checked)}
          />
        </div>

        <div className={`${styles.formGrid} ${styles.formGridTwo}`}>
          <TextField
            label="SEO-заголовок"
            hint="Заголовок вкладки браузера и синяя ссылка в результатах поиска. Пусто — берётся обычный заголовок. До 60 символов."
            value={seoTitle}
            onChange={(event) => setSeoTitle(event.target.value)}
          />
          <TextField
            label="SEO-описание"
            hint="Серый текст под ссылкой в выдаче Яндекса и Google. Пусто — берётся описание из настроек сайта. 120–160 символов."
            value={seoDescription}
            onChange={(event) => setSeoDescription(event.target.value)}
          />
        </div>

        <div className={`${styles.formActions} ${styles.formActionsSticky}`}>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnSecondary}`}
            disabled={saving}
            onClick={() => submit("DRAFT")}
          >
            Сохранить черновик
          </button>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnPrimary}`}
            disabled={saving}
            onClick={() => submit("PUBLISHED")}
          >
            {saving ? "Сохраняю…" : "Опубликовать"}
          </button>
          <span className={styles.spacer} />
          <button
            type="button"
            className={`${styles.btn} ${styles.btnSecondary}`}
            disabled={saving}
            onClick={() => submit()}
          >
            Сохранить
          </button>
        </div>
      </div>
    </>
  );
}

