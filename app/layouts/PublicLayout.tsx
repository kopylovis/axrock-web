import { Outlet, useRouteLoaderData } from "react-router";
import type { Route } from "./+types/PublicLayout";
import { Header } from "~/components/layout/Header";
import { Footer } from "~/components/layout/Footer";
import { ScrollToTopButton } from "~/components/common/ScrollButtons";
import { fetchSiteData } from "~/api/public-api";
import { FALLBACK_SITE_DATA } from "~/lib/site-defaults";
import type { SiteData } from "~/types/content";

async function load() {
  try {
    return { site: await fetchSiteData() };
  } catch {
    return { site: FALLBACK_SITE_DATA };
  }
}

export async function loader() {
  return load();
}

export async function clientLoader() {
  return load();
}

export function useSiteData(): SiteData {
  const data = useRouteLoaderData<typeof loader>("layouts/PublicLayout");
  return data?.site ?? FALLBACK_SITE_DATA;
}

export default function PublicLayout({ loaderData }: Route.ComponentProps) {
  const site = loaderData?.site ?? FALLBACK_SITE_DATA;

  return (
    <>
      <a href="#main" className="skip-link">
        Перейти к содержимому
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
    </>
  );
}
