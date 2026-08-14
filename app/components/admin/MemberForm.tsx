import { useState } from "react";
import { Link, useNavigate } from "react-router";
import type { MemberInput } from "~/api/admin-api";
import { createMember, updateMember } from "~/api/admin-api";
import type { BandMemberDto } from "~/api/dto";
import { BilingualField, BilingualTextField, CheckboxField, ImageField, TextField, focusFirstInvalidField } from "./fields";
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
  const [nameEn, setNameEn] = useState(member?.nameEn ?? "");
  const [roleEn, setRoleEn] = useState(member?.roleEn ?? "");
  const [instrumentEn, setInstrumentEn] = useState(member?.instrumentEn ?? "");
  const [biographyEn, setBiographyEn] = useState(member?.biographyEn ?? "");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

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
    setSavedMessage(null);

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
      nameEn: nameEn.trim() || null,
      roleEn: roleEn.trim() || null,
      instrumentEn: instrumentEn.trim() || null,
      biographyEn: biographyEn.trim() || null,
    };

    try {
      // У существующей записи переход никуда не ведёт: адрес тот же, зато
      // страница прыгает наверх и кажется, что ничего не произошло.
      if (member) {
        await updateMember(member.id, payload);
        setSavedMessage("Сохранено. Изменения появятся на сайте после пересборки.");
      } else {
        const saved = await createMember(payload);
        navigate(`/admin/members/${saved.id}`, { replace: true });
      }
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
      {savedMessage ? (
        <p className={styles.success} role="status">
          {savedMessage}
        </p>
      ) : null}

      <div className={styles.form}>
        <div className={`${styles.formGrid} ${styles.formGridTwo}`}>
          <BilingualField label="Имя *" filledEn={nameEn.trim().length > 0}>
            {(lang) =>
              lang === "ru" ? (
                <>
                  <input
                    className={`${styles.input} ${errors.name ? styles.inputInvalid : ""}`}
                    value={name}
                    aria-invalid={errors.name ? true : undefined}
                    onChange={(event) => setName(event.target.value)}
                  />
                  {errors.name ? (
                    <span className={styles.error} role="alert">
                      {errors.name}
                    </span>
                  ) : null}
                </>
              ) : (
                <input
                  className={styles.input}
                  value={nameEn}
                  onChange={(event) => setNameEn(event.target.value)}
                />
              )
            }
          </BilingualField>
          <TextField
            label="Сценическое имя"
            value={stageName}
            onChange={(event) => setStageName(event.target.value)}
          />
        </div>

        <div className={`${styles.formGrid} ${styles.formGridTwo}`}>
          <BilingualField
            label="Роль в группе *"
            hint="Например «Вокал» или «Барабаны»"
            filledEn={roleEn.trim().length > 0}
          >
            {(lang) =>
              lang === "ru" ? (
                <>
                  <input
                    className={`${styles.input} ${errors.role ? styles.inputInvalid : ""}`}
                    value={role}
                    aria-invalid={errors.role ? true : undefined}
                    onChange={(event) => setRole(event.target.value)}
                  />
                  {errors.role ? (
                    <span className={styles.error} role="alert">
                      {errors.role}
                    </span>
                  ) : null}
                </>
              ) : (
                <input
                  className={styles.input}
                  value={roleEn}
                  onChange={(event) => setRoleEn(event.target.value)}
                />
              )
            }
          </BilingualField>
          <BilingualTextField
            label="Инструмент"
            value={instrument}
            valueEn={instrumentEn}
            onChange={setInstrument}
            onChangeEn={setInstrumentEn}
          />
        </div>

        <ImageField label="Фотография" spec="memberPhoto" value={photo} onChange={setPhoto} />

        <BilingualTextField
          label="Краткая биография"
          multiline
          value={biography}
          valueEn={biographyEn}
          onChange={setBiography}
          onChangeEn={setBiographyEn}
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
