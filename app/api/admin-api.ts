import { apiFetch, buildQuery } from "./client";
import { clearAdminToken, setAdminToken } from "./auth-token";
import type {
  BandMemberDto,
  ConcertDetailDto,
  MediaItemDto,
  NewsCategoryDto,
  NewsDetailDto,
  PageDto,
  ReleaseDetailDto,
  SiteSettingsDto,
  SocialLinkDto,
} from "./dto";
import type { ConcertEventStatus, MediaType, PublicationStatus, ReleaseType, RichTextDoc } from "~/types/content";
import type { AdminRole } from "~/utils/roles";

const PREFIX = "/admin";

export interface AdminUser {
  id: number;
  username: string;
  role: AdminRole;
}

export interface AdminUserListItem extends AdminUser {
  createdAt: string;
  lastLoginAt: string | null;
}

export interface AdminUserCreateInput {
  username: string;
  password: string;
  role: AdminRole;
}

export interface AdminUserUpdateInput {
  role?: AdminRole;
  password?: string;
}

export interface AdminNewsListItem {
  id: number;
  title: string;
  slug: string;
  status: PublicationStatus;
  featured: boolean;
  categoryName: string | null;
  publishedAt: string | null;
  updatedAt: string;
}

export interface AdminConcertListItem {
  id: number;
  title: string;
  slug: string;
  publicationStatus: PublicationStatus;
  eventStatus: ConcertEventStatus;
  startsAt: string;
  city: string;
  venueName: string;
  updatedAt: string;
}

export interface AdminDashboard {
  publishedNews: number;
  draftNews: number;
  upcomingConcerts: number;
  draftConcerts: number;
  nextConcert: {
    id: number;
    title: string;
    slug: string;
    startsAt: string;
    city: string;
    timezone: string;
  } | null;
  recentlyUpdated: Array<{
    id: number;
    kind: "NEWS" | "CONCERT" | "RELEASE" | "MEMBER";
    title: string;
    updatedAt: string;
  }>;
}

export interface NewsInput {
  title: string;
  slug: string;
  excerpt: string | null;
  content: RichTextDoc | null;
  coverImage: string | null;
  categoryId: number | null;
  status: PublicationStatus;
  publishedAt: string | null;
  featured: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
}

export interface ConcertInput {
  title: string;
  slug: string;
  shortDescription: string | null;
  description: RichTextDoc | null;
  posterImage: string | null;
  publicationStatus: PublicationStatus;
  eventStatus: ConcertEventStatus;
  startsAt: string;
  timezone: string;
  doorsOpenAt: string | null;
  city: string;
  country: string;
  venueName: string;
  venueAddress: string | null;
  mapUrl: string | null;
  ageRestriction: string | null;
  ticketUrl: string | null;
  ticketProvider: string | null;
  organizerName: string | null;
  organizerUrl: string | null;
  newStartsAt: string | null;
  cancellationReason: string | null;
  featured: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  participants: Array<{ name: string; url: string | null; sortOrder: number }>;
}

export interface MemberInput {
  name: string;
  stageName: string | null;
  role: string;
  instrument: string | null;
  biography: string | null;
  photo: string | null;
  currentMember: boolean;
  visible: boolean;
  sortOrder: number;
}

export interface ReleaseInput {
  title: string;
  slug: string;
  type: ReleaseType;
  coverImage: string | null;
  description: string | null;
  releaseDate: string | null;
  published: boolean;
  sortOrder: number;
  seoTitle: string | null;
  seoDescription: string | null;
  tracks: Array<{ title: string; duration: string | null; trackNumber: number }>;
  links: Array<{ platform: string; url: string; sortOrder: number }>;
}

export interface SocialLinkInput {
  platform: string;
  title: string;
  url: string;
  sortOrder: number;
  visible: boolean;
}

export interface MediaInput {
  type: MediaType;
  title: string | null;
  description: string | null;
  fileUrl: string | null;
  previewImageUrl: string | null;
  externalUrl: string | null;
  concertId: number | null;
  status: PublicationStatus;
  sortOrder: number;
}

export interface UploadResult {
  url: string;
  width: number | null;
  height: number | null;
  mimeType: string;
  size: number;
}

export interface LoginResult {
  token: string;
  expiresAt: string;
  user: AdminUser;
}

export async function login(credentials: {
  username: string;
  password: string;
}): Promise<LoginResult> {
  const result = await apiFetch<LoginResult>(`${PREFIX}/auth/login`, {
    method: "POST",
    body: credentials,
  });
  setAdminToken(result.token);
  return result;
}

export async function logout(): Promise<void> {
  try {
    await apiFetch<void>(`${PREFIX}/auth/logout`, { method: "POST", auth: true });
  } finally {
    clearAdminToken();
  }
}

export async function me(): Promise<AdminUser> {
  return apiFetch<AdminUser>(`${PREFIX}/auth/me`, { auth: true });
}

/** Смена собственного пароля: доступна любой роли, текущая сессия остаётся живой. */
export async function changeOwnPassword(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  await apiFetch<void>(`${PREFIX}/auth/password`, { method: "POST", body: input, auth: true });
}

export async function listAdminUsers(): Promise<AdminUserListItem[]> {
  return apiFetch<AdminUserListItem[]>(`${PREFIX}/users`, { auth: true });
}

export async function createAdminUser(input: AdminUserCreateInput): Promise<AdminUserListItem> {
  return apiFetch<AdminUserListItem>(`${PREFIX}/users`, { method: "POST", body: input, auth: true });
}

export async function updateAdminUser(
  id: number,
  input: AdminUserUpdateInput,
): Promise<AdminUserListItem> {
  return apiFetch<AdminUserListItem>(`${PREFIX}/users/${id}`, {
    method: "PUT",
    body: input,
    auth: true,
  });
}

export async function deleteAdminUser(id: number): Promise<void> {
  await apiFetch<void>(`${PREFIX}/users/${id}`, { method: "DELETE", auth: true });
}

export async function dashboard(): Promise<AdminDashboard> {
  return apiFetch<AdminDashboard>(`${PREFIX}/dashboard`, { auth: true });
}

export interface RebuildStatus {
  /** Настроены ли доступы к GitHub на стороне backend. */
  configured: boolean;
  running: boolean;
  status: string | null;
  conclusion: string | null;
  startedAt: string | null;
  url: string | null;
}

export async function rebuildStatus(): Promise<RebuildStatus> {
  return apiFetch<RebuildStatus>(`${PREFIX}/rebuild/status`, { auth: true });
}

export async function requestSiteRebuild(): Promise<void> {
  await apiFetch<void>(`${PREFIX}/rebuild`, { method: "POST", auth: true });
}

export interface AdminListQuery {
  page?: number;
  pageSize?: number;
  status?: string | null;
  query?: string | null;
}

export async function listNews(
  params: AdminListQuery = {},
): Promise<PageDto<AdminNewsListItem>> {
  const search = buildQuery({
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 20,
    status: params.status,
    query: params.query,
  });
  return apiFetch<PageDto<AdminNewsListItem>>(`${PREFIX}/news${search}`, { auth: true });
}

export async function getNews(id: number): Promise<NewsDetailDto> {
  return apiFetch<NewsDetailDto>(`${PREFIX}/news/${id}`, { auth: true });
}

export async function createNews(input: NewsInput): Promise<NewsDetailDto> {
  return apiFetch<NewsDetailDto>(`${PREFIX}/news`, { method: "POST", body: input, auth: true });
}

export async function updateNews(
  id: number,
  input: NewsInput,
): Promise<NewsDetailDto> {
  return apiFetch<NewsDetailDto>(`${PREFIX}/news/${id}`, { method: "PUT", body: input, auth: true });
}

export async function deleteNews(id: number): Promise<void> {
  await apiFetch<void>(`${PREFIX}/news/${id}`, { method: "DELETE", auth: true });
}

export async function setNewsPublished(
  id: number,
  published: boolean,
): Promise<void> {
  await apiFetch<void>(`${PREFIX}/news/${id}/${published ? "publish" : "unpublish"}`, {
    method: "POST",
    auth: true,
  });
}

/**
 * Копия для правки «на основе» существующей записи. Slug обязан быть уникальным,
 * поэтому к нему добавляется суффикс; копия всегда создаётся черновиком, чтобы
 * незаконченный дубль не уехал на сайт.
 */
function copySlug(slug: string): string {
  const stamp = Date.now().toString(36).slice(-4);
  return `${slug}-kopiya-${stamp}`.slice(0, 200);
}

export async function duplicateNews(id: number): Promise<NewsDetailDto> {
  const source = await getNews(id);
  return createNews({
    title: `${source.title} (копия)`,
    slug: copySlug(source.slug),
    excerpt: source.excerpt,
    content: source.content,
    coverImage: source.coverImage,
    categoryId: source.category?.id ?? null,
    status: "DRAFT",
    publishedAt: null,
    featured: false,
    seoTitle: source.seoTitle,
    seoDescription: source.seoDescription,
  });
}

export async function duplicateConcert(id: number): Promise<ConcertDetailDto> {
  const source = await getConcert(id);
  return createConcert({
    title: `${source.title} (копия)`,
    slug: copySlug(source.slug),
    shortDescription: source.shortDescription,
    description: source.description,
    posterImage: source.posterImage,
    publicationStatus: "DRAFT",
    // Статус события сбрасывается: перенос или отмена относились к исходной дате.
    eventStatus: "ANNOUNCED",
    startsAt: source.startsAt,
    timezone: source.timezone,
    doorsOpenAt: source.doorsOpenAt,
    city: source.city,
    country: source.country,
    venueName: source.venueName,
    venueAddress: source.venueAddress,
    mapUrl: source.mapUrl,
    ageRestriction: source.ageRestriction,
    ticketUrl: source.ticketUrl,
    ticketProvider: source.ticketProvider,
    organizerName: source.organizerName,
    organizerUrl: source.organizerUrl,
    newStartsAt: null,
    cancellationReason: null,
    featured: false,
    seoTitle: source.seoTitle,
    seoDescription: source.seoDescription,
    participants: source.participants.map((participant, index) => ({
      name: participant.name,
      url: participant.url,
      sortOrder: index,
    })),
  });
}

export async function listNewsCategories(): Promise<NewsCategoryDto[]> {
  return apiFetch<NewsCategoryDto[]>(`${PREFIX}/news/categories`, { auth: true });
}

export async function listConcerts(
  params: AdminListQuery = {},
): Promise<PageDto<AdminConcertListItem>> {
  const search = buildQuery({
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 20,
    status: params.status,
    query: params.query,
  });
  return apiFetch<PageDto<AdminConcertListItem>>(`${PREFIX}/concerts${search}`, { auth: true });
}

export async function getConcert(id: number): Promise<ConcertDetailDto> {
  return apiFetch<ConcertDetailDto>(`${PREFIX}/concerts/${id}`, { auth: true });
}

export async function createConcert(
  input: ConcertInput,
): Promise<ConcertDetailDto> {
  return apiFetch<ConcertDetailDto>(`${PREFIX}/concerts`, { method: "POST", body: input, auth: true });
}

export async function updateConcert(
  id: number,
  input: ConcertInput,
): Promise<ConcertDetailDto> {
  return apiFetch<ConcertDetailDto>(`${PREFIX}/concerts/${id}`, {
    method: "PUT",
    body: input,
    auth: true,
  });
}

export async function deleteConcert(id: number): Promise<void> {
  await apiFetch<void>(`${PREFIX}/concerts/${id}`, { method: "DELETE", auth: true });
}

export async function concertAction(
  id: number,
  action: "publish" | "unpublish" | "sold-out" | "cancel" | "postpone",
  body?: unknown,
): Promise<void> {
  await apiFetch<void>(`${PREFIX}/concerts/${id}/${action}`, {
    method: "POST",
    body: body ?? {},
    auth: true,
  });
}

export async function listMembers(): Promise<BandMemberDto[]> {
  return apiFetch<BandMemberDto[]>(`${PREFIX}/members`, { auth: true });
}

export async function getMember(id: number): Promise<BandMemberDto> {
  return apiFetch<BandMemberDto>(`${PREFIX}/members/${id}`, { auth: true });
}

export async function createMember(input: MemberInput): Promise<BandMemberDto> {
  return apiFetch<BandMemberDto>(`${PREFIX}/members`, { method: "POST", body: input, auth: true });
}

export async function updateMember(
  id: number,
  input: MemberInput,
): Promise<BandMemberDto> {
  return apiFetch<BandMemberDto>(`${PREFIX}/members/${id}`, {
    method: "PUT",
    body: input,
    auth: true,
  });
}

export async function deleteMember(id: number): Promise<void> {
  await apiFetch<void>(`${PREFIX}/members/${id}`, { method: "DELETE", auth: true });
}

export async function listReleases(): Promise<ReleaseDetailDto[]> {
  return apiFetch<ReleaseDetailDto[]>(`${PREFIX}/releases`, { auth: true });
}

export async function getRelease(id: number): Promise<ReleaseDetailDto> {
  return apiFetch<ReleaseDetailDto>(`${PREFIX}/releases/${id}`, { auth: true });
}

export async function createRelease(
  input: ReleaseInput,
): Promise<ReleaseDetailDto> {
  return apiFetch<ReleaseDetailDto>(`${PREFIX}/releases`, { method: "POST", body: input, auth: true });
}

export async function updateRelease(
  id: number,
  input: ReleaseInput,
): Promise<ReleaseDetailDto> {
  return apiFetch<ReleaseDetailDto>(`${PREFIX}/releases/${id}`, {
    method: "PUT",
    body: input,
    auth: true,
  });
}

export async function deleteRelease(id: number): Promise<void> {
  await apiFetch<void>(`${PREFIX}/releases/${id}`, { method: "DELETE", auth: true });
}

export async function getSettings(): Promise<SiteSettingsDto> {
  return apiFetch<SiteSettingsDto>(`${PREFIX}/settings`, { auth: true });
}

export async function updateSettings(
  input: SiteSettingsDto,
): Promise<SiteSettingsDto> {
  return apiFetch<SiteSettingsDto>(`${PREFIX}/settings`, {
    method: "PUT",
    body: input,
    auth: true,
  });
}

export async function listSocialLinks(): Promise<SocialLinkDto[]> {
  return apiFetch<SocialLinkDto[]>(`${PREFIX}/social-links`, { auth: true });
}

export async function createSocialLink(
  input: SocialLinkInput,
): Promise<SocialLinkDto> {
  return apiFetch<SocialLinkDto>(`${PREFIX}/social-links`, {
    method: "POST",
    body: input,
    auth: true,
  });
}

export async function updateSocialLink(
  id: number,
  input: SocialLinkInput,
): Promise<SocialLinkDto> {
  return apiFetch<SocialLinkDto>(`${PREFIX}/social-links/${id}`, {
    method: "PUT",
    body: input,
    auth: true,
  });
}

export async function deleteSocialLink(id: number): Promise<void> {
  await apiFetch<void>(`${PREFIX}/social-links/${id}`, { method: "DELETE", auth: true });
}

export async function listMedia(): Promise<MediaItemDto[]> {
  return apiFetch<MediaItemDto[]>(`${PREFIX}/media`, { auth: true });
}

export async function createMedia(input: MediaInput): Promise<MediaItemDto> {
  return apiFetch<MediaItemDto>(`${PREFIX}/media`, { method: "POST", body: input, auth: true });
}

export async function deleteMedia(id: number): Promise<void> {
  await apiFetch<void>(`${PREFIX}/media/${id}`, { method: "DELETE", auth: true });
}

export interface UploadItem {
  url: string;
  fileName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
  /**
   * Адрес уже используется в контенте или настройках — файл удалять нельзя.
   * Может отсутствовать, если backend старее этой проверки.
   */
  inUse?: boolean;
}

/** Ранее загруженные файлы — библиотека для повторного использования. */
export async function listUploads(limit = 200): Promise<UploadItem[]> {
  return apiFetch<UploadItem[]>(`${PREFIX}/uploads?limit=${limit}`, { auth: true });
}

/**
 * Удаляет файл вместе с уменьшенными копиями. Backend отказывает, если адрес
 * где-то используется, — поэтому битых картинок на сайте не появится.
 */
export async function deleteUpload(url: string): Promise<void> {
  const path = new URL(url).pathname.split("/uploads/").pop();
  if (!path) throw new Error("Не удалось разобрать адрес файла");
  await apiFetch<void>(`${PREFIX}/uploads/${path}`, { method: "DELETE", auth: true });
}

export async function uploadImage(file: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.append("file", file);
  return apiFetch<UploadResult>(`${PREFIX}/uploads`, {
    method: "POST",
    formData,
    auth: true,
  });
}
