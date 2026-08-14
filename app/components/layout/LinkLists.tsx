import type { ReleaseLink, SocialLink } from "~/types/content";
import { hasSocialIcon, platformLabel, SocialIcon } from "~/components/common/SocialIcon";
import { isSafeExternalUrl } from "~/utils/url";
import { useLang, useT } from "~/i18n";
import { trackPlatformClick } from "~/utils/analytics";
import styles from "./LinkLists.module.css";

function ArrowIcon() {
  return (
    <svg
      className={styles.icon}
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M7 17 17 7M8 7h9v9" />
    </svg>
  );
}

interface ExternalListProps {
  /** Разводит цели в Метрике: профиль в стриминге и соцсеть — разные события. */
  kind: "music" | "social";
  items: Array<{
    id: number;
    title: string;
    url: string;
    platform?: string | null;
    iconOnly?: boolean;
  }>;
  label: string;
  accent?: boolean;
}

function ExternalList({ items, label, accent, kind }: ExternalListProps) {
  const t = useT();
  const safe = items.filter((item) => isSafeExternalUrl(item.url));
  if (safe.length === 0) return null;

  return (
    <ul className={styles.list} aria-label={label}>
      {safe.map((item) => {
        // Без значка подпись убирать нельзя — от кнопки не осталось бы ничего.
        const compact = Boolean(item.iconOnly) && hasSocialIcon(item.platform);

        return (
          <li key={item.id}>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              title={compact ? item.title : undefined}
              onClick={() => trackPlatformClick(item.platform, kind)}
              className={[
                styles.item,
                accent ? styles.itemAccent : null,
                compact ? styles.itemCompact : null,
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <SocialIcon platform={item.platform} className={styles.brand} />
              {compact ? <span className="visually-hidden">{item.title}</span> : item.title}
              {compact ? null : <ArrowIcon />}
              <span className="visually-hidden">{t.common.externalNote}</span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}

export function SocialLinks({ links }: { links: SocialLink[] }) {
  const t = useT();
  const lang = useLang();

  return (
    <ExternalList
      kind="social"
      label={t.common.socialLinks}
      items={links.map((link) => ({
        id: link.id,
        // Подпись приходит уже на нужном языке; если её не задали — берём
        // название площадки.
        title: link.title || platformLabel(link.platform, lang),
        url: link.url,
        platform: link.platform,
        iconOnly: link.iconOnly,
      }))}
    />
  );
}

export function MusicPlatformLinks({ links }: { links: ReleaseLink[] }) {
  const t = useT();
  const lang = useLang();

  return (
    <ExternalList
      accent
      kind="music"
      label={t.common.musicLinks}
      items={links.map((link) => ({
        id: link.id,
        title: platformLabel(link.platform, lang),
        url: link.url,
        platform: link.platform,
        iconOnly: link.iconOnly,
      }))}
    />
  );
}
