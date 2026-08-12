import type { Config } from "@react-router/dev/config";
import { PRERENDER_PLACEHOLDER } from "./app/lib/prerender";
import { RELEASE_CATEGORIES } from "./app/utils/release-categories";

const STATIC_PATHS = [
  "/",
  "/about",
  "/news",
  "/concerts",
  "/music",
  "/media",
  "/contacts",
  "/privacy",
  "/personal-data-consent",
];

const API_BASE_URL = process.env.VITE_API_BASE_URL ?? "https://api.monoroh.com/api/axrock";

/**
 * Разделы дискографии живут в коде, но собирать имеет смысл только те, где есть
 * релизы: пустой раздел не нужен ни посетителю, ни поисковику.
 */
async function collectMusicCategoryPaths(): Promise<string[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/public/releases`, {
      signal: AbortSignal.timeout(20_000),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const releases = (await response.json()) as Array<{ type: string }>;
    const types = new Set(releases.map((release) => release.type));

    return RELEASE_CATEGORIES.filter((category) => types.has(category.type)).map(
      (category) => `/music/${category.slug}`,
    );
  } catch {
    return [];
  }
}

/**
 * GitHub Pages отдаёт только статику, поэтому публичные страницы собираются в HTML
 * на этапе сборки. Список slug'ов приходит из backend.
 */
async function collectPrerenderPaths(): Promise<string[]> {
  let entries: Array<{ path: string }>;

  try {
    const response = await fetch(`${API_BASE_URL}/public/sitemap`, {
      signal: AbortSignal.timeout(20_000),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    entries = (await response.json()) as Array<{ path: string }>;
  } catch (cause) {
    throw new Error(
      `Не удалось получить список страниц из backend (${API_BASE_URL}/public/sitemap): ` +
        `${cause instanceof Error ? cause.message : cause}. ` +
        `Пререндер публичных страниц невозможен — проверьте, что Ktor доступен, и повторите сборку.`,
    );
  }

  const dynamic = entries.map((entry) => entry.path).filter((path) => path.startsWith("/"));
  dynamic.push(...(await collectMusicCategoryPaths()));

  for (const prefix of ["/news/", "/concerts/", "/music/"]) {
    if (!dynamic.some((path) => path.startsWith(prefix))) {
      dynamic.push(`${prefix}${PRERENDER_PLACEHOLDER}`);
    }
  }

  return [...new Set([...STATIC_PATHS, ...dynamic])];
}

export default {
  ssr: false,
  basename: process.env.VITE_BASE_PATH ?? "/",
  prerender: collectPrerenderPaths,
} satisfies Config;
