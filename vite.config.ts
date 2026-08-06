import { reactRouter } from "@react-router/dev/vite";
import { defineConfig, loadEnv } from "vite";

// Project-page GitHub Pages отдаёт сайт из подпапки /<repo>/, свой домен — из корня.
// .env читаем вручную: этот конфиг вычисляется до его автоматической загрузки, тогда
// как react-router.config.ts значение уже видит. Без loadEnv базовый путь применялся
// бы наполовину — страницы в подпапке, а ссылки на статику из корня.
export default defineConfig(({ mode }) => ({
  base: process.env.VITE_BASE_PATH ?? loadEnv(mode, process.cwd(), "VITE_").VITE_BASE_PATH ?? "/",
  plugins: [reactRouter()],
  resolve: {
    tsconfigPaths: true,
  },
  css: {
    modules: {
      localsConvention: "camelCaseOnly",
    },
  },
  server: {
    port: 5173,
  },
}));
