import type { Config } from "@react-router/dev/config";
import { PRERENDER_PLACEHOLDER } from "./app/lib/prerender";

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

  for (const prefix of ["/news/", "/concerts/"]) {
    if (!dynamic.some((path) => path.startsWith(prefix))) {
      dynamic.push(`${prefix}${PRERENDER_PLACEHOLDER}`);
    }
  }

  return [...new Set([...STATIC_PATHS, ...dynamic])];
}

export default {
  ssr: false,
  prerender: collectPrerenderPaths,
} satisfies Config;
