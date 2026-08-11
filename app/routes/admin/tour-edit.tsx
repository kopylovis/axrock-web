import { useState } from "react";
import { Link, useNavigate, useRouteLoaderData } from "react-router";
import type { Route } from "./+types/tour-edit";
import {
  createTour,
  getTour,
  updateTour,
  type LogisticsItemInput,
  type TourDetail,
  type TourStatus,
} from "~/api/admin-api";
import { GlassPanel } from "~/components/common/GlassPanel";
import { PageSkeleton } from "~/components/common/PageSkeleton";
import { ErrorState } from "~/components/common/States";
import { LogisticsEditor } from "~/components/admin/LogisticsEditor";
import { SelectField, TextAreaField, TextField, focusFirstInvalidField } from "~/components/admin/fields";
import { parseUtcSafe, toDateTimeLocalValue } from "~/utils/admin-format";
import { formatDateTime } from "~/utils/format";
import { TOUR_STATUS_OPTIONS } from "~/utils/crew-format";
import { TourReadOnly } from "~/components/admin/TourReadOnly";
import { canEditContent } from "~/utils/roles";
import styles from "~/components/admin/admin.module.css";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  if (params.id === "new") return { tour: null, failed: false as const };
  try {
    return { tour: await getTour(Number(params.id)), failed: false as const };
  } catch {
    return { tour: null, failed: true as const };
  }
}

export function HydrateFallback() {
  return <PageSkeleton label="Загрузка тура" />;
}

export default function AdminTourEdit({ loaderData, params }: Route.ComponentProps) {
  const layout = useRouteLoaderData("layouts/AdminLayout") as { admin?: { role?: string } } | undefined;
  const canEdit = canEditContent(layout?.admin?.role ?? "");

  if (loaderData.failed) return <ErrorState title="Не удалось загрузить тур" />;
  // Музыкант правами на правку не обладает — показываем то же, но на чтение.
  if (!canEdit && loaderData.tour) return <TourReadOnly tour={loaderData.tour} />;
  return <TourForm tour={loaderData.tour} isNew={params.id === "new"} />;
}

function dayValue(value: string | null): string {
  return value ? toDateTimeLocalValue(value, "UTC").slice(0, 10) : "";
}

function TourForm({ tour, isNew }: { tour: TourDetail | null; isNew: boolean }) {
  const navigate = useNavigate();
  const [title, setTitle] = useState(tour?.title ?? "");
  const [status, setStatus] = useState<TourStatus>(tour?.status ?? "ACTIVE");
  const [startsOn, setStartsOn] = useState(dayValue(tour?.startsOn ?? null));
  const [endsOn, setEndsOn] = useState(dayValue(tour?.endsOn ?? null));
  const [notes, setNotes] = useState(tour?.notes ?? "");
  const [logistics, setLogistics] = useState<LogisticsItemInput[]>(
    (tour?.logistics ?? []).map((item) => ({
      happensOn: item.happensOn,
      timeLabel: item.timeLabel ?? "",
      kind: item.kind,
      title: item.title,
      details: item.details ?? "",
      participants: item.participants,
    })),
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  async function submit() {
    if (title.trim().length < 2) {
      setErrors({ title: "Укажите название тура" });
      focusFirstInvalidField();
      return;
    }

    setErrors({});
    setSaving(true);
    setServerError(null);
    setSaved(false);

    const payload = {
      title: title.trim(),
      status,
      startsOn: startsOn ? `${startsOn}T00:00:00` : null,
      endsOn: endsOn ? `${endsOn}T00:00:00` : null,
      notes: notes.trim() || null,
      logistics: logistics.map((item) => ({
        ...item,
        title: item.title.trim(),
        timeLabel: item.timeLabel?.trim() || null,
        details: item.details?.trim() || null,
      })),
    };

    try {
      const result = tour ? await updateTour(tour.id, payload) : await createTour(payload);
      setSaved(true);
      if (isNew) navigate(`/admin/tours/${result.id}`, { replace: true });
    } catch (cause) {
      setServerError(cause instanceof Error ? cause.message : "Не удалось сохранить тур");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className={`${styles.pageHead} ${styles.pageHeadSticky}`}>
        <h1 className={styles.pageTitle}>{tour ? "Тур или концерт" : "Новая запись"}</h1>
        <div className={styles.pageActions}>
          <Link to="/admin/tours" className={`${styles.btn} ${styles.btnSecondary}`}>
            К списку
          </Link>
        </div>
      </div>

      {serverError ? (
        <p className={styles.alert} role="alert">
          {serverError}
        </p>
      ) : null}
      {saved ? (
        <p className={styles.success} role="status">
          Сохранено. Эти данные видны только в панели и мобильном приложении.
        </p>
      ) : null}

      <GlassPanel className={styles.panel}>
        <h2 className={styles.panelTitle}>Общее</h2>
        <div className={styles.form}>
          <TextField
            label="Название"
            value={title}
            required
            error={errors.title}
            placeholder="Улетай — Москва"
            hint="Одиночное мероприятие тоже заводится здесь: у него будет одна дата."
            onChange={(event) => setTitle(event.target.value)}
          />
          <SelectField
            label="Статус"
            value={status}
            options={TOUR_STATUS_OPTIONS}
            hint="Завершённые выезды остаются в списке, но их видно отдельно."
            onChange={(event) => setStatus(event.target.value as TourStatus)}
          />
          <div className={`${styles.formGrid} ${styles.formGridTwo}`}>
            <TextField
              label="Начало"
              type="date"
              value={startsOn}
              onChange={(event) => setStartsOn(event.target.value)}
            />
            <TextField
              label="Окончание"
              type="date"
              value={endsOn}
              onChange={(event) => setEndsOn(event.target.value)}
            />
          </div>
          <TextAreaField
            label="Заметки"
            value={notes}
            rows={3}
            hint="Что угодно для своих: контакты водителя, особенности площадок."
            onChange={(event) => setNotes(event.target.value)}
          />
        </div>
      </GlassPanel>

      {tour && tour.concerts.length > 0 ? (
        <GlassPanel className={styles.panel}>
          <h2 className={styles.panelTitle}>Привязанные концерты</h2>
          <ul className={styles.plainList}>
            {tour.concerts.map((concert) => (
              <li key={concert.id}>
                <Link to={`/admin/concerts/${concert.id}`} className={styles.rowLink}>
                  {concert.city}
                </Link>{" "}
                — {concert.venueName},{" "}
                {formatDateTime(parseUtcSafe(concert.startsAt), concert.timezone)}
              </li>
            ))}
          </ul>
        </GlassPanel>
      ) : null}

      <GlassPanel className={styles.panel}>
        <h2 className={styles.panelTitle}>Логистика</h2>
        <p className={styles.hint}>
          Ведётся на весь выезд целиком — и для тура из нескольких дат, и для одиночного концерта.
        </p>
        <LogisticsEditor items={logistics} onChange={setLogistics} />
      </GlassPanel>

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
    </>
  );
}
