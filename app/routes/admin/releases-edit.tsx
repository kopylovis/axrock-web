import type { Route } from "./+types/releases-edit";
import { getRelease } from "~/api/admin-api";
import { ReleaseForm } from "~/components/admin/ReleaseForm";
import { PageSkeleton } from "~/components/common/PageSkeleton";
import { ErrorState } from "~/components/common/States";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const id = Number(params.id);
  if (!Number.isFinite(id)) return { release: null };
  return { release: await getRelease(id).catch(() => null) };
}

export function HydrateFallback() {
  return <PageSkeleton label="Загрузка релиза" />;
}

export default function AdminReleasesEdit({ loaderData }: Route.ComponentProps) {
  if (!loaderData.release) {
    return <ErrorState title="Релиз не найден" />;
  }

  return <ReleaseForm release={loaderData.release} />;
}
