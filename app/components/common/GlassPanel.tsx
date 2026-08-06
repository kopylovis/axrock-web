import type { ElementType, ReactNode } from "react";
import styles from "./ui.module.css";

interface GlassPanelProps {
  children: ReactNode;
  as?: ElementType;
  interactive?: boolean;
  className?: string;
}

export function GlassPanel({
  children,
  as: Component = "div",
  interactive = false,
  className,
}: GlassPanelProps) {
  const classNames = [styles.glass, interactive ? styles.glassInteractive : null, className]
    .filter(Boolean)
    .join(" ");

  return <Component className={classNames}>{children}</Component>;
}

export function Pill({ children }: { children: ReactNode }) {
  return <span className={styles.tag}>{children}</span>;
}
