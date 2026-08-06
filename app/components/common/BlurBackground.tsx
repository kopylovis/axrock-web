/**
 * Фоновый слой: мягкие цветовые пятна и зерно.
 * Класс глобальный — по нему в global.css отделяется фон от контента страницы.
 */
export function BlurBackground() {
  return <div className="site-backdrop" aria-hidden="true" />;
}
