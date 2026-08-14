import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useLocalPath, useT } from "~/i18n";
import styles from "./CookieNotice.module.css";

const STORAGE_KEY = "axrock:cookie-notice";

/**
 * Уведомление о cookie и веб-аналитике. Именно уведомление, а не запрос
 * разрешения: счётчик собирает обезличенную статистику, и российская практика
 * требует известить посетителя, а не блокировать сайт до нажатия кнопки.
 */
export function CookieNotice() {
  // Первым проходом ничего не рисуем: разметка страниц готовится заранее,
  // и плашка попала бы в неё даже для тех, кто её уже закрыл.
  const [visible, setVisible] = useState(false);
  const t = useT();
  const lp = useLocalPath();

  useEffect(() => {
    try {
      setVisible(localStorage.getItem(STORAGE_KEY) !== "seen");
    } catch {
      // Приватный режим — покажем один раз за сессию.
      setVisible(true);
    }
  }, []);

  function dismiss() {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, "seen");
    } catch {
      // Не запомнили — не страшно.
    }
  }

  if (!visible) return null;

  return (
    <div className={styles.notice} role="region" aria-label={t.cookies.label}>
      <p className={styles.text}>
        {t.cookies.text}{" "}
        <Link to={lp("/privacy")} className={styles.link}>
          {t.cookies.policy}
        </Link>
        .
      </p>
      <button type="button" className={styles.button} onClick={dismiss}>
        {t.cookies.accept}
      </button>
    </div>
  );
}
