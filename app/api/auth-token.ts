const STORAGE_KEY = "axrock:admin-token";

let memoryToken: string | null = null;

/**
 * Backend расположен на другом домене, поэтому HttpOnly-cookie недоступна:
 * браузер её просто не отправит. Из оставшегося выбран localStorage — он общий
 * для всех вкладок, иначе каждая новая вкладка админки требовала бы входа заново.
 * Расплата — токен живёт до конца сессии (12 часов) даже после закрытия браузера,
 * поэтому «Выйти» действительно важно на общем компьютере.
 */
function storage(): Storage | null {
  try {
    return typeof localStorage === "undefined" ? null : localStorage;
  } catch {
    // Приватный режим или запрет хранилища — работаем только в памяти вкладки.
    return null;
  }
}

export function getAdminToken(): string | null {
  if (memoryToken) return memoryToken;
  memoryToken = storage()?.getItem(STORAGE_KEY) ?? null;
  return memoryToken;
}

export function setAdminToken(token: string | null): void {
  memoryToken = token;
  const store = storage();
  if (!store) return;
  if (token) store.setItem(STORAGE_KEY, token);
  else store.removeItem(STORAGE_KEY);
}

export function clearAdminToken(): void {
  setAdminToken(null);
}
