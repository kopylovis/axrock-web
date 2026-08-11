export type AdminRole = "OWNER" | "ADMIN" | "EDITOR" | "MUSICIAN";

export const ADMIN_ROLE_LABELS: Record<AdminRole, string> = {
  OWNER: "Владелец",
  ADMIN: "Администратор",
  EDITOR: "Редактор",
  MUSICIAN: "Музыкант",
};

export const ADMIN_ROLE_HINTS: Record<AdminRole, string> = {
  OWNER: "Учётная запись из настроек сервера. Её нельзя удалить, роль меняет только она сама.",
  ADMIN: "Полный доступ к контенту, пользователям и сводке расходов.",
  EDITOR: "Доступ ко всему контенту, кроме пользователей и чужих расходов.",
  MUSICIAN:
    "Только мобильное приложение: сет-листы, логистика тура и свои расходы. В эту панель не пускают.",
};

/** Роли, которые можно назначить руками. Владелец задаётся только переменными окружения. */
export const ASSIGNABLE_ROLES: AdminRole[] = ["ADMIN", "EDITOR", "MUSICIAN"];

export function roleLabel(role: string): string {
  return ADMIN_ROLE_LABELS[role as AdminRole] ?? role;
}

export function canManageUsers(role: string): boolean {
  return role === "OWNER" || role === "ADMIN";
}

/** Музыканту веб-панель не нужна: его инструменты — в приложении. */
export function canUseWebAdmin(role: string): boolean {
  return role !== "MUSICIAN";
}
