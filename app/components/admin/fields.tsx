import { useId, useRef, useState, type ReactNode } from "react";
import { uploadImage } from "~/api/admin-api";
import { specSize, type ImageSpecKey } from "~/components/common/ImagePlaceholder";
import { ImageCropper } from "./ImageCropper";
import { MediaPicker } from "./MediaPicker";
import styles from "./admin.module.css";

/**
 * После неудачной проверки уводит к первому проблемному полю: в длинной форме
 * ошибка часто оказывается далеко за экраном, и кажется, что кнопка не сработала.
 * Ищем по aria-invalid — его проставляют все поля, отдельная разметка не нужна.
 */
export function focusFirstInvalidField() {
  requestAnimationFrame(() => {
    const target = document.querySelector<HTMLElement>('[aria-invalid="true"]');
    if (!target) return;

    // Поле может лежать в свёрнутом разделе — сначала раскрываем его.
    for (let node = target.closest("details"); node; node = node.parentElement?.closest("details") ?? null) {
      node.open = true;
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ block: "center", behavior: reduced ? "auto" : "smooth" });
    target.focus({ preventScroll: true });
  });
}

/**
 * Раздел длинной формы. На телефоне разделы закрыты — иначе форму концерта
 * приходится листать целиком, чтобы добраться до нужного поля. Проверка формы
 * раскрывает всё обратно: спрятанное поле с ошибкой невозможно ни увидеть,
 * ни исправить.
 */
export function FormSection({
  title,
  openOnMobile = false,
  children,
}: {
  title: string;
  openOnMobile?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(
    () =>
      openOnMobile ||
      typeof window === "undefined" ||
      !window.matchMedia("(max-width: 759.98px)").matches,
  );

  return (
    <details
      className={styles.section}
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      <summary className={styles.sectionSummary}>{title}</summary>
      <div className={styles.sectionBody}>{children}</div>
    </details>
  );
}

interface BaseFieldProps {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: (id: string, invalid: boolean) => ReactNode;
}

export function Field({ label, hint, error, required, children }: BaseFieldProps) {
  const id = useId();
  const invalid = Boolean(error);

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
        {required ? " *" : ""}
      </label>
      {children(id, invalid)}
      {hint ? <span className={styles.hint}>{hint}</span> : null}
      {error ? (
        <span className={styles.error} role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}

/**
 * Оболочка двуязычного поля: над вводом стоит переключатель RU/EN. Английский
 * перевод необязателен — где его нет, сайт показывает русский текст, поэтому
 * заполненность EN помечается точкой, чтобы не открывать вкладку ради проверки.
 */
export function BilingualField({
  label,
  hint,
  filledEn,
  children,
}: {
  label: string;
  hint?: string;
  filledEn: boolean;
  children: (lang: "ru" | "en") => ReactNode;
}) {
  const [lang, setLang] = useState<"ru" | "en">("ru");

  return (
    <div className={styles.field}>
      <div className={styles.langRow}>
        <span className={styles.label}>{label}</span>
        <div className={styles.langTabs}>
          {(["ru", "en"] as const).map((value) => (
            <button
              key={value}
              type="button"
              className={[styles.langTab, lang === value ? styles.langTabActive : null]
                .filter(Boolean)
                .join(" ")}
              aria-pressed={lang === value}
              onClick={() => setLang(value)}
            >
              {value.toUpperCase()}
              {value === "en" && filledEn ? (
                <span className={styles.langDot} aria-label="перевод заполнен" />
              ) : null}
            </button>
          ))}
        </div>
      </div>

      {children(lang)}
      {hint ? <span className={styles.hint}>{hint}</span> : null}
    </div>
  );
}

export function BilingualTextField({
  label,
  hint,
  value,
  valueEn,
  onChange,
  onChangeEn,
  multiline = false,
  rows,
  placeholder,
}: {
  label: string;
  hint?: string;
  value: string;
  valueEn: string;
  onChange: (value: string) => void;
  onChangeEn: (value: string) => void;
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <BilingualField label={label} hint={hint} filledEn={valueEn.trim().length > 0}>
      {(lang) => {
        const current = lang === "ru" ? value : valueEn;
        const update = lang === "ru" ? onChange : onChangeEn;

        return multiline ? (
          <textarea
            className={styles.textarea}
            value={current}
            rows={rows}
            placeholder={placeholder}
            onChange={(event) => update(event.target.value)}
          />
        ) : (
          <input
            className={styles.input}
            value={current}
            placeholder={placeholder}
            onChange={(event) => update(event.target.value)}
          />
        );
      }}
    </BilingualField>
  );
}

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function TextField({
  label,
  hint,
  error,
  required,
  ...input
}: { label: string; hint?: string; error?: string } & InputProps) {
  return (
    <Field label={label} hint={hint} error={error} required={required}>
      {(id, invalid) => (
        <input
          {...input}
          id={id}
          className={`${styles.input} ${invalid ? styles.inputInvalid : ""}`}
          aria-invalid={invalid || undefined}
        />
      )}
    </Field>
  );
}

export function TextAreaField({
  label,
  hint,
  error,
  required,
  ...textarea
}: { label: string; hint?: string; error?: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <Field label={label} hint={hint} error={error} required={required}>
      {(id, invalid) => (
        <textarea
          {...textarea}
          id={id}
          className={`${styles.textarea} ${invalid ? styles.inputInvalid : ""}`}
          aria-invalid={invalid || undefined}
        />
      )}
    </Field>
  );
}

export function SelectField({
  label,
  hint,
  error,
  required,
  options,
  ...select
}: {
  label: string;
  hint?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <Field label={label} hint={hint} error={error} required={required}>
      {(id, invalid) => (
        <select
          {...select}
          id={id}
          className={`${styles.select} ${invalid ? styles.inputInvalid : ""}`}
          aria-invalid={invalid || undefined}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </Field>
  );
}

export function CheckboxField({
  label,
  hint,
  ...input
}: { label: string; hint?: string } & InputProps) {
  const id = useId();
  return (
    <div className={styles.field}>
      <div className={styles.checkboxRow}>
        <input {...input} id={id} type="checkbox" className={styles.checkbox} />
        <label className={styles.label} htmlFor={id}>
          {label}
        </label>
      </div>
      {hint ? <span className={styles.hint}>{hint}</span> : null}
    </div>
  );
}

interface ImageFieldProps {
  label: string;
  value: string | null;
  onChange: (url: string | null) => void;
  /** Определяет пропорцию рамки кадрирования и итоговый размер файла. */
  spec: ImageSpecKey;
  hint?: string;
}

export function ImageField({ label, value, onChange, spec, hint }: ImageFieldProps) {
  const id = useId();
  const [pending, setPending] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setError(null);
    setPending(file);
  }

  async function upload(cropped: File) {
    setPending(null);
    setUploading(true);
    try {
      const result = await uploadImage(cropped);
      onChange(result.url);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Не удалось загрузить изображение");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>

      <div className={styles.imageField}>
        {value ? <img src={value} alt="" className={styles.imagePreview} /> : null}

        <div className={styles.imageActions}>
          {/* Скрыт: диалог открывается из окна выбора, чтобы не было двух разных кнопок. */}
          <input
            id={id}
            ref={fileInput}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            onChange={handleFile}
            disabled={uploading}
            hidden
          />
          <button
            type="button"
            className={`${styles.btn} ${styles.btnSecondary}`}
            onClick={() => setPicking(true)}
            disabled={uploading}
          >
            {value ? "Заменить" : "Выбрать изображение"}
          </button>
          {value ? (
            <button
              type="button"
              className={`${styles.btn} ${styles.btnDanger}`}
              onClick={() => onChange(null)}
            >
              Убрать
            </button>
          ) : null}
        </div>

        <span className={styles.hint}>
          {hint ? `${hint} ` : ""}
          Итоговый размер {specSize(spec)} — область выбирается при загрузке.
        </span>

        {uploading ? <span className={styles.hint}>Загрузка…</span> : null}
        {error ? (
          <span className={styles.error} role="alert">
            {error}
          </span>
        ) : null}
      </div>

      {picking ? (
        <MediaPicker
          accept={(item) => item.mimeType.startsWith("image/") && item.mimeType !== "image/svg+xml"}
          selected={value}
          onSelect={(url) => {
            setPicking(false);
            onChange(url);
          }}
          onUploadNew={() => {
            setPicking(false);
            fileInput.current?.click();
          }}
          onClose={() => setPicking(false)}
        />
      ) : null}

      {pending ? (
        <ImageCropper
          file={pending}
          spec={spec}
          onCancel={() => setPending(null)}
          onConfirm={upload}
        />
      ) : null}
    </div>
  );
}

interface VectorFieldProps {
  label: string;
  value: string | null;
  onChange: (url: string | null) => void;
  hint?: string;
}

/** Логотип загружается как есть: вектор кадрировать нельзя и не нужно. */
export function VectorField({ label, value, onChange, hint }: VectorFieldProps) {
  const id = useId();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      const result = await uploadImage(file);
      onChange(result.url);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Не удалось загрузить файл");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>

      <div className={styles.imageField}>
        {value ? (
          <div className={styles.logoPreviewBox}>
            <img src={value} alt="" className={styles.logoPreview} />
          </div>
        ) : null}

        <div className={styles.imageActions}>
          <input
            id={id}
            ref={fileInput}
            type="file"
            accept="image/svg+xml,image/png"
            onChange={handleFile}
            disabled={uploading}
            hidden
          />
          <button
            type="button"
            className={`${styles.btn} ${styles.btnSecondary}`}
            onClick={() => setPicking(true)}
            disabled={uploading}
          >
            {value ? "Заменить" : "Выбрать файл"}
          </button>
          {value ? (
            <button
              type="button"
              className={`${styles.btn} ${styles.btnDanger}`}
              onClick={() => onChange(null)}
            >
              Убрать
            </button>
          ) : null}
        </div>

        <span className={styles.hint}>
          {hint ? `${hint} ` : ""}SVG или PNG с прозрачным фоном. Кадрирование не применяется.
        </span>

        {uploading ? <span className={styles.hint}>Загрузка…</span> : null}
        {error ? (
          <span className={styles.error} role="alert">
            {error}
          </span>
        ) : null}
      </div>
      {picking ? (
        <MediaPicker
          accept={(item) => item.mimeType === "image/svg+xml" || item.mimeType === "image/png"}
          selected={value}
          onSelect={(url) => {
            setPicking(false);
            onChange(url);
          }}
          onUploadNew={() => {
            setPicking(false);
            fileInput.current?.click();
          }}
          onClose={() => setPicking(false)}
        />
      ) : null}
    </div>
  );
}

export function StatusChip({ status, label }: { status: string; label?: string }) {
  const className =
    status === "PUBLISHED"
      ? styles.chipPublished
      : status === "DRAFT"
        ? styles.chipDraft
        : styles.chipArchived;

  // Слово подставляют разделы, где «черновик» звучит не к месту — например релизы.
  const text =
    label ?? (status === "PUBLISHED" ? "Опубликовано" : status === "DRAFT" ? "Черновик" : "В архиве");

  return <span className={`${styles.chip} ${className}`}>{text}</span>;
}
