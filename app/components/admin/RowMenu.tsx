import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./RowMenu.module.css";

export interface RowMenuItem {
  label: string;
  onSelect: () => void;
  danger?: boolean;
}

interface RowMenuProps {
  /** Попадает в aria-label кнопки: без него в таблице десяток одинаковых «Действия». */
  label: string;
  items: RowMenuItem[];
}

const ITEM_HEIGHT = 36;
const GAP = 4;

export function RowMenu({ label, items }: RowMenuProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [coords, setCoords] = useState<{ top: number; right: number } | null>(null);
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function close(returnFocus = true) {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  }

  // Таблица прокручивается по горизонтали и обрезала бы меню, поэтому оно
  // рендерится порталом в body и позиционируется по координатам кнопки.
  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const height = items.length * ITEM_HEIGHT + GAP * 2;
    const flipUp = rect.bottom + height + GAP > window.innerHeight;

    setCoords({
      top: flipUp ? rect.top - height - GAP : rect.bottom + GAP,
      right: window.innerWidth - rect.right,
    });
  }, [open, items.length]);

  // Второй проход: кнопка может стоять у левого края (в карточках на телефоне
  // она первая в строке), и меню, выровненное по её правому краю, уходит за
  // экран. Ширину и высоту меню заранее не знаем — измеряем и подвигаем.
  useLayoutEffect(() => {
    if (!open || !menuRef.current) return;

    const rect = menuRef.current.getBoundingClientRect();
    let shiftRight = 0;
    let shiftTop = 0;

    if (rect.left < GAP) shiftRight = rect.left - GAP;
    if (rect.bottom > window.innerHeight - GAP) {
      shiftTop = window.innerHeight - GAP - rect.bottom;
    }
    if (rect.top + shiftTop < GAP) shiftTop = GAP - rect.top;

    if (!shiftRight && !shiftTop) return;
    setCoords((prev) =>
      prev ? { top: prev.top + shiftTop, right: prev.right + shiftRight } : prev,
    );
  }, [open, coords]);

  useEffect(() => {
    if (!open) return;

    itemRefs.current[activeIndex]?.focus();
  }, [open, activeIndex]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
    };

    // При прокрутке меню оторвалось бы от кнопки — проще закрыть.
    const onScrollOrResize = () => setOpen(false);

    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [open]);

  function onMenuKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % items.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (index - 1 + items.length) % items.length);
    } else if (event.key === "Home") {
      event.preventDefault();
      setActiveIndex(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setActiveIndex(items.length - 1);
    } else if (event.key === "Tab") {
      setOpen(false);
    }
  }

  const menu =
    open && coords ? (
      <div
        ref={menuRef}
        id={menuId}
        role="menu"
        aria-label={label}
        className={styles.menu}
        style={{ top: coords.top, right: coords.right }}
        onKeyDown={onMenuKeyDown}
      >
        {items.map((item, index) => (
          <button
            key={item.label}
            ref={(element) => {
              itemRefs.current[index] = element;
            }}
            type="button"
            role="menuitem"
            tabIndex={index === activeIndex ? 0 : -1}
            className={[styles.item, item.danger ? styles.itemDanger : null]
              .filter(Boolean)
              .join(" ")}
            onFocus={() => setActiveIndex(index)}
            onClick={() => {
              close(false);
              item.onSelect();
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
    ) : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => {
          setActiveIndex(0);
          setOpen((value) => !value);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" && !open) {
            event.preventDefault();
            setActiveIndex(0);
            setOpen(true);
          }
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <circle cx="12" cy="5" r="1.8" />
          <circle cx="12" cy="12" r="1.8" />
          <circle cx="12" cy="19" r="1.8" />
        </svg>
      </button>

      {menu && typeof document !== "undefined" ? createPortal(menu, document.body) : null}
    </>
  );
}
