import { useLayoutEffect, useRef, useState } from "react";
import styles from "./Marquee.module.css";

interface MarqueeProps {
  items: string[];
  /** Скорость движения в пикселях в секунду — не зависит от длины списка. */
  speed?: number;
}

/**
 * Бегущая строка. Список повторяется столько раз, сколько нужно, чтобы
 * перекрыть ширину экрана: при коротком содержимом двух копий не хватает
 * и в ленте появляется пустота. Сдвиг ровно на одну копию замыкает цикл.
 */
export function Marquee({ items, speed = 55 }: MarqueeProps) {
  const [copies, setCopies] = useState(3);
  const [duration, setDuration] = useState(20);
  const wrapRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    if (items.length === 0) return;

    const measure = () => {
      const wrapWidth = wrapRef.current?.offsetWidth ?? 0;
      const copyWidth = copyRef.current?.offsetWidth ?? 0;
      if (!wrapWidth || !copyWidth) return;

      setCopies(Math.max(2, Math.ceil(wrapWidth / copyWidth) + 1));
      setDuration(copyWidth / speed);
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [items, speed]);

  if (items.length === 0) return null;

  const copy = (key: number, ref?: React.Ref<HTMLSpanElement>) => (
    <span key={key} ref={ref} className={styles.copy}>
      {items.map((item, index) => (
        <span key={`${item}-${index}`} className={styles.item}>
          {item}
          <span className={styles.separator} aria-hidden="true">
            ✦
          </span>
        </span>
      ))}
    </span>
  );

  return (
    <div className={styles.marquee} ref={wrapRef} aria-hidden="true">
      <div
        className={styles.track}
        style={
          {
            "--copies": copies,
            animationDuration: `${duration}s`,
          } as React.CSSProperties
        }
      >
        {Array.from({ length: copies }, (_, index) =>
          copy(index, index === 0 ? copyRef : undefined),
        )}
      </div>
    </div>
  );
}
