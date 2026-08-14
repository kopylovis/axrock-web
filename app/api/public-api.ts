import { apiFetch, buildQuery } from "./client";
import type {
  BandMemberDto,
  ConcertDetailDto,
  ConcertSummaryDto,
  MediaAlbumDto,
  MediaItemDto,
  MusicSectionDto,
  NewsCategoryDto,
  NewsDetailDto,
  NewsSummaryDto,
  PageDto,
  ReleaseDetailDto,
  SiteDataDto,
} from "./dto";
import {
  mapBandMember,
  mapConcertDetail,
  mapConcertSummary,
  mapMediaAlbum,
  mapMediaItem,
  mapNewsCategory,
  mapNewsDetail,
  mapNewsSummary,
  mapPage,
  mapReleaseDetail,
  mapSiteData,
} from "./mappers";
import type {
  BandMember,
  ConcertDetail,
  ConcertSummary,
  MediaAlbum,
  MediaItem,
  MediaType,
  NewsCategory,
  NewsDetail,
  NewsSummary,
  Page,
  ReleaseDetail,
  SiteData,
} from "~/types/content";
import { DEFAULT_LANG, type Lang } from "~/i18n/config";

const PREFIX = "/public";

/**
 * Язык — параметр загрузки, а не отдельная ручка API: бэкенд отдаёт оба
 * варианта текста сразу, а выбор между ними делает маппер.
 */

export interface SitemapEntry {
  path: string;
  lastModified: string | null;
}

export async function fetchSiteData(lang: Lang = DEFAULT_LANG): Promise<SiteData> {
  return mapSiteData(await apiFetch<SiteDataDto>(`${PREFIX}/site`), lang);
}

export async function fetchMembers(lang: Lang = DEFAULT_LANG): Promise<BandMember[]> {
  const dto = await apiFetch<BandMemberDto[]>(`${PREFIX}/members`);
  return dto.map((item) => mapBandMember(item, lang));
}

export interface NewsQuery {
  page?: number;
  pageSize?: number;
  category?: string | null;
  featured?: boolean | null;
}

export async function fetchNews(
  query: NewsQuery = {},
  lang: Lang = DEFAULT_LANG,
): Promise<Page<NewsSummary>> {
  const search = buildQuery({
    page: query.page ?? 1,
    pageSize: query.pageSize ?? 9,
    category: query.category,
    featured: query.featured,
  });
  const dto = await apiFetch<PageDto<NewsSummaryDto>>(`${PREFIX}/news${search}`);
  return mapPage(dto, (item) => mapNewsSummary(item, lang));
}

export async function fetchNewsCategories(lang: Lang = DEFAULT_LANG): Promise<NewsCategory[]> {
  const dto = await apiFetch<NewsCategoryDto[]>(`${PREFIX}/news/categories`);
  return dto.map((item) => mapNewsCategory(item, lang));
}

export async function fetchNewsBySlug(slug: string, lang: Lang = DEFAULT_LANG): Promise<NewsDetail> {
  const dto = await apiFetch<NewsDetailDto>(`${PREFIX}/news/${encodeURIComponent(slug)}`);
  return mapNewsDetail(dto, lang);
}

export async function fetchUpcomingConcerts(
  limit = 20,
  lang: Lang = DEFAULT_LANG,
): Promise<ConcertSummary[]> {
  const dto = await apiFetch<ConcertSummaryDto[]>(
    `${PREFIX}/concerts/upcoming${buildQuery({ limit })}`,
  );
  return dto.map((item) => mapConcertSummary(item, lang));
}

export interface PastConcertsQuery {
  page?: number;
  pageSize?: number;
  city?: string | null;
}

export async function fetchPastConcerts(
  query: PastConcertsQuery = {},
  lang: Lang = DEFAULT_LANG,
): Promise<Page<ConcertSummary>> {
  const search = buildQuery({
    page: query.page ?? 1,
    pageSize: query.pageSize ?? 12,
    city: query.city,
  });
  const dto = await apiFetch<PageDto<ConcertSummaryDto>>(`${PREFIX}/concerts/past${search}`);
  return mapPage(dto, (item) => mapConcertSummary(item, lang));
}

export async function fetchConcertBySlug(
  slug: string,
  lang: Lang = DEFAULT_LANG,
): Promise<ConcertDetail> {
  const dto = await apiFetch<ConcertDetailDto>(`${PREFIX}/concerts/${encodeURIComponent(slug)}`);
  return mapConcertDetail(dto, lang);
}

export async function fetchReleases(lang: Lang = DEFAULT_LANG): Promise<ReleaseDetail[]> {
  const dto = await apiFetch<ReleaseDetailDto[]>(`${PREFIX}/releases`);
  return dto.map((item) => mapReleaseDetail(item, lang));
}

export async function fetchMusicSections(): Promise<MusicSectionDto[]> {
  return apiFetch<MusicSectionDto[]>(`${PREFIX}/music-sections`);
}

export async function fetchReleaseBySlug(
  slug: string,
  lang: Lang = DEFAULT_LANG,
): Promise<ReleaseDetail> {
  const dto = await apiFetch<ReleaseDetailDto>(`${PREFIX}/releases/${encodeURIComponent(slug)}`);
  return mapReleaseDetail(dto, lang);
}

export async function fetchMedia(
  type?: MediaType | null,
  lang: Lang = DEFAULT_LANG,
): Promise<MediaItem[]> {
  const dto = await apiFetch<MediaItemDto[]>(`${PREFIX}/media${buildQuery({ type })}`);
  return dto.map((item) => mapMediaItem(item, lang));
}

export async function fetchMediaAlbums(lang: Lang = DEFAULT_LANG): Promise<MediaAlbum[]> {
  const dto = await apiFetch<MediaAlbumDto[]>(`${PREFIX}/media-albums`);
  return dto.map((album) => mapMediaAlbum(album, lang));
}

export async function fetchSitemapEntries(): Promise<SitemapEntry[]> {
  return apiFetch<SitemapEntry[]>(`${PREFIX}/sitemap`);
}
