import { data } from "react-router";
import { langFromPath, strings } from "~/i18n";

export async function clientLoader({ request }: { request: Request }) {
  const lang = langFromPath(new URL(request.url).pathname);
  throw data(strings(lang).common.notFound, { status: 404 });
}

export default function NotFound() {
  return null;
}
