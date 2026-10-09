import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests',
  testMatch: /.*\.spec\.ts/,
  timeout: 120_000,
  fullyParallel: true,
  reporter: [['list']],
  use: { reducedMotion: 'reduce' },
});
