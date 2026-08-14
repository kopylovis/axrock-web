import { DEFAULT_LANG, pick, pickText, type Lang } from "~/i18n/config";
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

export function mapNewsCategory(dto: NewsCategoryDto, lang: Lang = DEFAULT_LANG): NewsCategory {
  return {
    id: dto.id,
    name: pickText(lang, dto.name, dto.nameEn),
    slug: dto.slug,
    sortOrder: dto.sortOrder,
  };
}

export function mapNewsSummary(dto: NewsSummaryDto, lang: Lang = DEFAULT_LANG): NewsSummary {
  return {
    id: dto.id,
    title: pickText(lang, dto.title, dto.titleEn),
    slug: dto.slug,
    excerpt: pick(lang, dto.excerpt, dto.excerptEn),
    coverImage: dto.coverImage,
    category: dto.category ? mapNewsCategory(dto.category, lang) : null,
    publishedAt: parseUtcDate(dto.publishedAt),
    featured: dto.featured,
  };
}

export function mapNewsDetail(dto: NewsDetailDto, lang: Lang = DEFAULT_LANG): NewsDetail {
  return {
    ...mapNewsSummary(dto, lang),
    content: toRichText(pick(lang, dto.content, dto.contentEn)),
    updatedAt: parseUtcDate(dto.updatedAt),
    seoTitle: pick(lang, dto.seoTitle, dto.seoTitleEn),
    seoDescription: pick(lang, dto.seoDescription, dto.seoDescriptionEn),
    previous: dto.previous,
    next: dto.next,
    related: (dto.related ?? []).map((item) => mapNewsSummary(item, lang)),
  };
}

export function mapConcertSummary(dto: ConcertSummaryDto, lang: Lang = DEFAULT_LANG): ConcertSummary {
  return {
    id: dto.id,
    title: pickText(lang, dto.title, dto.titleEn),
    slug: dto.slug,
    shortDescription: pick(lang, dto.shortDescription, dto.shortDescriptionEn),
    posterImage: dto.posterImage,
    eventStatus: dto.eventStatus,
    startsAt: parseRequiredUtcDate(dto.startsAt),
    timezone: dto.timezone,
    newStartsAt: parseUtcDate(dto.newStartsAt),
    city: pickText(lang, dto.city, dto.cityEn),
    country: pickText(lang, dto.country, dto.countryEn),
    venueName: pickText(lang, dto.venueName, dto.venueNameEn),
    ageRestriction: dto.ageRestriction,
    ticketUrl: dto.ticketUrl,
    featured: dto.featured,
  };
}

function mapConcertParticipant(dto: ConcertParticipantDto): ConcertParticipant {
  return { id: dto.id, name: dto.name, url: dto.url, sortOrder: dto.sortOrder };
}

export function mapConcertDetail(dto: ConcertDetailDto, lang: Lang = DEFAULT_LANG): ConcertDetail {
  return {
    ...mapConcertSummary(dto, lang),
    description: toRichText(pick(lang, dto.description, dto.descriptionEn)),
    doorsOpenAt: parseUtcDate(dto.doorsOpenAt),
    venueAddress: dto.venueAddress,
    mapUrl: dto.mapUrl,
    ticketProvider: dto.ticketProvider,
    organizerName: dto.organizerName,
    organizerUrl: dto.organizerUrl,
    cancellationReason: dto.cancellationReason,
    seoTitle: pick(lang, dto.seoTitle, dto.seoTitleEn),
    seoDescription: pick(lang, dto.seoDescription, dto.seoDescriptionEn),
    participants: (dto.participants ?? []).map(mapConcertParticipant),
  };
}

export function mapSocialLink(dto: SocialLinkDto, lang: Lang = DEFAULT_LANG): SocialLink {
  return {
    id: dto.id,
    platform: dto.platform,
    title: pickText(lang, dto.title, dto.titleEn),
    url: dto.url,
    sortOrder: dto.sortOrder,
    iconOnly: dto.iconOnly ?? false,
  };
}

export function mapBandMember(dto: BandMemberDto, lang: Lang = DEFAULT_LANG): BandMember {
  return {
    id: dto.id,
    name: pickText(lang, dto.name, dto.nameEn),
    stageName: dto.stageName,
    role: pickText(lang, dto.role, dto.roleEn),
    instrument: pick(lang, dto.instrument, dto.instrumentEn),
    biography: pick(lang, dto.biography, dto.biographyEn),
    photo: dto.photo,
    currentMember: dto.currentMember,
    sortOrder: dto.sortOrder,
    links: (dto.links ?? []).map((link) => mapSocialLink(link, lang)),
  };
}

function mapReleaseTrack(dto: ReleaseTrackDto, lang: Lang): ReleaseTrack {
  return {
    id: dto.id,
    title: pickText(lang, dto.title, dto.titleEn),
    duration: dto.duration,
    trackNumber: dto.trackNumber,
  };
}

export function mapReleaseLink(dto: ReleaseLinkDto): ReleaseLink {
  return {
    id: dto.id,
    platform: dto.platform,
    url: dto.url,
    sortOrder: dto.sortOrder,
    iconOnly: dto.iconOnly ?? false,
  };
}

export function mapReleaseSummary(dto: ReleaseSummaryDto, lang: Lang = DEFAULT_LANG): ReleaseSummary {
  return {
    id: dto.id,
    title: pickText(lang, dto.title, dto.titleEn),
    slug: dto.slug,
    type: dto.type,
    coverImage: dto.coverImage,
    releaseDate: parseUtcDate(dto.releaseDate),
    sortOrder: dto.sortOrder,
  };
}

export function mapReleaseDetail(dto: ReleaseDetailDto, lang: Lang = DEFAULT_LANG): ReleaseDetail {
  return {
    ...mapReleaseSummary(dto, lang),
    description: pick(lang, dto.description, dto.descriptionEn),
    seoTitle: pick(lang, dto.seoTitle, dto.seoTitleEn),
    seoDescription: pick(lang, dto.seoDescription, dto.seoDescriptionEn),
    tracks: (dto.tracks ?? []).map((track) => mapReleaseTrack(track, lang)),
    links: (dto.links ?? []).map(mapReleaseLink),
  };
}

export function mapMediaItem(dto: MediaItemDto, lang: Lang = DEFAULT_LANG): MediaItem {
  return {
    id: dto.id,
    type: dto.type,
    title: pick(lang, dto.title, dto.titleEn),
    description: pick(lang, dto.description, dto.descriptionEn),
    fileUrl: dto.fileUrl,
    previewImageUrl: dto.previewImageUrl,
    externalUrl: dto.externalUrl,
    concertId: dto.concertId,
    publishedAt: parseUtcDate(dto.publishedAt),
    sortOrder: dto.sortOrder,
  };
}

export function mapSiteSettings(dto: SiteSettingsDto, lang: Lang = DEFAULT_LANG): SiteSettings {
  return {
    siteName: pickText(lang, dto.siteName, dto.siteNameEn),
    bandName: pickText(lang, dto.bandName, dto.bandNameEn),
    heroTitle: pickText(lang, dto.heroTitle, dto.heroTitleEn),
    heroSubtitle: pickText(lang, dto.heroSubtitle, dto.heroSubtitleEn),
    heroImage: dto.heroImage,
    logo: dto.logo ?? null,
    shortBiography: pick(lang, dto.shortBiography, dto.shortBiographyEn),
    fullBiography: toRichText(pick(lang, dto.fullBiography, dto.fullBiographyEn)),
    contactEmail: dto.contactEmail,
    contactPhone: dto.contactPhone,
    bookingEmail: dto.bookingEmail,
    pressEmail: dto.pressEmail,
    managerName: pick(lang, dto.managerName, dto.managerNameEn),
    managerTelegram: dto.managerTelegram ?? null,
    managerMaxPhone: dto.managerMaxPhone ?? null,
    managerVkUrl: dto.managerVkUrl ?? null,
    defaultSeoTitle: pick(lang, dto.defaultSeoTitle, dto.defaultSeoTitleEn),
    defaultSeoDescription: pick(lang, dto.defaultSeoDescription, dto.defaultSeoDescriptionEn),
    defaultOgImage: dto.defaultOgImage,
  };
}

export function mapSiteData(dto: SiteDataDto, lang: Lang = DEFAULT_LANG): SiteData {
  return {
    settings: mapSiteSettings(dto.settings, lang),
    socialLinks: (dto.socialLinks ?? []).map((link) => mapSocialLink(link, lang)),
    musicLinks: (dto.musicLinks ?? []).map(mapReleaseLink),
  };
}
