const STORAGE_KEY = "axrock:admin-token";

let memoryToken: string | null = null;

/**
 * Backend расположен на другом домене, поэтому HttpOnly-cookie недоступна.
 * Токен живёт в памяти вкладки; sessionStorage нужен только чтобы пережить перезагрузку
 * страницы — он очищается при закрытии вкладки, в отличие от localStorage.
 */
export function getAdminToken(): string | null {
  if (memoryToken) return memoryToken;
  if (typeof sessionStorage === "undefined") return null;
  memoryToken = sessionStorage.getItem(STORAGE_KEY);
  return memoryToken;
}

export function setAdminToken(token: string | null): void {
  memoryToken = token;
  if (typeof sessionStorage === "undefined") return;
  if (token) sessionStorage.setItem(STORAGE_KEY, token);
  else sessionStorage.removeItem(STORAGE_KEY);
}

export function clearAdminToken(): void {
  setAdminToken(null);
}
