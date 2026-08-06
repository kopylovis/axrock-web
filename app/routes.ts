import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from "@react-router/dev/routes";

export default [
  layout("layouts/PublicLayout.tsx", [
    index("routes/home.tsx"),
    route("about", "routes/about.tsx"),
    route("news", "routes/news.tsx"),
    route("news/:slug", "routes/news-detail.tsx"),
    route("concerts", "routes/concerts.tsx"),
    route("concerts/:slug", "routes/concert-detail.tsx"),
    route("music", "routes/music.tsx"),
    route("media", "routes/media.tsx"),
    route("contacts", "routes/contacts.tsx"),
    route("privacy", "routes/privacy.tsx"),
    route("personal-data-consent", "routes/personal-data-consent.tsx"),
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
      route("members", "routes/admin/members-list.tsx"),
      route("members/new", "routes/admin/members-new.tsx"),
      route("members/:id", "routes/admin/members-edit.tsx"),
      route("releases", "routes/admin/releases-list.tsx"),
      route("releases/new", "routes/admin/releases-new.tsx"),
      route("releases/:id", "routes/admin/releases-edit.tsx"),
      route("media", "routes/admin/media.tsx"),
      route("settings", "routes/admin/settings.tsx"),
      route("users", "routes/admin/users.tsx"),
      route("profile", "routes/admin/profile.tsx"),
      route("social-links", "routes/admin/social-links.tsx"),
    ]),
  ]),

  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;
