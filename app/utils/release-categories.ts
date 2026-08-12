import type { ReleaseType } from "~/types/content";

export interface ReleaseCategory {
  slug: string;
  type: ReleaseType;
  title: string;
  description: string;
}

/** Порядок задаёт вид раздела «Музыка»: сначала альбомы, мелочь — в конце. */
export const RELEASE_CATEGORIES: ReleaseCategory[] = [
  {
    slug: "albums",
    type: "ALBUM",
    title: "Альбомы",
    description: "Полноформатные студийные работы группы.",
  },
  {
    slug: "ep",
    type: "EP",
    title: "EP",
    description: "Мини-альбомы — короче полноформата, длиннее сингла.",
  },
  {
    slug: "singles",
    type: "SINGLE",
    title: "Синглы",
    description: "Отдельные песни и работы вне альбомов.",
  },
  {
    slug: "live",
    type: "LIVE",
    title: "Live",
    description: "Концертные записи.",
  },
  {
    slug: "compilations",
    type: "COMPILATION",
    title: "Сборники",
    description: "Сборники и переиздания.",
  },
];

export const RELEASE_TYPE_LABELS: Record<ReleaseType, string> = {
  ALBUM: "Альбом",
  EP: "EP",
  SINGLE: "Сингл",
  LIVE: "Концертный",
  COMPILATION: "Сборник",
};

/** Якорь релиза внутри раздела: по нему прокручиваем к нужной карточке. */
export function releaseAnchor(slug: string): string {
  return `release-${slug}`;
}

/** Плитка релиза ведёт сразу в его раздел, к самой карточке. */
export function releaseHref(release: { slug: string; type: ReleaseType }): string {
  const category = categoryOfType(release.type);
  return category ? `/music/${category.slug}#${releaseAnchor(release.slug)}` : "/music";
}

export function categoryBySlug(slug: string | undefined): ReleaseCategory | null {
  return RELEASE_CATEGORIES.find((category) => category.slug === slug) ?? null;
}

export function categoryOfType(type: ReleaseType): ReleaseCategory | null {
  return RELEASE_CATEGORIES.find((category) => category.type === type) ?? null;
}

/** «2 релиза» — счётчик на плитке раздела. */
export function releaseCountLabel(count: number): string {
  const tens = count % 100;
  const ones = count % 10;
  if (tens >= 11 && tens <= 14) return `${count} релизов`;
  if (ones === 1) return `${count} релиз`;
  if (ones >= 2 && ones <= 4) return `${count} релиза`;
  return `${count} релизов`;
}
