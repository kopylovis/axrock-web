/**
 * Адрес страницы сайта для обычной ссылки из админки.
 *
 * React Router сам подставляет basename в <Link>, но для <a target="_blank">
 * этого не происходит: путь «/concerts/x» на project-page GitHub Pages увёл бы
 * в корень домена мимо подпапки. BASE_URL всегда оканчивается слэшем и равен «/»,
 * когда сайт живёт в корне, — поэтому при переезде на свой домен править нечего.
 */
export function publicSiteUrl(path = ""): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;
}
