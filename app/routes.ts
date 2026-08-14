import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from "@react-router/dev/routes";

/**
 * Публичные страницы объявляются дважды: в корне — русская версия, под /en —
 * английская. Модули те же, язык они берут из адреса; при повторном объявлении
 * нужны собственные id, иначе маршруты столкнутся.
 */
function publicRoutes(suffix = "") {
  const id = (name: string) => (suffix ? { id: `${name}${suffix}` } : {});

  return [
    index("routes/home.tsx", id("home")),
    route("about", "routes/about.tsx", id("about")),
    route("news", "routes/news.tsx", id("news")),
    route("news/:slug", "routes/news-detail.tsx", id("news-detail")),
    route("concerts", "routes/concerts.tsx", id("concerts")),
    route("concerts/:slug", "routes/concert-detail.tsx", id("concert-detail")),
    route("music", "routes/music.tsx", id("music")),
    route("music/:category", "routes/music-category.tsx", id("music-category")),
    route("media", "routes/media.tsx", id("media")),
    route("contacts", "routes/contacts.tsx", id("contacts")),
    route("privacy", "routes/privacy.tsx", id("privacy")),
    route("personal-data-consent", "routes/personal-data-consent.tsx", id("consent")),
  ];
}

export default [
  layout("layouts/PublicLayout.tsx", [
    ...publicRoutes(),
    ...prefix("en", publicRoutes("-en")),
  ]),

  route("admin/login", "routes/admin/login.tsx"),
  ...prefix("admin", [
    layout("layouts/AdminLayout.tsx", [
      index("routes/admin/dashboard.tsx"),
      route("news", "routes/admin/news-list.tsx"),
      route("news/new", "routes/admin/news-new.tsx"),
      route("news/:id", "routes/admin/news-edit.tsx"),
      route("concerts", "routes/admin/concerts-list.tsx"),
      route("concerts/new", "routes/admin/concerts-new.tsx"),
      route("concerts/:id", "routes/admin/concerts-edit.tsx"),
      route("about", "routes/admin/about.tsx"),
      route("members", "routes/admin/members-list.tsx"),
      route("members/new", "routes/admin/members-new.tsx"),
      route("members/:id", "routes/admin/members-edit.tsx"),
      route("releases", "routes/admin/releases-list.tsx"),
      route("releases/new", "routes/admin/releases-new.tsx"),
      route("releases/:id", "routes/admin/releases-edit.tsx"),
      route("media", "routes/admin/media.tsx"),
      route("tours", "routes/admin/tours-list.tsx"),
      route("tours/:id", "routes/admin/tour-edit.tsx"),
      route("expenses", "routes/admin/expenses.tsx"),
      route("expenses-summary", "routes/admin/expenses-summary.tsx"),
      route("contacts", "routes/admin/contacts.tsx"),
      route("settings", "routes/admin/settings.tsx"),
      route("users", "routes/admin/users.tsx"),
      route("profile", "routes/admin/profile.tsx"),
      route("social-links", "routes/admin/social-links.tsx"),
    ]),
  ]),

  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;
