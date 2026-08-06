import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";

// На project-page GitHub Pages сайт живёт в подпапке /<repo>/, на своём домене — в корне.
const BASE_PATH = process.env.VITE_BASE_PATH ?? "/";

export default defineConfig({
  base: BASE_PATH,
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
});
