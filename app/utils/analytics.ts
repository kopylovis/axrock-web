import { METRIKA_ID, isLocalHost } from "~/lib/config";


type Params = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    ym?: ((id: number, method: string, target?: unknown, params?: Params) => void) & {
      a?: unknown[];
      l?: number;
    };
  }
}

const SCRIPT_URL = `https://mc.yandex.ru/metrika/tag.js?id=${METRIKA_ID}`;

/** Считаем публичный сайт, но не панель: своя же работа статистику только портит. */
function enabled(): boolean {
  if (typeof window === "undefined" || isLocalHost()) return false;
  return !window.location.pathname.split("/").includes("admin");
}

/**
 * Подключает счётчик. Вызывается один раз: повторные вызовы безвредны — скрипт
 * ищется в разметке по адресу, как в официальном фрагменте Метрики.
 */
export function initAnalytics(): void {
  if (!enabled() || window.ym) return;

  const queue: unknown[] = [];
  const stub = ((...args: unknown[]) => {
    queue.push(args);
  }) as NonNullable<Window["ym"]>;
  stub.a = queue;
  stub.l = Date.now();
  window.ym = stub;

  if (!document.querySelector(`script[src="${SCRIPT_URL}"]`)) {
    const script = document.createElement("script");
    script.src = SCRIPT_URL;
    script.async = true;
    document.head.appendChild(script);
  }

  // Набор из SPA-фрагмента Метрики. ssr — страницы отдаются готовым HTML;
  // referrer и url передаются явно, иначе при переходах внутри сайта счётчик
  // берёт их из состояния документа, которое к тому моменту уже изменилось.
  // ecommerce не подключаем: сайт ничего не продаёт, слой данных был бы пустым.
  window.ym(METRIKA_ID, "init", {
    ssr: true,
    webvisor: true,
    clickmap: true,
    trackLinks: true,
    accurateTrackBounce: true,
    referrer: document.referrer,
    url: window.location.href,
  });
}

/**
 * Просмотр страницы при переходе внутри сайта. Без этого Метрика засчитала бы
 * только первый открытый адрес: дальше React Router меняет страницы сам,
 * не перезагружая документ.
 */
export function trackPageView(url: string, referrer?: string): void {
  if (!enabled()) return;
  try {
    window.ym?.(METRIKA_ID, "hit", url, referrer ? { referer: referrer } : undefined);
  } catch {
    // аналитика не критична
  }
}

/** Достижение цели. Все ошибки гасятся: аналитика не должна мешать переходу. */
export function trackEvent(name: string, params: Params = {}): void {
  if (!enabled()) return;
  try {
    window.ym?.(METRIKA_ID, "reachGoal", name, params);
  } catch {
    // аналитика не критична
  }
}

export function trackTicketClick(concert: {
  id: number;
  slug: string;
  city: string;
  venueName: string;
  ticketProvider: string | null;
}): void {
  trackEvent("concert_ticket_click", {
    concertId: concert.id,
    concertSlug: concert.slug,
    city: concert.city,
    venue: concert.venueName,
    ticketProvider: concert.ticketProvider ?? "unknown",
  });
}

/** Клик по площадке: и по профилю группы, и по ссылке конкретного релиза. */
export function trackPlatformClick(platform: string | null | undefined, kind: "music" | "social"): void {
  trackEvent(kind === "music" ? "music_platform_click" : "social_link_click", {
    platform: platform ?? "unknown",
  });
}

export function trackLanguageSwitch(to: string): void {
  trackEvent("language_switch", { to });
}
