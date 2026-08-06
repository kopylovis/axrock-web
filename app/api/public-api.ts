import { apiFetch, buildQuery } from "./client";
import type {
  BandMemberDto,
  ConcertDetailDto,
  ConcertSummaryDto,
  MediaItemDto,
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
  MediaItem,
  MediaType,
  NewsCategory,
  NewsDetail,
  NewsSummary,
  Page,
  ReleaseDetail,
  SiteData,
} from "~/types/content";

const PREFIX = "/public";

export interface SitemapEntry {
  path: string;
  lastModified: string | null;
}

export async function fetchSiteData(): Promise<SiteData> {
  return mapSiteData(await apiFetch<SiteDataDto>(`${PREFIX}/site`));
}

export async function fetchMembers(): Promise<BandMember[]> {
  const dto = await apiFetch<BandMemberDto[]>(`${PREFIX}/members`);
  return dto.map(mapBandMember);
}

export interface NewsQuery {
  page?: number;
  pageSize?: number;
  category?: string | null;
  featured?: boolean | null;
}

export async function fetchNews(query: NewsQuery = {}): Promise<Page<NewsSummary>> {
  const search = buildQuery({
    page: query.page ?? 1,
    pageSize: query.pageSize ?? 9,
    category: query.category,
    featured: query.featured,
  });
  const dto = await apiFetch<PageDto<NewsSummaryDto>>(`${PREFIX}/news${search}`);
  return mapPage(dto, mapNewsSummary);
}

export async function fetchNewsCategories(): Promise<NewsCategory[]> {
  const dto = await apiFetch<NewsCategoryDto[]>(`${PREFIX}/news/categories`);
  return dto.map(mapNewsCategory);
}

export async function fetchNewsBySlug(slug: string): Promise<NewsDetail> {
  const dto = await apiFetch<NewsDetailDto>(`${PREFIX}/news/${encodeURIComponent(slug)}`);
  return mapNewsDetail(dto);
}

export async function fetchUpcomingConcerts(limit = 20): Promise<ConcertSummary[]> {
  const dto = await apiFetch<ConcertSummaryDto[]>(
    `${PREFIX}/concerts/upcoming${buildQuery({ limit })}`,
  );
  return dto.map(mapConcertSummary);
}

export interface PastConcertsQuery {
  page?: number;
  pageSize?: number;
  city?: string | null;
}

export async function fetchPastConcerts(query: PastConcertsQuery = {}): Promise<Page<ConcertSummary>> {
  const search = buildQuery({
    page: query.page ?? 1,
    pageSize: query.pageSize ?? 12,
    city: query.city,
  });
  const dto = await apiFetch<PageDto<ConcertSummaryDto>>(`${PREFIX}/concerts/past${search}`);
  return mapPage(dto, mapConcertSummary);
}

export async function fetchConcertBySlug(slug: string): Promise<ConcertDetail> {
  const dto = await apiFetch<ConcertDetailDto>(`${PREFIX}/concerts/${encodeURIComponent(slug)}`);
  return mapConcertDetail(dto);
}

export async function fetchReleases(): Promise<ReleaseDetail[]> {
  const dto = await apiFetch<ReleaseDetailDto[]>(`${PREFIX}/releases`);
  return dto.map(mapReleaseDetail);
}

export async function fetchReleaseBySlug(slug: string): Promise<ReleaseDetail> {
  const dto = await apiFetch<ReleaseDetailDto>(`${PREFIX}/releases/${encodeURIComponent(slug)}`);
  return mapReleaseDetail(dto);
}

export async function fetchMedia(type?: MediaType | null): Promise<MediaItem[]> {
  const dto = await apiFetch<MediaItemDto[]>(`${PREFIX}/media${buildQuery({ type })}`);
  return dto.map(mapMediaItem);
}

export async function fetchSitemapEntries(): Promise<SitemapEntry[]> {
  return apiFetch<SitemapEntry[]>(`${PREFIX}/sitemap`);
}
