import { PlaywrightTestConfig } from "@playwright/test";

const config: PlaywrightTestConfig = {
  testDir: "tests",
  retries: 1,
  forbidOnly: Boolean(process.env.CI),
  reporter: process.env.CI ? "github" : [["html"], ["list"]],
  webServer: {
    command: "npm run serve",
    port: 1234,
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: "http://localhost:1234/",
    launchOptions: {
      slowMo: process.env.SLOW ? parseInt(process.env.SLOW) : undefined,
    },
    trace: "on-first-retry",
    video: "on-first-retry",
  },
};

export default config;
