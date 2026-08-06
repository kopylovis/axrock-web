import type { Route } from "./+types/news-edit";
import { getNews, listNewsCategories } from "~/api/admin-api";
import { NewsForm } from "~/components/admin/NewsForm";
import { PageSkeleton } from "~/components/common/PageSkeleton";
import { ErrorState } from "~/components/common/States";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const id = Number(params.id);
  if (!Number.isFinite(id)) return { article: null, categories: [] };

  const [article, categories] = await Promise.all([
    getNews(id).catch(() => null),
    listNewsCategories().catch(() => []),
  ]);

  return { article, categories };
}

export function HydrateFallback() {
  return <PageSkeleton label="Загрузка новости" />;
}

export default function AdminNewsEdit({ loaderData }: Route.ComponentProps) {
  const { article, categories } = loaderData;

  if (!article) {
    return <ErrorState title="Новость не найдена" description="Возможно, её удалили." />;
  }

  return <NewsForm article={article} categories={categories} />;
}
