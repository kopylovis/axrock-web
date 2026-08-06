import type { ElementType, ReactNode } from "react";
import { useReveal } from "~/hooks/useReveal";

interface AnimatedSectionProps {
  children: ReactNode;
  as?: ElementType;
  delay?: number;
  className?: string;
  id?: string;
  ariaLabelledby?: string;
}

export function AnimatedSection({
  children,
  as: Component = "section",
  delay = 0,
  className,
  id,
  ariaLabelledby,
}: AnimatedSectionProps) {
  const { ref, visible } = useReveal<HTMLElement>();

  return (
    <Component
      ref={ref}
      id={id}
      aria-labelledby={ariaLabelledby}
      className={["reveal", className].filter(Boolean).join(" ")}
      data-visible={visible}
      style={delay ? ({ "--reveal-delay": `${delay}ms` } as React.CSSProperties) : undefined}
    >
      {children}
    </Component>
  );
}
