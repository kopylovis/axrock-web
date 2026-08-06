/**
 * Технический slug для пререндера пустых разделов.
 *
 * React Router запрещает экспорт `loader` на маршрутах, ни один путь которых не попал
 * в пререндер. Отказаться от `loader` нельзя — без него у страниц новостей и концертов
 * не будет meta-тегов, а значит и превью ссылок в соцсетях. Поэтому пока раздел пуст,
 * маршрут получает этот путь, а `scripts/postbuild.mjs` удаляет его из готовой сборки.
 */
export const PRERENDER_PLACEHOLDER = "__empty";

export function isPrerenderPlaceholder(slug: string): boolean {
  return slug === PRERENDER_PLACEHOLDER;
}
