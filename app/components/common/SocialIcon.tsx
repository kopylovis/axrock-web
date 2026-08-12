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
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M7.1 9.1c3.2-.9 6.7-.5 9.6 1" />
      <path d="M7.7 12.4c2.7-.7 5.6-.4 8 1" />
      <path d="M8.3 15.6c2.2-.5 4.5-.2 6.4.9" />
    </svg>
  ),
  "apple-music": ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19 2.6 8.6 4.8c-.6.1-1 .7-1 1.3v9.7a3.4 3.4 0 1 0 2 3.1V9.1l8.4-1.8v6.1a3.4 3.4 0 1 0 2 3.1V3.9c0-.8-.7-1.4-1-1.3z" />
    </svg>
  ),
  // Контуры взяты из официальных знаков; исходные сетки приводятся к 24×24
  // через transform, чтобы не пересчитывать координаты руками и не вносить ошибок.
  "yandex-music": ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <g transform="scale(0.125)">
        <path d="M33.983 16.865a82 82 0 0 1 41.44-15.783v24.744a57.4 57.4 0 1 0 63.681 45.747l20.847-16.914c5.609 15.43 6.383 32.29 2.334 48.252a82.002 82.002 0 0 1-156.724 7.364 82 82 0 0 1 28.422-93.41Z" />
        <path d="M144.615 28.68s-10.808 16.62-14.198 22.005a57.69 57.69 0 0 0-19.735-18.12v50.187c0 15.398-12.482 27.88-27.88 27.88-15.397 0-27.88-12.482-27.88-27.88s12.483-27.88 27.88-27.88a27.75 27.75 0 0 1 15.58 4.756V2.23c18.101 3.482 34.484 13.182 46.233 26.45z" />
      </g>
    </svg>
  ),
  "vk-music": ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <g transform="scale(0.024)">
        <path d="M775,509.75c0-24.710022,20.289978-44.75,45-44.75l0,0c24.7199707,0,45,20.039978,45,44.75v180.499939 C865,714.9699707,844.7199707,735,820,735l0,0c-24.710022,0-45-20.0300293-45-44.750061V509.75z" />
        <path d="M615.0100098,394.75c0-24.710022,20.289978-44.75,45-44.75l0,0c24.7099609,0,45,20.039978,45,44.75 v410.499939c0,24.7200317-20.2900391,44.750061-45,44.750061l0,0c-24.710022,0-45-20.0300293-45-44.750061V394.75z" />
        <path d="M455.0100098,509.75c0-24.710022,20.2850342-44.75,45-44.75l0,0c24.7150269,0,45,20.039978,45,44.75 v180.499939c0,24.710083-20.2849731,44.750061-45,44.750061l0,0c-24.7149658,0-45-20.039978-45-44.750061V509.75z" />
        <path d="M294.9899902,574.75c0-24.7200317,20.2849731-44.75,45-44.75l0,0c24.7149658,0,45,20.0299683,45,44.75 v50.499939c0,24.710083-20.2850342,44.750061-45,44.750061l0,0c-24.7150269,0-45-20.039978-45-44.750061V574.75z" />
        <path d="M134.9900055,574.75c0-24.7200317,20.2849884-44.75,45-44.75l0,0c24.7149658,0,45,20.0299683,45,44.75 v50.499939c0,24.710083-20.2850342,44.750061-45,44.750061l0,0c-24.7150116,0-45-20.039978-45-44.750061V574.75z" />
      </g>
    </svg>
  ),
  zvuk: ({ className }) => (
    <svg className={className} viewBox="0 0 997.7 1000" fill="currentColor" fillRule="evenodd" clipRule="evenodd" aria-hidden="true">
      <path d="M498.9,0c-146.6,0-220.8,19.7-279.8,44.2 c-79.3,32.9-142.2,96-175,175.4C19.7,278.7,0,353.1,0,500 c0,147,19.7,221.3,44.1,280.4 c32.8,79.4,95.8,142.5,175,175.4C278.1,980.3,352.3,1000,498.9,1000 c146.6,0,220.8-19.7,279.8-44.2 c79.3-32.9,142.2-96,175-175.4 c24.4-59.1,44.1-133.5,44.1-280.4c0-147-19.7-221.3-44.1-280.4 c-32.8-79.4-95.8-142.5-175-175.4C719.7,19.7,645.5,0,498.9,0z M268.9,164.6c40.4-16.8,97.2-34.3,230-34.3 c132.9,0,189.7,17.5,230,34.3c47.4,19.7,85,57.4,104.7,104.9 c16.7,40.5,34.2,97.4,34.2,230.5c0,133.1-17.5,190.1-34.2,230.5 c-8.7,21-20.9,40.1-35.9,56.6 c-5.2,5.7-8.4,9.2-10.9,11.3c-1.1-3.6-2.1-9.1-3.5-18 c-46.6-289.9-275-518.7-564.2-565.4 c-8.9-1.4-14.4-2.4-18-3.5c2.1-2.5,5.5-5.7,11.3-10.9 c16.4-15.1,35.5-27.3,56.5-36L268.9,164.6z M198.8,210.5h-0.1 v-0h0L198.8,210.5z M141.6,345.7 c0.8-4.3,1.3-6.6,1.7-8.1c1.6-0.1,4,0.1,8.4,0.4 c271.5,20.5,488.3,237.7,508.8,509.9 c0.3,4.4,0.5,6.8,0.4,8.4c-1.5,0.5-3.8,0.9-8.1,1.8 c-25.1,4.8-56.1,8.5-95.7,10.4c-5,0.2-7.7,0.4-9.6,0.2 c-0.6-2-1-5-1.7-10.2 c-29.6-209.8-195.2-375.8-404.5-405.4 c-5.3-0.7-8.2-1.2-10.2-1.7c-0.1-1.9,0-4.6,0.2-9.6 c1.8-39.8,5.6-70.8,10.4-95.9L141.6,345.7z M133.7,595.9 c-0.5-6.2-0.8-9.8-0.7-12.2c2.3,0.2,5.6,0.8,11.5,2 c134.7,27.9,240.9,134.3,268.8,269.3 c1.2,5.9,1.9,9.2,2,11.6c-2.4,0.1-5.9-0.2-12.1-0.7 c-67.8-6-105.2-18.4-134.3-30.5 c-47.4-19.7-85-57.4-104.7-104.9 c-12.1-29.2-24.4-66.7-30.5-134.7L133.7,595.9z" />
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

/**
 * Подпись площадки по ключу. Ссылки релизов хранят только ключ, а показывать
 * нужно человеческое название; незнакомое значение выводим как есть — так
 * переживают переезд старые записи с подписью вместо ключа.
 */
export function platformLabel(platform: string | null | undefined): string {
  if (!platform) return "";
  const known = SOCIAL_PLATFORMS.find((item) => item.key === platform.toLowerCase());
  return known ? known.label : platform;
}

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
