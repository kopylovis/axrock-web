/**
 * Значки площадок рисуются встроенным SVG, а не картинками: так они красятся
 * в цвет темы через currentColor, не зависят от сторонних CDN (их запрещает CSP
 * на Pages) и не добавляют запросов.
 *
 * Ключ хранится в поле platform у ссылки. Незнакомый ключ — не ошибка:
 * ссылка просто останется текстовой.
 */

interface IconProps {
  className?: string;
}

const ICONS: Record<string, (props: IconProps) => React.ReactElement> = {
  vk: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.9 17.3c-5.4 0-8.7-3.8-8.8-10h2.7c.1 4.6 2.2 6.5 3.8 6.9V7.3h2.6v3.9c1.6-.2 3.2-2 3.8-3.9h2.5c-.4 2.3-2.1 4.1-3.3 4.9 1.2.6 3.1 2.2 3.9 5.1h-2.8c-.6-1.9-2.1-3.4-4.1-3.6v3.6h-.3z" />
    </svg>
  ),
  telegram: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M21.7 4.3 2.9 11.5c-.9.4-.9 1.6.1 1.9l4.7 1.5 1.8 5.5c.2.7 1.1.9 1.6.3l2.5-2.6 4.7 3.5c.7.5 1.6.1 1.8-.7l3-15c.2-.9-.6-1.6-1.4-1.2zM9.6 14.1l8.1-5.4-6.6 6.4-.3 3.1-1.2-4.1z" />
    </svg>
  ),
  youtube: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M22.5 7.2c-.3-1-1-1.7-2-2C18.7 4.8 12 4.8 12 4.8s-6.7 0-8.5.4c-1 .3-1.7 1-2 2C1.1 9 1.1 12 1.1 12s0 3 .4 4.8c.3 1 1 1.7 2 2 1.8.4 8.5.4 8.5.4s6.7 0 8.5-.4c1-.3 1.7-1 2-2 .4-1.8.4-4.8.4-4.8s0-3-.4-4.8zM9.8 15.4V8.6l5.9 3.4-5.9 3.4z" />
    </svg>
  ),
  rutube: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M3 4h13.6c2.4 0 4.4 2 4.4 4.4v1.9c0 2-1.4 3.7-3.3 4.2l3.3 5.5h-3.6l-3-5.3H6.2v5.3H3V4zm3.2 3v4.7h9.8c1 0 1.8-.8 1.8-1.8V8.8c0-1-.8-1.8-1.8-1.8H6.2z" />
    </svg>
  ),
  dzen: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 1c.3 5.1 1 7.5 2.7 9.3 1.8 1.7 4.2 2.4 9.3 2.7-5.1.3-7.5 1-9.3 2.7-1.7 1.8-2.4 4.2-2.7 9.3-.3-5.1-1-7.5-2.7-9.3C7.5 14 5.1 13.3 0 13c5.1-.3 7.5-1 9.3-2.7C11 8.5 11.7 6.1 12 1z" />
    </svg>
  ),
  ok: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.4a4.4 4.4 0 1 0 0 8.8 4.4 4.4 0 0 0 0-8.8zm0 6a1.6 1.6 0 1 1 0-3.2 1.6 1.6 0 0 1 0 3.2zM15.6 13a1.4 1.4 0 0 0-1.9-.4 5 5 0 0 1-3.4 0 1.4 1.4 0 1 0-1.5 2.3c.6.4 1.3.7 2 .8l-2.4 2.4a1.4 1.4 0 1 0 2 2l1.6-1.7 1.6 1.7a1.4 1.4 0 1 0 2-2l-2.4-2.4c.7-.1 1.4-.4 2-.8.6-.4.8-1.3.4-1.9z" />
    </svg>
  ),
  instagram: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  ),
  tiktok: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.5 2h-3v13.2a2.6 2.6 0 1 1-2-2.5V9.6a5.8 5.8 0 1 0 5 5.7V9.1c1 .7 2.2 1.1 3.5 1.2V7.1a4.6 4.6 0 0 1-3.5-5.1z" />
    </svg>
  ),
  spotify: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 1.8a10.2 10.2 0 1 0 0 20.4 10.2 10.2 0 0 0 0-20.4zm4.6 14.8a.8.8 0 0 1-1.1.3c-3-1.8-6.8-2.2-11.2-1.2a.8.8 0 0 1-.4-1.6c4.8-1.1 9-.6 12.4 1.4.4.2.5.7.3 1.1zm1.2-2.9a1 1 0 0 1-1.4.3c-3.4-2.1-8.6-2.7-12.6-1.5a1 1 0 1 1-.6-1.9c4.6-1.4 10.3-.7 14.2 1.7.5.3.6.9.4 1.4zm.1-3c-4.1-2.4-10.8-2.7-14.7-1.5a1.2 1.2 0 1 1-.7-2.3C6.9 5.5 14.3 5.9 19 8.7a1.2 1.2 0 0 1-1.2 2z" />
    </svg>
  ),
  "apple-music": ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19 2.6 8.6 4.8c-.6.1-1 .7-1 1.3v9.7a3.4 3.4 0 1 0 2 3.1V9.1l8.4-1.8v6.1a3.4 3.4 0 1 0 2 3.1V3.9c0-.8-.7-1.4-1-1.3z" />
    </svg>
  ),
  "yandex-music": ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M13.4 6.6v10.8M13.4 6.6c-1.4 3.4-3 5-5 6.4" strokeLinecap="round" />
    </svg>
  ),
  "vk-music": ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M10 15.5V8.8l6-1.3v6.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="8.6" cy="15.6" r="1.8" fill="currentColor" stroke="none" />
      <circle cx="14.6" cy="14.2" r="1.8" fill="currentColor" stroke="none" />
    </svg>
  ),
  zvuk: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M4 10v4M8 7v10M12 4v16M16 8v8M20 11v2" />
    </svg>
  ),
  soundcloud: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M2 13v4h1.3v-4H2zm2.6-1.4V17H6v-5.4H4.6zm2.6-1.3V17h1.4V10.3H7.2zm2.7-1.5V17h1.4V8.8H9.9zM13 6v11h6.6a3.4 3.4 0 0 0 .2-6.8A5.3 5.3 0 0 0 13 6z" />
    </svg>
  ),
  bandcamp: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M2.5 17.5 9 6.5h12.5l-6.5 11H2.5z" />
    </svg>
  ),
  boosty: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M13.6 2 5 13.9h4.6L7.4 22 19 9.6h-5.2L13.6 2z" />
    </svg>
  ),
  facebook: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12z" />
    </svg>
  ),
  x: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.5 3h3.3l-7.2 8.2L22 21h-6.6l-5.2-6.8L4.3 21H1l7.7-8.8L1.4 3H8l4.7 6.2L17.5 3zm-1.2 16h1.8L7.8 4.9H5.9l10.4 14.1z" />
    </svg>
  ),
  website: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9S14.5 18.4 12 21c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" />
    </svg>
  ),
};

/** Список для выбора в админке: ключ и подпись. */
export const SOCIAL_PLATFORMS: Array<{ key: string; label: string }> = [
  { key: "vk", label: "ВКонтакте" },
  { key: "telegram", label: "Telegram" },
  { key: "youtube", label: "YouTube" },
  { key: "rutube", label: "Rutube" },
  { key: "dzen", label: "Дзен" },
  { key: "ok", label: "Одноклассники" },
  { key: "instagram", label: "Instagram" },
  { key: "tiktok", label: "TikTok" },
  { key: "vk-music", label: "VK Музыка" },
  { key: "yandex-music", label: "Яндекс Музыка" },
  { key: "zvuk", label: "Звук" },
  { key: "spotify", label: "Spotify" },
  { key: "apple-music", label: "Apple Music" },
  { key: "soundcloud", label: "SoundCloud" },
  { key: "bandcamp", label: "Bandcamp" },
  { key: "boosty", label: "Boosty" },
  { key: "facebook", label: "Facebook" },
  { key: "x", label: "X" },
  { key: "website", label: "Сайт" },
];

export function hasSocialIcon(platform: string | null | undefined): boolean {
  return Boolean(platform && platform.toLowerCase() in ICONS);
}

export function SocialIcon({
  platform,
  className,
}: {
  platform: string | null | undefined;
  className?: string;
}) {
  const Icon = platform ? ICONS[platform.toLowerCase()] : undefined;
  return Icon ? <Icon className={className} /> : null;
}
