import { defineConfig } from '@playwright/test';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import base from './experiments.config';
export default defineConfig({
  ...base,
  testMatch: 'diagnostic.spec.ts',
  outputDir: join(tmpdir(), 'lab6-zapletniuk-traces'),
  use: { ...base.use, trace: 'on' },
  reporter: [['list'], ['json', { outputFile: 'evidence/diagnostic.json' }]],
});
