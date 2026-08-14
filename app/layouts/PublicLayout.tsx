import { Outlet, useRouteLoaderData, type ShouldRevalidateFunctionArgs } from "react-router";
import type { Route } from "./+types/PublicLayout";
import { Header } from "~/components/layout/Header";
import { Footer } from "~/components/layout/Footer";
import { ScrollToTopButton } from "~/components/common/ScrollButtons";
import { Analytics } from "~/components/common/Analytics";
import { CookieNotice } from "~/components/common/CookieNotice";
import { fetchSiteData } from "~/api/public-api";
import { FALLBACK_SITE_DATA } from "~/lib/site-defaults";
import type { SiteData } from "~/types/content";
import { langFromPath, useT } from "~/i18n";

async function load(request: Request) {
  const lang = langFromPath(new URL(request.url).pathname);
  try {
    return { site: await fetchSiteData(lang) };
  } catch {
    return { site: FALLBACK_SITE_DATA };
  }
}

export async function loader({ request }: Route.LoaderArgs) {
  return load(request);
}

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  return load(request);
}

/**
 * Макет общий для русской и английской версий, поэтому при переходе между ними
 * React Router считает его уже загруженным и данные не перезапрашивает: адрес
 * этого маршрута не изменился, параметров у него нет. В итоге название группы,
 * подвал и контакты оставались на прежнем языке до перезагрузки страницы.
 */
export function shouldRevalidate({
  currentUrl,
  nextUrl,
  defaultShouldRevalidate,
}: ShouldRevalidateFunctionArgs) {
  if (langFromPath(currentUrl.pathname) !== langFromPath(nextUrl.pathname)) return true;
  return defaultShouldRevalidate;
}

export function useSiteData(): SiteData {
  const data = useRouteLoaderData<typeof loader>("layouts/PublicLayout");
  return data?.site ?? FALLBACK_SITE_DATA;
}

export default function PublicLayout({ loaderData }: Route.ComponentProps) {
  const site = loaderData?.site ?? FALLBACK_SITE_DATA;
  const t = useT();

  return (
    <>
      <a href="#main" className="skip-link">
        {t.common.skipToContent}
      </a>
      <Header
        bandName={site.settings.bandName}
        logo={site.settings.logo}
        socialLinks={site.socialLinks}
      />
      <main id="main">
        <Outlet />
      </main>
      <Footer site={site} />
      <ScrollToTopButton />
      <CookieNotice />
      <Analytics />
    </>
  );
}
