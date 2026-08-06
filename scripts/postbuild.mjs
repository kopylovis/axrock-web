import { readdir, readFile, rename, writeFile, stat, rm } from "node:fs/promises";
import { join, relative } from "node:path";

const OUT_DIR = "build/client";
const PLACEHOLDER = "__empty";
const SITE_URL = (process.env.VITE_PUBLIC_SITE_URL ?? "https://axrock.band").replace(/\/$/, "");
// Свой домен подключается переменной окружения: пока её нет, Pages отдаёт сайт
// на github.io и CNAME писать нельзя — иначе Pages уведёт домен в никуда.
const SITE_CNAME = process.env.SITE_CNAME?.trim();
// Черновой деплой не должен попасть в поиск раньше боевого домена.
const NOINDEX = process.env.SITE_NOINDEX?.trim().toLowerCase() === "true";
// Имя подпапки на project-page GitHub Pages, например "axrock". Пусто — сайт в корне.
const BASE_SEGMENT = (process.env.VITE_BASE_PATH ?? "/").replace(/^\/+|\/+$/g, "");

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

// В режиме подпапки пререндер складывает страницы в build/client/<base>/, а статику
// оставляет уровнем выше. Артефакт Pages разворачивается уже по адресу /<base>/,
// поэтому вложенность нужно убрать — иначе получилось бы /<base>/<base>/.
// SPA-оболочка при этом пишется в index.html, и её надо сохранить до переноса.
if (BASE_SEGMENT) {
  const baseDir = join(OUT_DIR, BASE_SEGMENT);
  await writeFile(
    join(OUT_DIR, "404.html"),
    await readFile(join(OUT_DIR, "index.html"), "utf8"),
    "utf8",
  );

  for (const entry of await readdir(baseDir)) {
    await rename(join(baseDir, entry), join(OUT_DIR, entry));
  }
  await rm(baseDir, { recursive: true, force: true });
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

await writeFile(
  join(OUT_DIR, "robots.txt"),
  NOINDEX
    ? ["User-agent: *", "Disallow: /", ""].join("\n")
    : [
        "User-agent: *",
        "Allow: /",
        "Disallow: /admin",
        "Disallow: /admin/",
        "",
        `Sitemap: ${SITE_URL}/sitemap.xml`,
        `Host: ${SITE_URL.replace(/^https?:\/\//, "").split("/")[0]}`,
        "",
      ].join("\n"),
  "utf8",
);

if (SITE_CNAME) {
  await writeFile(join(OUT_DIR, "CNAME"), `${SITE_CNAME}\n`, "utf8");
}

// GitHub Pages отдаёт 404.html с настоящим статусом 404 — используем SPA-оболочку,
// чтобы клиентский роутер показал свежий материал, ещё не попавший в пререндер.
if (!BASE_SEGMENT) {
  const fallback = await readFile(join(OUT_DIR, "__spa-fallback.html"), "utf8");
  await writeFile(join(OUT_DIR, "404.html"), fallback, "utf8");
}

const removed = placeholders.length > 0 ? `, удалено заглушек: ${placeholders.length}` : "";
const domain = SITE_CNAME ? `, CNAME: ${SITE_CNAME}` : "";
const indexing = NOINDEX ? ", индексация запрещена" : "";
const base = BASE_SEGMENT ? `, подпапка /${BASE_SEGMENT}/` : "";
console.log(
  `[postbuild] ${SITE_URL} — sitemap.xml: ${routes.length} URL, robots.txt и 404.html готовы${removed}${domain}${indexing}${base}`,
);
