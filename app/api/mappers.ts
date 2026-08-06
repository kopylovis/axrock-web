import type {
  BandMember,
  ConcertDetail,
  ConcertParticipant,
  ConcertSummary,
  MediaItem,
  NewsCategory,
  NewsDetail,
  NewsSummary,
  Page,
  ReleaseDetail,
  ReleaseLink,
  ReleaseSummary,
  ReleaseTrack,
  RichTextDoc,
  SiteData,
  SiteSettings,
  SocialLink,
} from "~/types/content";
import type {
  BandMemberDto,
  ConcertDetailDto,
  ConcertParticipantDto,
  ConcertSummaryDto,
  MediaItemDto,
  NewsCategoryDto,
  NewsDetailDto,
  NewsSummaryDto,
  PageDto,
  ReleaseDetailDto,
  ReleaseLinkDto,
  ReleaseSummaryDto,
  ReleaseTrackDto,
  SiteDataDto,
  SiteSettingsDto,
  SocialLinkDto,
} from "./dto";

const HAS_OFFSET = /(?:Z|[+-]\d{2}:?\d{2})$/;

/** Backend отдаёт LocalDateTime в UTC без суффикса — без него JS разберёт строку как локальное время. */
export function parseUtcDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const normalized = HAS_OFFSET.test(value) ? value : `${value}Z`;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function parseRequiredUtcDate(value: string): Date {
  return parseUtcDate(value) ?? new Date(0);
}

function toRichText(value: unknown): RichTextDoc | null {
  if (!value || typeof value !== "object") return null;
  const doc = value as RichTextDoc;
  if (doc.type !== "doc" || !Array.isArray(doc.content)) return null;
  return doc;
}

export function mapPage<D, M>(dto: PageDto<D>, map: (item: D) => M): Page<M> {
  return {
    items: dto.items.map(map),
    page: dto.page,
    pageSize: dto.pageSize,
    totalItems: dto.totalItems,
    totalPages: dto.totalPages,
  };
}

export function mapNewsCategory(dto: NewsCategoryDto): NewsCategory {
  return { id: dto.id, name: dto.name, slug: dto.slug, sortOrder: dto.sortOrder };
}

export function mapNewsSummary(dto: NewsSummaryDto): NewsSummary {
  return {
    id: dto.id,
    title: dto.title,
    slug: dto.slug,
    excerpt: dto.excerpt,
    coverImage: dto.coverImage,
    category: dto.category ? mapNewsCategory(dto.category) : null,
    publishedAt: parseUtcDate(dto.publishedAt),
    featured: dto.featured,
  };
}

export function mapNewsDetail(dto: NewsDetailDto): NewsDetail {
  return {
    ...mapNewsSummary(dto),
    content: toRichText(dto.content),
    updatedAt: parseUtcDate(dto.updatedAt),
    seoTitle: dto.seoTitle,
    seoDescription: dto.seoDescription,
    previous: dto.previous,
    next: dto.next,
    related: (dto.related ?? []).map(mapNewsSummary),
  };
}

export function mapConcertSummary(dto: ConcertSummaryDto): ConcertSummary {
  return {
    id: dto.id,
    title: dto.title,
    slug: dto.slug,
    shortDescription: dto.shortDescription,
    posterImage: dto.posterImage,
    eventStatus: dto.eventStatus,
    startsAt: parseRequiredUtcDate(dto.startsAt),
    timezone: dto.timezone,
    newStartsAt: parseUtcDate(dto.newStartsAt),
    city: dto.city,
    country: dto.country,
    venueName: dto.venueName,
    ageRestriction: dto.ageRestriction,
    ticketUrl: dto.ticketUrl,
    featured: dto.featured,
  };
}

function mapConcertParticipant(dto: ConcertParticipantDto): ConcertParticipant {
  return { id: dto.id, name: dto.name, url: dto.url, sortOrder: dto.sortOrder };
}

export function mapConcertDetail(dto: ConcertDetailDto): ConcertDetail {
  return {
    ...mapConcertSummary(dto),
    description: toRichText(dto.description),
    doorsOpenAt: parseUtcDate(dto.doorsOpenAt),
    venueAddress: dto.venueAddress,
    mapUrl: dto.mapUrl,
    ticketProvider: dto.ticketProvider,
    organizerName: dto.organizerName,
    organizerUrl: dto.organizerUrl,
    cancellationReason: dto.cancellationReason,
    seoTitle: dto.seoTitle,
    seoDescription: dto.seoDescription,
    participants: (dto.participants ?? []).map(mapConcertParticipant),
  };
}

export function mapSocialLink(dto: SocialLinkDto): SocialLink {
  return {
    id: dto.id,
    platform: dto.platform,
    title: dto.title,
    url: dto.url,
    sortOrder: dto.sortOrder,
  };
}

export function mapBandMember(dto: BandMemberDto): BandMember {
  return {
    id: dto.id,
    name: dto.name,
    stageName: dto.stageName,
    role: dto.role,
    instrument: dto.instrument,
    biography: dto.biography,
    photo: dto.photo,
    currentMember: dto.currentMember,
    sortOrder: dto.sortOrder,
    links: (dto.links ?? []).map(mapSocialLink),
  };
}

function mapReleaseTrack(dto: ReleaseTrackDto): ReleaseTrack {
  return {
    id: dto.id,
    title: dto.title,
    duration: dto.duration,
    trackNumber: dto.trackNumber,
  };
}

export function mapReleaseLink(dto: ReleaseLinkDto): ReleaseLink {
  return { id: dto.id, platform: dto.platform, url: dto.url, sortOrder: dto.sortOrder };
}

export function mapReleaseSummary(dto: ReleaseSummaryDto): ReleaseSummary {
  return {
    id: dto.id,
    title: dto.title,
    slug: dto.slug,
    type: dto.type,
    coverImage: dto.coverImage,
    releaseDate: parseUtcDate(dto.releaseDate),
    sortOrder: dto.sortOrder,
  };
}

export function mapReleaseDetail(dto: ReleaseDetailDto): ReleaseDetail {
  return {
    ...mapReleaseSummary(dto),
    description: dto.description,
    seoTitle: dto.seoTitle,
    seoDescription: dto.seoDescription,
    tracks: (dto.tracks ?? []).map(mapReleaseTrack),
    links: (dto.links ?? []).map(mapReleaseLink),
  };
}

export function mapMediaItem(dto: MediaItemDto): MediaItem {
  return {
    id: dto.id,
    type: dto.type,
    title: dto.title,
    description: dto.description,
    fileUrl: dto.fileUrl,
    previewImageUrl: dto.previewImageUrl,
    externalUrl: dto.externalUrl,
    concertId: dto.concertId,
    publishedAt: parseUtcDate(dto.publishedAt),
    sortOrder: dto.sortOrder,
  };
}

export function mapSiteSettings(dto: SiteSettingsDto): SiteSettings {
  return {
    siteName: dto.siteName,
    bandName: dto.bandName,
    heroTitle: dto.heroTitle,
    heroSubtitle: dto.heroSubtitle,
    heroImage: dto.heroImage,
    logo: dto.logo ?? null,
    shortBiography: dto.shortBiography,
    fullBiography: toRichText(dto.fullBiography),
    contactEmail: dto.contactEmail,
    contactPhone: dto.contactPhone,
    bookingEmail: dto.bookingEmail,
    pressEmail: dto.pressEmail,
    defaultSeoTitle: dto.defaultSeoTitle,
    defaultSeoDescription: dto.defaultSeoDescription,
    defaultOgImage: dto.defaultOgImage,
  };
}

export function mapSiteData(dto: SiteDataDto): SiteData {
  return {
    settings: mapSiteSettings(dto.settings),
    socialLinks: (dto.socialLinks ?? []).map(mapSocialLink),
    musicLinks: (dto.musicLinks ?? []).map(mapReleaseLink),
  };
}
