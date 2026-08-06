import type { Route } from "./+types/news-new";
import { listNewsCategories } from "~/api/admin-api";
import { NewsForm } from "~/components/admin/NewsForm";
import { PageSkeleton } from "~/components/common/PageSkeleton";

export async function clientLoader() {
  return { categories: await listNewsCategories().catch(() => []) };
}

export function HydrateFallback() {
  return <PageSkeleton label="Загрузка формы" />;
}

export default function AdminNewsNew({ loaderData }: Route.ComponentProps) {
  return <NewsForm article={null} categories={loaderData.categories} />;
}
