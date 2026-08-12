import { useState } from "react";
import { Link, useNavigate } from "react-router";
import type { MemberInput } from "~/api/admin-api";
import { createMember, updateMember } from "~/api/admin-api";
import type { BandMemberDto } from "~/api/dto";
import { CheckboxField, ImageField, TextAreaField, TextField, focusFirstInvalidField } from "./fields";
import styles from "./admin.module.css";

export function MemberForm({ member }: { member: BandMemberDto | null }) {
  const navigate = useNavigate();

  const [name, setName] = useState(member?.name ?? "");
  const [stageName, setStageName] = useState(member?.stageName ?? "");
  const [role, setRole] = useState(member?.role ?? "");
  const [instrument, setInstrument] = useState(member?.instrument ?? "");
  const [biography, setBiography] = useState(member?.biography ?? "");
  const [photo, setPhoto] = useState<string | null>(member?.photo ?? null);
  const [currentMember, setCurrentMember] = useState(member?.currentMember ?? true);
  const [visible, setVisible] = useState(member?.visible ?? true);
  const [sortOrder, setSortOrder] = useState(String(member?.sortOrder ?? 0));

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  async function submit() {
    const next: Record<string, string> = {};
    if (name.trim().length < 2) next.name = "Укажите имя";
    if (role.trim().length < 2) next.role = "Укажите роль в группе";
    setErrors(next);
    if (Object.keys(next).length > 0) {
      focusFirstInvalidField();
      return;
    }

    setSaving(true);
    setServerError(null);

    const payload: MemberInput = {
      name: name.trim(),
      stageName: stageName.trim() || null,
      role: role.trim(),
      instrument: instrument.trim() || null,
      biography: biography.trim() || null,
      photo,
      currentMember,
      visible,
      sortOrder: Number(sortOrder) || 0,
    };

    try {
      const saved = member ? await updateMember(member.id, payload) : await createMember(payload);
      navigate(`/admin/members/${saved.id}`, { replace: true });
    } catch (cause) {
      setServerError(cause instanceof Error ? cause.message : "Не удалось сохранить участника");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className={`${styles.pageHead} ${styles.pageHeadSticky}`}>
        <h1 className={styles.pageTitle}>{member ? "Редактирование участника" : "Новый участник"}</h1>
        <div className={styles.pageActions}>
          <Link to="/admin/members" className={`${styles.btn} ${styles.btnSecondary}`}>
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
            label="Имя"
            required
            value={name}
            error={errors.name}
            onChange={(event) => setName(event.target.value)}
          />
          <TextField
            label="Сценическое имя"
            value={stageName}
            onChange={(event) => setStageName(event.target.value)}
          />
        </div>

        <div className={`${styles.formGrid} ${styles.formGridTwo}`}>
          <TextField
            label="Роль в группе"
            required
            value={role}
            error={errors.role}
            hint="Например «Вокал» или «Барабаны»"
            onChange={(event) => setRole(event.target.value)}
          />
          <TextField
            label="Инструмент"
            value={instrument}
            onChange={(event) => setInstrument(event.target.value)}
          />
        </div>

        <ImageField label="Фотография" spec="memberPhoto" value={photo} onChange={setPhoto} />

        <TextAreaField
          label="Краткая биография"
          value={biography}
          onChange={(event) => setBiography(event.target.value)}
        />

        <div className={`${styles.formGrid} ${styles.formGridTwo}`}>
          <TextField
            label="Порядок отображения"
            type="number"
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value)}
          />
          <div>
            <CheckboxField
              label="Текущий участник"
              checked={currentMember}
              onChange={(event) => setCurrentMember(event.target.checked)}
            />
            <CheckboxField
              label="Показывать на сайте"
              checked={visible}
              onChange={(event) => setVisible(event.target.checked)}
            />
          </div>
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
