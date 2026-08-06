import { Link } from "react-router";
import type { ReactNode } from "react";
import { isSafeExternalUrl } from "~/utils/url";
import styles from "./ui.module.css";

type Variant = "primary" | "ghost" | "quiet";

const VARIANT_CLASS: Record<Variant, string | undefined> = {
  primary: styles.btnPrimary,
  ghost: styles.btnGhost,
  quiet: styles.btnQuiet,
};

function classes(variant: Variant, fullWidth?: boolean, extra?: string): string {
  return [styles.btn, VARIANT_CLASS[variant], fullWidth ? styles.btnFull : null, extra]
    .filter(Boolean)
    .join(" ");
}

interface ButtonLinkProps {
  to: string;
  children: ReactNode;
  variant?: Variant;
  fullWidth?: boolean;
  className?: string;
}

export function ButtonLink({ to, children, variant = "primary", fullWidth, className }: ButtonLinkProps) {
  return (
    <Link to={to} className={classes(variant, fullWidth, className)}>
      {children}
    </Link>
  );
}

interface ButtonProps {
  children: ReactNode;
  type?: "button" | "submit";
  variant?: Variant;
  fullWidth?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

export function Button({
  children,
  type = "button",
  variant = "primary",
  fullWidth,
  disabled,
  onClick,
  className,
}: ButtonProps) {
  return (
    <button
      type={type}
      className={classes(variant, fullWidth, className)}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function ExternalIcon() {
  return (
    <svg
      className={styles.externalIcon}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <path d="M15 3h6v6M10 14 21 3" />
    </svg>
  );
}

interface ExternalLinkButtonProps {
  href: string;
  children: ReactNode;
  variant?: Variant;
  fullWidth?: boolean;
  /** Дополняет видимый текст для скринридеров: «— откроется на стороннем сайте». */
  hint?: string;
  onNavigate?: () => void;
  className?: string;
}

export function ExternalLinkButton({
  href,
  children,
  variant = "primary",
  fullWidth,
  hint = "Ссылка откроется на стороннем сайте в новой вкладке",
  onNavigate,
  className,
}: ExternalLinkButtonProps) {
  if (!isSafeExternalUrl(href)) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={classes(variant, fullWidth, className)}
      onClick={onNavigate}
    >
      {children}
      <ExternalIcon />
      <span className="visually-hidden">{hint}</span>
    </a>
  );
}
