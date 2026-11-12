import { defineConfig } from '@playwright/test';
import base from './playwright.config';
export default defineConfig({
  ...base,
  testDir: './experiments',
  outputDir: './evidence/experiment-output',
  fullyParallel: false,
  workers: 1,
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
  reporter: [
    ['list'],
    [
      'json',
      { outputFile: process.env.RESULT_FILE || 'evidence/experiment.json' },
    ],
  ],
});
