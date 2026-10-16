import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/browser",
  workers: 1,
  use: { baseURL: "http://localhost:3210", headless: true, channel: process.env.PLAYWRIGHT_BROWSER_CHANNEL },
  webServer: process.env.I18N_REUSE_SERVER === "1" ? undefined : { command: "node tests/serve-i18n.mjs", url: "http://localhost:3210/login", reuseExistingServer: false, timeout: 120_000 },
});


