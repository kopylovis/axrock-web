export interface VideoEmbed {
  provider: "youtube" | "vk" | "rutube";
  /** Адрес для <iframe>. Автозапуск включён: окно открывают ради видео. */
  embedUrl: string;
  /** Кадр площадки. Null — площадка не отдаёт его без ключа API. */
  posterUrl: string | null;
  /** Запасной кадр: у YouTube версия 1280×720 есть не у каждого ролика. */
  posterFallbackUrl: string | null;
  title: string;
}

const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtube-nocookie.com",
  "youtu.be",
]);

const VK_HOSTS = new Set(["vk.com", "m.vk.com", "vkvideo.ru", "vk.ru"]);

/** Идентификатор ролика — 11 символов из алфавита base64url. */
const YOUTUBE_ID = /^[\w-]{11}$/;

function youtubeId(url: URL): string | null {
  if (url.hostname === "youtu.be") {
    const id = url.pathname.slice(1).split("/")[0] ?? "";
    return YOUTUBE_ID.test(id) ? id : null;
  }

  const param = url.searchParams.get("v");
  if (param && YOUTUBE_ID.test(param)) return param;

  // /embed/ID, /shorts/ID, /live/ID, /v/ID
  const [kind = "", id = ""] = url.pathname.split("/").filter(Boolean);
  if (["embed", "shorts", "live", "v"].includes(kind) && YOUTUBE_ID.test(id)) return id;

  return null;
}

/** vk.com/video-123_456 и готовая ссылка video_ext.php. */
function vkEmbed(url: URL): string | null {
  if (url.pathname === "/video_ext.php") return `https://vk.com/video_ext.php?${url.searchParams}`;

  const match = /^\/(?:video|clip)(-?\d+)_(\d+)$/.exec(url.pathname);
  if (!match) return null;

  const params = new URLSearchParams({ oid: match[1] ?? "", id: match[2] ?? "", hd: "2" });
  const hash = url.searchParams.get("hash");
  if (hash) params.set("hash", hash);
  return `https://vk.com/video_ext.php?${params}`;
}

function rutubeEmbed(url: URL): string | null {
  const match = /^\/(?:video|play\/embed)\/(?:private\/)?([0-9a-f]{32})\/?$/.exec(url.pathname);
  if (!match) return null;

  const params = new URLSearchParams();
  const secret = url.searchParams.get("p");
  if (secret) params.set("p", secret);
  const query = params.toString();
  return `https://rutube.ru/play/embed/${match[1]}/${query ? `?${query}` : ""}`;
}

/**
 * Разбор ссылки на видеоплощадку. Нужен, чтобы ролик открывался прямо на сайте,
 * а в плитке стоял настоящий кадр, а не серая заглушка.
 */
export function parseVideoEmbed(value: string | null | undefined): VideoEmbed | null {
  if (!value) return null;

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  if (url.protocol !== "https:") return null;

  const host = url.hostname.replace(/^www\./, "");

  if (YOUTUBE_HOSTS.has(host)) {
    const id = youtubeId(url);
    if (!id) return null;
    // nocookie-домен не ставит рекламные cookie до запуска ролика.
    return {
      provider: "youtube",
      embedUrl: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`,
      posterUrl: `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
      posterFallbackUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      title: "YouTube",
    };
  }

  if (VK_HOSTS.has(host)) {
    const embedUrl = vkEmbed(url);
    return embedUrl
      ? { provider: "vk", embedUrl, posterUrl: null, posterFallbackUrl: null, title: "VK Видео" }
      : null;
  }

  if (host === "rutube.ru") {
    const embedUrl = rutubeEmbed(url);
    return embedUrl
      ? { provider: "rutube", embedUrl, posterUrl: null, posterFallbackUrl: null, title: "RUTUBE" }
      : null;
  }

  return null;
}
