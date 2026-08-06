import type { Route } from "./+types/members-edit";
import { getMember } from "~/api/admin-api";
import { MemberForm } from "~/components/admin/MemberForm";
import { PageSkeleton } from "~/components/common/PageSkeleton";
import { ErrorState } from "~/components/common/States";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const id = Number(params.id);
  if (!Number.isFinite(id)) return { member: null };
  return { member: await getMember(id).catch(() => null) };
}

export function HydrateFallback() {
  return <PageSkeleton label="Загрузка участника" />;
}

export default function AdminMembersEdit({ loaderData }: Route.ComponentProps) {
  if (!loaderData.member) {
    return <ErrorState title="Участник не найден" />;
  }

  return <MemberForm member={loaderData.member} />;
}
