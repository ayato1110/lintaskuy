import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.spec.ts',
  fullyParallel: false,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:5173/lintaskuy',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev -- --port 5173 --strictPort',
    url: 'http://localhost:5173/lintaskuy',
    reuseExistingServer: true,
    timeout: 60_000,
  },
  projects: [
    {
      name: 'chromium-desktop',
      use: { viewport: { width: 1280, height: 800 } },
    },
    {
      name: 'chromium-mobile',
      use: { viewport: { width: 390, height: 844 }, hasTouch: true },
    },
  ],
});