import { readdir, readFile, writeFile, stat, rm } from "node:fs/promises";
import { join, relative } from "node:path";

const OUT_DIR = "build/client";
const PLACEHOLDER = "__empty";
const SITE_URL = (process.env.VITE_PUBLIC_SITE_URL ?? "https://axrock.band").replace(/\/$/, "");

const PRIORITIES = [
  [/^\/$/, "1.0", "daily"],
  [/^\/(news|concerts)$/, "0.9", "daily"],
  [/^\/(news|concerts)\//, "0.8", "weekly"],
  [/^\/music$/, "0.8", "weekly"],
  [/^\/(about|members)$/, "0.7", "monthly"],
  [/^\/media$/, "0.6", "weekly"],
  [/^\/(privacy|personal-data-consent)$/, "0.2", "yearly"],
];

async function collectRoutes(dir, base = dir) {
  const routes = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "assets") continue;
      routes.push(...(await collectRoutes(full, base)));
    } else if (entry.name === "index.html") {
      const rel = relative(base, full).replace(/index\.html$/, "").replace(/\/$/, "");
      routes.push({ path: `/${rel}`.replace(/^\/\/+/, "/"), file: full });
    }
  }
  return routes;
}

function describe(path) {
  for (const [pattern, priority, changefreq] of PRIORITIES) {
    if (pattern.test(path)) return { priority, changefreq };
  }
  return { priority: "0.5", changefreq: "monthly" };
}

function escapeXml(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Пути-заглушки нужны только чтобы пройти проверку пререндера — в готовой сборке их быть не должно.
const allRoutes = await collectRoutes(OUT_DIR);
const placeholders = allRoutes.filter((route) => route.path.endsWith(`/${PLACEHOLDER}`));

for (const route of placeholders) {
  await rm(join(OUT_DIR, route.path), { recursive: true, force: true });
  await rm(join(OUT_DIR, `${route.path}.data`), { force: true });
}

const routes = allRoutes
  .filter((route) => !route.path.startsWith("/admin"))
  .filter((route) => !route.path.endsWith(`/${PLACEHOLDER}`))
  .sort((a, b) => a.path.localeCompare(b.path));

const entries = await Promise.all(
  routes.map(async (route) => {
    const { priority, changefreq } = describe(route.path);
    const info = await stat(route.file);
    return [
      "  <url>",
      `    <loc>${escapeXml(`${SITE_URL}${route.path === "/" ? "/" : route.path}`)}</loc>`,
      `    <lastmod>${info.mtime.toISOString().slice(0, 10)}</lastmod>`,
      `    <changefreq>${changefreq}</changefreq>`,
      `    <priority>${priority}</priority>`,
      "  </url>",
    ].join("\n");
  }),
);

await writeFile(
  join(OUT_DIR, "sitemap.xml"),
  [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    "</urlset>",
    "",
  ].join("\n"),
  "utf8",
);

// GitHub Pages отдаёт 404.html с настоящим статусом 404 — используем SPA-оболочку,
// чтобы клиентский роутер показал свежий материал, ещё не попавший в пререндер.
const fallback = await readFile(join(OUT_DIR, "__spa-fallback.html"), "utf8");
await writeFile(join(OUT_DIR, "404.html"), fallback, "utf8");

const removed = placeholders.length > 0 ? `, удалено заглушек: ${placeholders.length}` : "";
console.log(`[postbuild] sitemap.xml: ${routes.length} URL, 404.html готов${removed}`);
