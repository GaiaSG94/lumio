import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 90_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3100",
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev -- -p 3100",
    url: "http://127.0.0.1:3100",
    env: {
      ANTHROPIC_API_KEY: "",
      INFERHUB_API_KEY: "",
      ENV_USER_INFERHUB_API_KEY: "",
      TTS_API_KEY: "",
      SCAN_ELEVENLABS_1: "",
      SCAN_ELEVENLABS_2: "",
      TTS_PROVIDER: "local",
    },
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
