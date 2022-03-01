import { PlaywrightTestConfig } from "@playwright/test";

const config: PlaywrightTestConfig = {
  testDir: "tests",
  retries: 1,
  forbidOnly: Boolean(process.env.CI),
  webServer: {
    command: "npm run serve",
    port: 9000,
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: "http://localhost:9000/",
    launchOptions: {
      slowMo: process.env.SLOW ? parseInt(process.env.SLOW) : undefined,
    },
    trace: "on-first-retry",
    video: "on-first-retry",
  },
};

export default config;
