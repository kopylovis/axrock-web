import type { SiteData } from "~/types/content";

export const BAND_NAME = "Ангел-Хранитель";

/** Используется только когда backend недоступен — чтобы шапка и подвал всё равно отрисовались. */
export const FALLBACK_SITE_DATA: SiteData = {
  settings: {
    siteName: `${BAND_NAME} — официальный сайт`,
    bandName: BAND_NAME,
    heroTitle: BAND_NAME,
    heroSubtitle: "",
    heroImage: null,
    logo: null,
    shortBiography: null,
    fullBiography: null,
    contactEmail: null,
    contactPhone: null,
    bookingEmail: null,
    pressEmail: null,
    managerName: null,
    managerTelegram: null,
    managerMaxPhone: null,
    managerVkUrl: null,
    defaultSeoTitle: `${BAND_NAME} — официальный сайт группы`,
    defaultSeoDescription:
      "Официальный сайт рок-группы «Ангел-Хранитель»: новости, афиша концертов, дискография, фото и видео.",
    defaultOgImage: null,
  },
  socialLinks: [],
  musicLinks: [],
};
