import { useEffect, useRef } from "react";
import { useLocation } from "react-router";
import { initAnalytics, trackPageView } from "~/utils/analytics";

/**
 * Счётчик и учёт переходов. React Router меняет страницы без перезагрузки
 * документа, поэтому просмотры после первого приходится отправлять вручную.
 */
export function Analytics() {
  const { pathname, search } = useLocation();
  const previous = useRef<string | null>(null);

  useEffect(() => {
    initAnalytics();
  }, []);

  useEffect(() => {
    const url = `${window.location.origin}${pathname}${search}`;
    // Первый просмотр Метрика засчитывает сама при инициализации.
    if (previous.current !== null && previous.current !== url) {
      trackPageView(url, previous.current);
    }
    previous.current = url;
  }, [pathname, search]);

  return null;
}
