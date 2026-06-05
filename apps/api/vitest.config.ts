import { defineWorkersConfig } from "@cloudflare/vitest-pool-workers/config";

export default defineWorkersConfig({
  test: {
    poolOptions: {
      workers: {
        wrangler: { configPath: "./wrangler.jsonc" },
        miniflare: {
          bindings: {
            SESSION_SECRET: "test-session-secret-32-bytes-of-random-base64",
            MAGIC_LINK_SECRET: "test-magiclink-secret-32-bytes-of-random-base64",
          },
        },
      },
    },
  },
});
