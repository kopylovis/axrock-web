import type { ReactNode } from "react";
import styles from "./ui.module.css";

interface SectionHeadingProps {
  title: string;
  eyebrow?: string;
  description?: string;
  action?: ReactNode;
  level?: 1 | 2 | 3;
  id?: string;
}

export function SectionHeading({
  title,
  eyebrow,
  description,
  action,
  level = 2,
  id,
}: SectionHeadingProps) {
  const Heading = `h${level}` as const;

  return (
    <header className={styles.heading}>
      {eyebrow ? <span className={styles.eyebrow}>{eyebrow}</span> : null}
      <div className={styles.headingRow}>
        <Heading id={id} className={styles.headingTitle}>
          {title}
        </Heading>
        {action}
      </div>
      {description ? <p className={styles.headingDescription}>{description}</p> : null}
    </header>
  );
}
