import { rebuildStatus, type RebuildStatus } from "~/api/admin-api";

/**
 * Состояние пересборки общее на всю админку: кнопок на экране две — на обзоре
 * и в сайдбаре — а запрос должен быть один, иначе они показывают разное.
 *
 * В покое опроса нет: таймер заводится, только пока сборка идёт. Из-за этого
 * сборку, запущенную со стороны (например, пушем в репозиторий), панель узнает
 * не сразу — поэтому состояние перечитывается ещё и при возврате на вкладку.
 */

const POLL_MS = 10_000;

let current: RebuildStatus | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;
let inFlight: Promise<RebuildStatus | null> | null = null;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function schedule() {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  if (current?.running && listeners.size > 0) {
    timer = setTimeout(() => void refreshRebuild(), POLL_MS);
  }
}

export function refreshRebuild(): Promise<RebuildStatus | null> {
  // Параллельные вызовы переиспользуют один запрос, а не плодят свои.
  inFlight ??= rebuildStatus()
    .then((next) => {
      current = next;
      emit();
      return next;
    })
    .catch(() => null)
    .finally(() => {
      inFlight = null;
      schedule();
    });

  return inFlight;
}

function onVisible() {
  if (document.visibilityState === "visible") void refreshRebuild();
}

export function subscribeRebuild(listener: () => void): () => void {
  listeners.add(listener);

  if (listeners.size === 1) {
    document.addEventListener("visibilitychange", onVisible);
    void refreshRebuild();
  }

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      document.removeEventListener("visibilitychange", onVisible);
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    }
  };
}

export function getRebuildSnapshot(): RebuildStatus | null {
  return current;
}
