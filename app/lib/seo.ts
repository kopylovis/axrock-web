import { SITE_URL, canonicalUrl } from "./config";
import { BAND_NAME } from "./site-defaults";

export interface SeoInput {
  title: string;
  description?: string | null;
  pathname: string;
  image?: string | null;
  type?: "website" | "article" | "music.album";
  noindex?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
}

type MetaDescriptor = Record<string, unknown>;

export function buildMeta(input: SeoInput): MetaDescriptor[] {
  const url = canonicalUrl(input.pathname);
  const title = input.title.includes(BAND_NAME) ? input.title : `${input.title} — ${BAND_NAME}`;
  const description = input.description ?? undefined;
  const image = input.image
    ? input.image.startsWith("http")
      ? input.image
      : `${SITE_URL}${input.image}`
    : undefined;

  const tags: MetaDescriptor[] = [
    { title },
    { tagName: "link", rel: "canonical", href: url },
    { property: "og:title", content: title },
    { property: "og:url", content: url },
    { property: "og:type", content: input.type ?? "website" },
    { property: "og:site_name", content: `${BAND_NAME} — официальный сайт` },
    { property: "og:locale", content: "ru_RU" },
    { name: "twitter:card", content: image ? "summary_large_image" : "summary" },
    { name: "twitter:title", content: title },
  ];

  if (description) {
    tags.push(
      { name: "description", content: description },
      { property: "og:description", content: description },
      { name: "twitter:description", content: description },
    );
  }

  if (image) {
    tags.push({ property: "og:image", content: image }, { name: "twitter:image", content: image });
  }

  if (input.publishedTime) {
    tags.push({ property: "article:published_time", content: input.publishedTime });
  }

  if (input.modifiedTime) {
    tags.push({ property: "article:modified_time", content: input.modifiedTime });
  }

  // Черновой адрес закрывается целиком: robots.txt лежит в подпапке,
  // а её поисковики не читают — остаётся только мета-тег.
  const draft = import.meta.env.VITE_SITE_NOINDEX === "true";
  tags.push({
    name: "robots",
    content: input.noindex || draft ? "noindex, nofollow" : "index, follow",
  });

  return tags;
}

/**
 * Изображение по умолчанию из настроек сайта: используется, когда у страницы
 * нет собственной обложки. Данные лежат в загрузчике публичного layout.
 */
export function ogImageFrom(matches: ReadonlyArray<unknown>): string | null {
  for (const match of matches) {
    const data = (match as { data?: unknown } | undefined)?.data;
    const site = (data as { site?: { settings?: { defaultOgImage?: string | null } } } | undefined)
      ?.site;
    if (site?.settings?.defaultOgImage) return site.settings.defaultOgImage;
  }
  return null;
}

export function jsonLd(data: Record<string, unknown>): MetaDescriptor {
  return { "script:ld+json": data };
}

export function breadcrumbs(items: Array<{ name: string; path: string }>): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: canonicalUrl(item.path),
    })),
  };
}
