import type {
  ConcertEventStatus,
  MediaType,
  PublicationStatus,
  ReleaseType,
  RichTextDoc,
} from "~/types/content";

export interface PageDto<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface NewsCategoryDto {
  id: number;
  name: string;
  slug: string;
  sortOrder: number;
  nameEn?: string | null;
}

export interface NewsSummaryDto {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  category: NewsCategoryDto | null;
  publishedAt: string | null;
  featured: boolean;
  titleEn?: string | null;
  excerptEn?: string | null;
}

export interface NewsNeighbourDto {
  title: string;
  slug: string;
}

export interface NewsDetailDto extends NewsSummaryDto {
  /** Отдаётся только административным API — публичное всегда возвращает опубликованное. */
  status?: PublicationStatus;
  content: RichTextDoc | null;
  updatedAt: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  contentEn?: RichTextDoc | null;
  seoTitleEn?: string | null;
  seoDescriptionEn?: string | null;
  previous: NewsNeighbourDto | null;
  next: NewsNeighbourDto | null;
  related: NewsSummaryDto[];
}

export interface ConcertParticipantDto {
  id: number;
  name: string;
  url: string | null;
  sortOrder: number;
}

export interface ConcertSummaryDto {
  id: number;
  title: string;
  slug: string;
  shortDescription: string | null;
  posterImage: string | null;
  eventStatus: ConcertEventStatus;
  startsAt: string;
  timezone: string;
  newStartsAt: string | null;
  city: string;
  country: string;
  venueName: string;
  ageRestriction: string | null;
  ticketUrl: string | null;
  featured: boolean;
  titleEn?: string | null;
  shortDescriptionEn?: string | null;
  cityEn?: string | null;
  countryEn?: string | null;
  venueNameEn?: string | null;
}

export interface ConcertDetailDto extends ConcertSummaryDto {
  /** Отдаётся только административным API. */
  publicationStatus?: PublicationStatus;
  description: RichTextDoc | null;
  doorsOpenAt: string | null;
  venueAddress: string | null;
  mapUrl: string | null;
  ticketProvider: string | null;
  organizerName: string | null;
  organizerUrl: string | null;
  cancellationReason: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  descriptionEn?: RichTextDoc | null;
  seoTitleEn?: string | null;
  seoDescriptionEn?: string | null;
  participants: ConcertParticipantDto[];
}

export type LinkKind = "SOCIAL" | "MUSIC";

export interface SocialLinkDto {
  id: number;
  platform: string;
  title: string;
  url: string;
  sortOrder: number;
  kind?: LinkKind;
  visible?: boolean;
  iconOnly?: boolean;
  titleEn?: string | null;
}

export interface BandMemberDto {
  id: number;
  name: string;
  nameEn?: string | null;
  roleEn?: string | null;
  instrumentEn?: string | null;
  biographyEn?: string | null;
  stageName: string | null;
  role: string;
  instrument: string | null;
  biography: string | null;
  photo: string | null;
  currentMember: boolean;
  sortOrder: number;
  /** Отдаётся только административным API — публичное всегда возвращает видимых. */
  visible?: boolean;
  links: SocialLinkDto[];
}

export interface ReleaseTrackDto {
  id: number;
  title: string;
  duration: string | null;
  trackNumber: number;
  titleEn?: string | null;
}

export interface ReleaseLinkDto {
  id: number;
  platform: string;
  url: string;
  sortOrder: number;
  iconOnly?: boolean;
}

export interface ReleaseSummaryDto {
  id: number;
  title: string;
  titleEn?: string | null;
  slug: string;
  type: ReleaseType;
  coverImage: string | null;
  releaseDate: string | null;
  sortOrder: number;
}

export interface ReleaseDetailDto extends ReleaseSummaryDto {
  /** Отдаётся только административным API — публичное всегда возвращает опубликованное. */
  published?: boolean;
  description: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  descriptionEn?: string | null;
  seoTitleEn?: string | null;
  seoDescriptionEn?: string | null;
  tracks: ReleaseTrackDto[];
  links: ReleaseLinkDto[];
}

export interface MediaItemDto {
  id: number;
  type: MediaType;
  title: string | null;
  description: string | null;
  fileUrl: string | null;
  previewImageUrl: string | null;
  externalUrl: string | null;
  concertId: number | null;
  publishedAt: string | null;
  sortOrder: number;
  titleEn?: string | null;
  descriptionEn?: string | null;
}

export interface MusicSectionDto {
  slug: string;
  image: string | null;
}

export interface SiteSettingsDto {
  siteName: string;
  bandName: string;
  siteNameEn?: string | null;
  bandNameEn?: string | null;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string | null;
  logo: string | null;
  shortBiography: string | null;
  fullBiography: RichTextDoc | null;
  contactEmail: string | null;
  contactPhone: string | null;
  bookingEmail: string | null;
  pressEmail: string | null;
  managerName: string | null;
  managerNameEn?: string | null;
  managerTelegram: string | null;
  managerMaxPhone: string | null;
  managerVkUrl: string | null;
  defaultSeoTitle: string | null;
  defaultSeoDescription: string | null;
  defaultOgImage: string | null;
  heroTitleEn?: string | null;
  heroSubtitleEn?: string | null;
  shortBiographyEn?: string | null;
  fullBiographyEn?: RichTextDoc | null;
  defaultSeoTitleEn?: string | null;
  defaultSeoDescriptionEn?: string | null;
}

export interface SiteDataDto {
  settings: SiteSettingsDto;
  socialLinks: SocialLinkDto[];
  musicLinks: ReleaseLinkDto[];
}
