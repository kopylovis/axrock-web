export type AdminRole = "OWNER" | "ADMIN" | "EDITOR";

export const ADMIN_ROLE_LABELS: Record<AdminRole, string> = {
  OWNER: "Владелец",
  ADMIN: "Администратор",
  EDITOR: "Редактор",
};

export const ADMIN_ROLE_HINTS: Record<AdminRole, string> = {
  OWNER: "Учётная запись из настроек сервера. Её нельзя удалить, роль меняет только она сама.",
  ADMIN: "Полный доступ к контенту и управление пользователями.",
  EDITOR: "Доступ ко всему контенту, кроме пользователей.",
};

/** Роли, которые можно назначить руками. Владелец задаётся только переменными окружения. */
export const ASSIGNABLE_ROLES: AdminRole[] = ["ADMIN", "EDITOR"];

export function roleLabel(role: string): string {
  return ADMIN_ROLE_LABELS[role as AdminRole] ?? role;
}

export function canManageUsers(role: string): boolean {
  return role === "OWNER" || role === "ADMIN";
}
