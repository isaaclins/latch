import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://latch-site.pages.dev",
  output: "static",
  trailingSlash: "never",
  compressHTML: true,
  build: {
    inlineStylesheets: "auto",
    assets: "_assets",
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "viewport",
  },
});
