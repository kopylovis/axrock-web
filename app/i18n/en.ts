import type { Strings } from "./ru";

/** Название группы в английской версии не переводится — это имя собственное. */
const BAND = "Angel-Hranitel";

export const en: Strings = {
  nav: {
    about: "About",
    news: "News",
    concerts: "Shows",
    music: "Music",
    media: "Media",
    contacts: "Contact",
  },

  header: {
    toHome: "home",
    mainNav: "Main navigation",
    mobileNav: "Mobile navigation",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    online: "Find us online",
    switchTo: "Перейти на русскую версию",
    langShort: "RU",
  },

  footer: {
    sections: "Sections",
    more: "More",
    photoVideo: "Photos & video",
    siteSections: "Site sections",
    moreSections: "More sections",
    privacy: "Privacy policy",
    consent: "Data processing consent",
  },

  common: {
    loading: "Loading…",
    skipToContent: "Skip to content",
    toTop: "Back to top",
    pagination: "Pagination",
    prev: "← Previous",
    next: "Next →",
    externalHint: "The link opens on an external site in a new tab",
    externalNote: "— opens on an external site",
    socialLinks: "Social networks",
    musicLinks: "Streaming platforms",
    errorTitle: "Could not load the data",
    errorDescription: "Please refresh the page in a little while.",
    notFound: "Page not found",
  },

  home: {
    heroShows: "Tour dates",
    heroListen: "Listen",
    metaTitle: "Angel-Hranitel — official band site",
    metaDescription:
      "Official site of the Russian rock band Angel-Hranitel: tour dates, news, discography, photos and video.",
    marquee: [
      "Storytellers of mystical lyrics and horror tales",
      "Ambassadors of dark fantasy narrative backed by overdriven guitars",
    ],
    eventsEyebrow: "Live",
    eventsTitle: "Upcoming shows",
    eventsAll: "All dates",
    eventsEmptyTitle: "New dates are coming soon",
    eventsEmptyDescription: "Follow the news and our socials — we announce them there first.",
    newsEyebrow: "News",
    newsTitle: "Latest posts",
    newsAll: "All news",
    musicEyebrow: "Music",
    musicTitle: "Discography",
    musicAll: "All releases",
    videoEyebrow: "Video",
    videoTitle: "Clips and live footage",
    videoAll: "Full gallery",
    videoFallback: "Video",
    socialEyebrow: "Follow",
    socialTitle: "Social networks",
    listenEyebrow: "Platforms",
    listenTitle: "Listen",
  },

  about: {
    metaTitle: "About the band",
    metaDescription:
      "History of the Russian rock band Angel-Hranitel: line-up, musical direction and releases.",
    eyebrow: "About the band",
    photoAlt: (band: string) => `${band} band photo`,
    bioEmptyTitle: "The biography is coming soon",
    bioEmptyDescription: "This section is filled in through the site's admin panel.",
    lineup: "Line-up",
    formerMembers: "Former members",
    releases: "Releases",
    allReleases: "Full discography",
    more: "See also",
    bandNews: "Band news",
    concertPoster: "Tour dates",
  },

  news: {
    metaTitle: "News",
    metaDescription: "News from the rock band Angel-Hranitel: releases, shows, interviews and announcements.",
    eyebrow: "News",
    title: "What the band is up to",
    lead: "Show announcements, releases and everything worth telling.",
    all: "All",
    emptyTitle: "No posts yet",
    emptyInCategory: "There are no posts in this category yet. Have a look at the other sections.",
    emptyDescription: "News will appear here as soon as we publish it.",
    featured: "Featured",
    backToNews: "← All news",
    updated: (date: string) => `updated ${date}`,
    share: "Share",
    previous: "Previous",
    next: "Next",
    relatedEyebrow: "Read also",
    relatedTitle: "Related posts",
    notFound: "Post not found",
  },

  concerts: {
    metaTitle: "Shows",
    metaDescription: "Angel-Hranitel tour dates: upcoming shows and tickets.",
    eyebrow: "Live",
    title: "Shows",
    lead: "Tickets are sold on the promoters' own sites — we only link to them.",
    upcoming: "Upcoming",
    upcomingCount: (count: number) => `${count} ${count === 1 ? "date" : "dates"}`,
    emptyTitle: "New dates are coming soon",
    emptyDescription: "Follow the band on social networks to hear about them first.",
    headliner: "Headline show",
    buyTicket: "Get tickets",
    soldOut: "Sold out",
    ticketsSoon: "Tickets on sale soon",
    ticketHint: "Tickets are sold on the promoter's site, which opens in a new tab",
    backToConcerts: "← All shows",
    notFound: "Show not found",
    cancelled: "Show cancelled",
    postponed: "Show postponed",
    oldDate: "Previous date:",
    newDate: "New date:",
    newDateSoon: "The new date will be announced separately.",
    dateAndTime: "Date and time",
    doorsOpen: "Doors open",
    venue: "Venue",
    openMap: "Open in maps →",
    organizer: "Promoter",
    participants: "Line-up",
    posterAlt: (title: string) => `Poster: ${title}`,
    ticketNote:
      "Tickets are sold on the promoter's external site. We do not take payments and do not store payment details.",
  },

  music: {
    metaTitle: "Music and discography",
    metaDescription:
      "Angel-Hranitel discography: albums, live recordings and singles, tracklists and links to streaming platforms.",
    eyebrow: "Discography",
    title: "Music",
    lead: "Albums, live recordings and singles. Listen on whichever platform suits you.",
    emptyTitle: "Releases are coming soon",
    emptyDescription: "The discography is filled in through the admin panel.",
    allSections: "All sections",
    categoryEmptyTitle: "Nothing here yet",
    categoryEmptyDescription: "There are no releases in this section yet.",
    categoryNotFound: "Section not found",
    coverAlt: (title: string) => `Cover: ${title}`,
    tracks: (count: number) => `${count} ${count === 1 ? "track" : "tracks"}`,
    releaseCount: (count: number) => `${count} ${count === 1 ? "release" : "releases"}`,
    categoryMetaTitle: (title: string) => `${title} — discography`,
    categoryMetaDescription: (description: string) =>
      `${description} ${BAND}: tracklists and links to streaming platforms.`,
  },

  media: {
    metaTitle: "Photos and video",
    metaDescription:
      "Photos and video of Angel-Hranitel: shows, backstage, posters and release artwork.",
    eyebrow: "Gallery",
    title: "Photos and video",
    lead: "Shots from the shows, backstage and official materials.",
    allTypes: "All",
    photo: "Photos",
    video: "Video",
    poster: "Posters",
    cover: "Artwork",
    photoAlt: "Band photo",
    viewer: "Media viewer",
    previous: "Previous",
    next: "Next",
    close: "Close viewer",
    emptyTitle: "No media yet",
    emptyDescription: "Photos and video will appear here after the upcoming shows.",
  },

  contacts: {
    metaTitle: "Contact",
    metaDescription:
      "Contact Angel-Hranitel: management and show booking, phone, Telegram and email, social networks and streaming platforms.",
    eyebrow: "Get in touch",
    title: "Contact",
    manager: "Management / show booking:",
    phone: "Tel.:",
    telegram: "Telegram:",
    max: "Max:",
    email: "E-mail:",
    vk: "VK:",
    emptyTitle: "Contacts are coming soon",
    emptyDescription: "This section is filled in through the site's admin panel.",
    social: "Social networks",
    listen: "Listen",
  },

  breadcrumbs: {
    home: "Home",
  },

  concertStatus: {
    ANNOUNCED: "Announced",
    SOLD_OUT: "Sold out",
    CANCELLED: "Cancelled",
    POSTPONED: "Postponed",
    COMPLETED: "Played",
  },

  concertStatusShort: {
    ANNOUNCED: "Announced",
    SOLD_OUT: "Sold out",
    CANCELLED: "Cancelled",
    POSTPONED: "Postponed",
    COMPLETED: "Played",
  },

  releaseTypes: {
    ALBUM: "Album",
    EP: "EP",
    SINGLE: "Single",
    LIVE: "Live",
    COMPILATION: "Compilation",
  },

  releaseCategories: {
    albums: { title: "Albums", description: "Full-length studio works." },
    ep: { title: "EPs", description: "Shorter than an album, longer than a single." },
    singles: { title: "Singles", description: "Standalone songs and non-album work." },
    live: { title: "Live", description: "Live recordings." },
    compilations: { title: "Compilations", description: "Compilations and reissues." },
  },

  error: {
    code: "Error",
    notFoundTitle: "Page not found",
    notFoundText: "The page may have moved or the link may be out of date.",
    title: "Something went wrong",
    text: "Unexpected error. Please refresh the page.",
    unexpected: "Unexpected error.",
    toHome: "Back home",
  },

  cookies: {
    label: "Cookie notice",
    text: "This site uses cookies for visit statistics.",
    policy: "Privacy policy",
    accept: "Got it",
  },

  legal: {
    eyebrow: "Legal",
  },

  privacy: {
    metaTitle: "Privacy policy",
    metaDescription: "Privacy policy of the official Angel-Hranitel website.",
    title: "Privacy policy",
    generalTitle: "General",
    generalText: (band: string) =>
      `This policy describes what data the official website of ${band} processes and for what purpose. By using the site you agree to the terms set out below.`,
    dataTitle: "What data is processed",
    dataIntro: "The site is informational and does not require registration. We may process:",
    dataItems: [
      "technical request data: IP address, browser and device type, pages visited;",
      "anonymised web analytics data;",
      "the contents of your message, if you write to us at the address given.",
    ],
    notCollectedTitle: "What the site does not collect",
    notCollectedText:
      "The site does not sell tickets and does not take payments. We neither request nor store bank card data, payment details or order information. Ticket purchases happen via an external link to the promoter's site, where its own data policy applies.",
    cookiesTitle: "Cookies",
    cookiesText:
      "Cookies and similar technologies keep the site working and power web analytics: a Yandex.Metrica counter collects anonymised statistics — referral source, pages viewed, device and browser type. The admin area stores its sign-in marker in the browser local storage and is available only to the band staff. You can disable cookies in your browser settings, but this may affect parts of the site.",
    thirdPartiesTitle: "Sharing with third parties",
    thirdPartiesText:
      "We do not share personal data with third parties except where required by law. When you follow external links to streaming platforms, social networks and ticket agents, our site passes no personal data to them.",
    retentionTitle: "Retention",
    retentionText:
      "Technical logs are kept no longer than needed to operate and secure the site. Correspondence is kept for as long as it takes to resolve the matter you contacted us about.",
    rightsTitle: "Your rights",
    rightsText:
      "You may request information about the processing of your data, its correction or its deletion.",
    rightsContact: "To do so, write to",
    changesTitle: "Changes to this policy",
    changesText:
      "We may update this policy. The current version is always published on this page.",
  },

  consent: {
    metaTitle: "Consent to personal data processing",
    metaDescription:
      "Terms of consent to personal data processing on the official Angel-Hranitel website.",
    title: "Consent to personal data processing",
    subjectTitle: "Subject of the consent",
    subjectText:
      "By writing to the contacts listed on the site, you consent to the processing of the personal data contained in your message, to the extent needed to reply to it.",
    dataTitle: "Data covered",
    dataItems: [
      "the name or alias you signed with;",
      "your email address or another contact you provided;",
      "the contents of your message.",
    ],
    purposeTitle: "Purpose of processing",
    purposeText:
      "The data is processed solely to review your message, prepare a reply and, where needed, agree the terms of a show or of editorial cooperation.",
    actionsTitle: "Operations performed",
    actionsText:
      "Processing covers collection, recording, storage, correction, use and deletion of the data. No automated decision-making is carried out on the basis of your data.",
    revokeTitle: "Duration and withdrawal",
    revokeText:
      "The consent is valid until the purposes of processing are met or until it is withdrawn. You may withdraw it at any time by sending a message",
    revokeOn: "to",
    revokeTail:
      ". After withdrawal the data is deleted unless there are other lawful grounds to keep it.",
    relatedTitle: "Related documents",
    relatedText: "Detailed processing terms are described in the",
    relatedLink: "privacy policy",
  },
};
