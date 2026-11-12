import { defineConfig } from '@playwright/test';
import base from './playwright.config';
export default defineConfig({
  ...base,
  testMatch: 'variant2.spec.ts',
  outputDir: 'evidence/stability-output',
  reporter: [['list'], ['json', { outputFile: 'evidence/stability.json' }]],
});
