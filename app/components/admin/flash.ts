import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Подтверждение действия, которое само гаснет. Панели быстрого добавления
 * остаются на месте после сохранения, и без такой строки непонятно, прошла
 * запись или форма просто очистилась.
 */
export function useFlash(timeout = 4000) {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const flash = useCallback(
    (text: string) => {
      setMessage(text);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setMessage(null), timeout);
    },
    [timeout],
  );

  return { message, flash };
}
