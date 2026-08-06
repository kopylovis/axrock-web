import type { Route } from "./+types/concerts-edit";
import { getConcert } from "~/api/admin-api";
import { ConcertForm } from "~/components/admin/ConcertForm";
import { PageSkeleton } from "~/components/common/PageSkeleton";
import { ErrorState } from "~/components/common/States";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const id = Number(params.id);
  if (!Number.isFinite(id)) return { concert: null };
  return { concert: await getConcert(id).catch(() => null) };
}

export function HydrateFallback() {
  return <PageSkeleton label="Загрузка концерта" />;
}

export default function AdminConcertsEdit({ loaderData }: Route.ComponentProps) {
  if (!loaderData.concert) {
    return <ErrorState title="Концерт не найден" description="Возможно, его удалили." />;
  }

  return <ConcertForm concert={loaderData.concert} />;
}
