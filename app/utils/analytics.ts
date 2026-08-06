type Params = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    gtag?: (command: string, event: string, params?: Params) => void;
    ym?: (id: number, method: string, target: string, params?: Params) => void;
  }
}

/** Аналитика никогда не должна мешать переходу пользователя — все ошибки гасятся. */
export function trackEvent(name: string, params: Params = {}): void {
  if (typeof window === "undefined") return;
  try {
    window.gtag?.("event", name, params);
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
