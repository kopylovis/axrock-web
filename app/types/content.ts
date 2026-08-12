export type PublicationStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type ConcertEventStatus =
  | "ANNOUNCED"
  | "SOLD_OUT"
  | "CANCELLED"
  | "POSTPONED"
  | "COMPLETED";

export type ReleaseType = "ALBUM" | "EP" | "SINGLE" | "LIVE" | "COMPILATION";

export type MediaType = "PHOTO" | "VIDEO" | "POSTER" | "COVER" | "BACKSTAGE";

export interface RichTextMark {
  type: string;
  attrs?: Record<string, unknown>;
}

export interface RichTextNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: RichTextNode[];
  marks?: RichTextMark[];
  text?: string;
}

export interface RichTextDoc {
  type: "doc";
  content: RichTextNode[];
}

export interface NewsCategory {
  id: number;
  name: string;
  slug: string;
  sortOrder: number;
}

export interface NewsSummary {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  category: NewsCategory | null;
  publishedAt: Date | null;
  featured: boolean;
}

export interface NewsNeighbour {
  title: string;
  slug: string;
}

export interface NewsDetail extends NewsSummary {
  content: RichTextDoc | null;
  updatedAt: Date | null;
  seoTitle: string | null;
  seoDescription: string | null;
  previous: NewsNeighbour | null;
  next: NewsNeighbour | null;
  related: NewsSummary[];
}

export interface ConcertParticipant {
  id: number;
  name: string;
  url: string | null;
  sortOrder: number;
}

export interface ConcertSummary {
  id: number;
  title: string;
  slug: string;
  shortDescription: string | null;
  posterImage: string | null;
  eventStatus: ConcertEventStatus;
  startsAt: Date;
  timezone: string;
  newStartsAt: Date | null;
  city: string;
  country: string;
  venueName: string;
  ageRestriction: string | null;
  ticketUrl: string | null;
  featured: boolean;
}

export interface ConcertDetail extends ConcertSummary {
  description: RichTextDoc | null;
  doorsOpenAt: Date | null;
  venueAddress: string | null;
  mapUrl: string | null;
  ticketProvider: string | null;
  organizerName: string | null;
  organizerUrl: string | null;
  cancellationReason: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  participants: ConcertParticipant[];
}

export interface BandMember {
  id: number;
  name: string;
  stageName: string | null;
  role: string;
  instrument: string | null;
  biography: string | null;
  photo: string | null;
  currentMember: boolean;
  sortOrder: number;
  links: SocialLink[];
}

export interface ReleaseTrack {
  id: number;
  title: string;
  duration: string | null;
  trackNumber: number;
}

export interface ReleaseLink {
  id: number;
  platform: string;
  url: string;
  sortOrder: number;
  iconOnly: boolean;
}

export interface ReleaseSummary {
  id: number;
  title: string;
  slug: string;
  type: ReleaseType;
  coverImage: string | null;
  releaseDate: Date | null;
  sortOrder: number;
}

export interface ReleaseDetail extends ReleaseSummary {
  description: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  tracks: ReleaseTrack[];
  links: ReleaseLink[];
}

export interface MediaItem {
  id: number;
  type: MediaType;
  title: string | null;
  description: string | null;
  fileUrl: string | null;
  previewImageUrl: string | null;
  externalUrl: string | null;
  concertId: number | null;
  publishedAt: Date | null;
  sortOrder: number;
}

export interface SocialLink {
  id: number;
  platform: string;
  title: string;
  url: string;
  sortOrder: number;
  iconOnly: boolean;
}

export interface SiteSettings {
  siteName: string;
  bandName: string;
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
  managerTelegram: string | null;
  managerMaxPhone: string | null;
  managerVkUrl: string | null;
  defaultSeoTitle: string | null;
  defaultSeoDescription: string | null;
  defaultOgImage: string | null;
}

export interface SiteData {
  settings: SiteSettings;
  socialLinks: SocialLink[];
  musicLinks: ReleaseLink[];
}

export interface Page<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}
