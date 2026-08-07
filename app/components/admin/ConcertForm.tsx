import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { z } from "zod";
import type { ConcertInput } from "~/api/admin-api";
import { createConcert, updateConcert } from "~/api/admin-api";
import type { ConcertDetailDto } from "~/api/dto";
import type { ConcertEventStatus, PublicationStatus, RichTextDoc } from "~/types/content";
import { fromDateTimeLocalValue, slugify, toDateTimeLocalValue } from "~/utils/admin-format";
import { CheckboxField, ImageField, SelectField, StatusChip, TextAreaField, TextField } from "./fields";
import { CONCERT_STATUS_LABELS } from "~/utils/format";
import { RichTextEditor } from "./RichTextEditor";
import styles from "./admin.module.css";

const httpsUrl = z
  .string()
  .trim()
  .refine((value) => value === "" || /^https:\/\/\S+$/i.test(value), {
    message: "Разрешены только ссылки по https",
  });

const schema = z.object({
  title: z.string().trim().min(3, "Название не короче 3 символов"),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Только латиница в нижнем регистре, цифры и дефисы"),
  city: z.string().trim().min(1, "Укажите город"),
  venueName: z.string().trim().min(1, "Укажите площадку"),
  startsAt: z.string().min(1, "Укажите дату и время"),
  ticketUrl: httpsUrl,
  organizerUrl: httpsUrl,
  mapUrl: httpsUrl,
});

interface ConcertFormProps {
  concert: ConcertDetailDto | null;
}

export function ConcertForm({ concert }: ConcertFormProps) {
  const navigate = useNavigate();
  const timezone = concert?.timezone ?? "Europe/Moscow";

  const [form, setForm] = useState({
    title: concert?.title ?? "",
    slug: concert?.slug ?? "",
    shortDescription: concert?.shortDescription ?? "",
    city: concert?.city ?? "",
    country: concert?.country ?? "Россия",
    venueName: concert?.venueName ?? "",
    venueAddress: concert?.venueAddress ?? "",
    mapUrl: concert?.mapUrl ?? "",
    ageRestriction: concert?.ageRestriction ?? "",
    ticketUrl: concert?.ticketUrl ?? "",
    ticketProvider: concert?.ticketProvider ?? "",
    organizerName: concert?.organizerName ?? "",
    organizerUrl: concert?.organizerUrl ?? "",
    cancellationReason: concert?.cancellationReason ?? "",
    seoTitle: concert?.seoTitle ?? "",
    seoDescription: concert?.seoDescription ?? "",
    timezone,
  });

  const [startsAt, setStartsAt] = useState(toDateTimeLocalValue(concert?.startsAt, timezone));
  const [doorsOpenAt, setDoorsOpenAt] = useState(toDateTimeLocalValue(concert?.doorsOpenAt, timezone));
  const [newStartsAt, setNewStartsAt] = useState(toDateTimeLocalValue(concert?.newStartsAt, timezone));
  const [description, setDescription] = useState<RichTextDoc | null>(concert?.description ?? null);
  const [posterImage, setPosterImage] = useState<string | null>(concert?.posterImage ?? null);
  const [publicationStatus, setPublicationStatus] = useState<PublicationStatus>(
    (concert?.publicationStatus as PublicationStatus | undefined) ?? "DRAFT",
  );
  const [eventStatus, setEventStatus] = useState<ConcertEventStatus>(
    concert?.eventStatus ?? "ANNOUNCED",
  );
  const [featured, setFeatured] = useState(concert?.featured ?? false);
  const [participants, setParticipants] = useState(
    (concert?.participants ?? []).map((item) => ({ name: item.name, url: item.url ?? "" })),
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const update = (key: keyof typeof form) => (value: string) =>
    setForm((previous) => ({ ...previous, [key]: value }));

  async function submit(nextPublication?: PublicationStatus) {
    const effective = nextPublication ?? publicationStatus;
    const parsed = schema.safeParse({
      title: form.title,
      slug: form.slug,
      city: form.city,
      venueName: form.venueName,
      startsAt,
      ticketUrl: form.ticketUrl,
      organizerUrl: form.organizerUrl,
      mapUrl: form.mapUrl,
    });

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

    const payload: ConcertInput = {
      title: form.title.trim(),
      slug: form.slug.trim(),
      shortDescription: form.shortDescription.trim() || null,
      description,
      posterImage,
      publicationStatus: effective,
      eventStatus,
      startsAt: fromDateTimeLocalValue(startsAt, form.timezone) ?? new Date().toISOString(),
      timezone: form.timezone,
      doorsOpenAt: doorsOpenAt ? fromDateTimeLocalValue(doorsOpenAt, form.timezone) : null,
      city: form.city.trim(),
      country: form.country.trim() || "Россия",
      venueName: form.venueName.trim(),
      venueAddress: form.venueAddress.trim() || null,
      mapUrl: form.mapUrl.trim() || null,
      ageRestriction: form.ageRestriction.trim() || null,
      ticketUrl: form.ticketUrl.trim() || null,
      ticketProvider: form.ticketProvider.trim() || null,
      organizerName: form.organizerName.trim() || null,
      organizerUrl: form.organizerUrl.trim() || null,
      newStartsAt: newStartsAt ? fromDateTimeLocalValue(newStartsAt, form.timezone) : null,
      cancellationReason: form.cancellationReason.trim() || null,
      featured,
      seoTitle: form.seoTitle.trim() || null,
      seoDescription: form.seoDescription.trim() || null,
      participants: participants
        .filter((item) => item.name.trim())
        .map((item, index) => ({
          name: item.name.trim(),
          url: item.url.trim() || null,
          sortOrder: index,
        })),
    };

    try {
      const saved = concert ? await updateConcert(concert.id, payload) : await createConcert(payload);
      setPublicationStatus(effective);
      setSavedMessage(
        effective === "PUBLISHED"
          ? "Опубликовано. Чтобы изменения попали на сайт, нажмите «Обновить сайт»."
          : "Сохранено как черновик — на сайте не отображается.",
      );
      navigate(`/admin/concerts/${saved.id}`, { replace: true });
    } catch (cause) {
      setServerError(cause instanceof Error ? cause.message : "Не удалось сохранить концерт");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className={`${styles.pageHead} ${styles.pageHeadSticky}`}>
        <div className={styles.pageHeadStatus}>
          <h1 className={styles.pageTitle}>
            {concert ? "Редактирование концерта" : "Новый концерт"}
          </h1>
          {concert ? (
            <div className={styles.pageHeadChips}>
              <StatusChip status={publicationStatus} />
              {eventStatus !== "ANNOUNCED" ? (
                <span className={`${styles.chip} ${styles.chipArchived}`}>
                  {CONCERT_STATUS_LABELS[eventStatus]}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
        <div className={styles.pageActions}>
          <Link to="/admin/concerts" className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`}>
            К списку
          </Link>
          {concert && publicationStatus === "PUBLISHED" ? (
            <a
              href={`/concerts/${concert.slug}`}
              target="_blank"
              rel="noreferrer"
              className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`}
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
            label="Название события"
            required
            value={form.title}
            error={errors.title}
            onChange={(event) => {
              update("title")(event.target.value);
              if (!concert) update("slug")(slugify(event.target.value));
            }}
          />
          <TextField
            label="Slug"
            required
            value={form.slug}
            error={errors.slug}
            hint="Часть адреса: /concerts/<slug>"
            onChange={(event) => update("slug")(event.target.value)}
          />
        </div>

        <TextAreaField
          label="Краткое описание"
          value={form.shortDescription}
          onChange={(event) => update("shortDescription")(event.target.value)}
        />

        <ImageField label="Афиша" spec="concertPoster" value={posterImage} onChange={setPosterImage} />

        <RichTextEditor label="Полное описание" value={description} onChange={setDescription} />

        <div className={`${styles.formGrid} ${styles.formGridTwo}`}>
          <TextField
            label="Дата и время начала"
            type="datetime-local"
            required
            value={startsAt}
            error={errors.startsAt}
            hint="Локальное время площадки"
            onChange={(event) => setStartsAt(event.target.value)}
          />
          <TextField
            label="Часовой пояс"
            value={form.timezone}
            hint="IANA, например Europe/Moscow"
            onChange={(event) => update("timezone")(event.target.value)}
          />
        </div>

        <div className={`${styles.formGrid} ${styles.formGridTwo}`}>
          <TextField
            label="Открытие дверей"
            type="datetime-local"
            value={doorsOpenAt}
            onChange={(event) => setDoorsOpenAt(event.target.value)}
          />
          <TextField
            label="Возрастное ограничение"
            value={form.ageRestriction}
            hint="Например 16+"
            onChange={(event) => update("ageRestriction")(event.target.value)}
          />
        </div>

        <div className={`${styles.formGrid} ${styles.formGridTwo}`}>
          <TextField
            label="Город"
            required
            value={form.city}
            error={errors.city}
            onChange={(event) => update("city")(event.target.value)}
          />
          <TextField
            label="Страна"
            value={form.country}
            onChange={(event) => update("country")(event.target.value)}
          />
        </div>

        <div className={`${styles.formGrid} ${styles.formGridTwo}`}>
          <TextField
            label="Площадка"
            required
            value={form.venueName}
            error={errors.venueName}
            onChange={(event) => update("venueName")(event.target.value)}
          />
          <TextField
            label="Адрес"
            value={form.venueAddress}
            onChange={(event) => update("venueAddress")(event.target.value)}
          />
        </div>

        <TextField
          label="Ссылка на карту"
          value={form.mapUrl}
          error={errors.mapUrl}
          placeholder="https://"
          onChange={(event) => update("mapUrl")(event.target.value)}
        />

        <div className={`${styles.formGrid} ${styles.formGridTwo}`}>
          <TextField
            label="Ссылка на билеты"
            value={form.ticketUrl}
            error={errors.ticketUrl}
            placeholder="https://"
            hint="Только https. Сайт не продаёт билеты — ссылка ведёт к организатору."
            onChange={(event) => update("ticketUrl")(event.target.value)}
          />
          <TextField
            label="Билетный оператор"
            value={form.ticketProvider}
            hint="Например «Яндекс Афиша»"
            onChange={(event) => update("ticketProvider")(event.target.value)}
          />
        </div>

        <div className={`${styles.formGrid} ${styles.formGridTwo}`}>
          <TextField
            label="Организатор"
            value={form.organizerName}
            onChange={(event) => update("organizerName")(event.target.value)}
          />
          <TextField
            label="Сайт организатора"
            value={form.organizerUrl}
            error={errors.organizerUrl}
            placeholder="https://"
            onChange={(event) => update("organizerUrl")(event.target.value)}
          />
        </div>

        <div className={`${styles.formGrid} ${styles.formGridTwo}`}>
          <SelectField
            label="Статус публикации"
            value={publicationStatus}
            onChange={(event) => setPublicationStatus(event.target.value as PublicationStatus)}
            options={[
              { value: "DRAFT", label: "Черновик" },
              { value: "PUBLISHED", label: "Опубликовано" },
              { value: "ARCHIVED", label: "В архиве" },
            ]}
          />
          <SelectField
            label="Статус события"
            value={eventStatus}
            onChange={(event) => setEventStatus(event.target.value as ConcertEventStatus)}
            options={[
              { value: "ANNOUNCED", label: "Анонсирован" },
              { value: "SOLD_OUT", label: "Билеты проданы" },
              { value: "CANCELLED", label: "Отменён" },
              { value: "POSTPONED", label: "Перенесён" },
              { value: "COMPLETED", label: "Состоялся" },
            ]}
          />
        </div>

        {eventStatus === "POSTPONED" || eventStatus === "CANCELLED" ? (
          <div className={`${styles.formGrid} ${styles.formGridTwo}`}>
            {eventStatus === "POSTPONED" ? (
              <TextField
                label="Новая дата"
                type="datetime-local"
                value={newStartsAt}
                hint="Старая дата сохраняется и показывается зачёркнутой."
                onChange={(event) => setNewStartsAt(event.target.value)}
              />
            ) : null}
            <TextField
              label="Причина"
              value={form.cancellationReason}
              onChange={(event) => update("cancellationReason")(event.target.value)}
            />
          </div>
        ) : null}

        <div className={styles.field}>
          <span className={styles.label}>Участвующие группы</span>
          <div className={styles.repeater}>
            {participants.map((participant, index) => (
              <div key={index} className={`${styles.repeaterRow} ${styles.repeaterRowThree}`}>
                <TextField
                  label="Название"
                  value={participant.name}
                  onChange={(event) =>
                    setParticipants((prev) =>
                      prev.map((item, i) => (i === index ? { ...item, name: event.target.value } : item)),
                    )
                  }
                />
                <TextField
                  label="Ссылка"
                  value={participant.url}
                  placeholder="https://"
                  onChange={(event) =>
                    setParticipants((prev) =>
                      prev.map((item, i) => (i === index ? { ...item, url: event.target.value } : item)),
                    )
                  }
                />
                <button
                  type="button"
                  className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`}
                  onClick={() => setParticipants((prev) => prev.filter((_, i) => i !== index))}
                >
                  Убрать
                </button>
              </div>
            ))}
            <button
              type="button"
              className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`}
              onClick={() => setParticipants((prev) => [...prev, { name: "", url: "" }])}
            >
              + Группа
            </button>
          </div>
        </div>

        <CheckboxField
          label="Выделенный концерт"
          hint="Главная дата тура. В афише получает пометку «Главный концерт» — обычно это большая площадка или премьера программы."
          checked={featured}
          onChange={(event) => setFeatured(event.target.checked)}
        />

        <div className={`${styles.formGrid} ${styles.formGridTwo}`}>
          <TextField
            label="SEO-заголовок"
            hint="Заголовок вкладки браузера и синяя ссылка в результатах поиска. Пусто — берётся обычный заголовок. До 60 символов."
            value={form.seoTitle}
            onChange={(event) => update("seoTitle")(event.target.value)}
          />
          <TextField
            label="SEO-описание"
            hint="Серый текст под ссылкой в выдаче Яндекса и Google. Пусто — берётся описание из настроек сайта. 120–160 символов."
            value={form.seoDescription}
            onChange={(event) => update("seoDescription")(event.target.value)}
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
          <button type="button" className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`} disabled={saving} onClick={() => submit()}>
            Сохранить
          </button>
        </div>
      </div>
    </>
  );
}
