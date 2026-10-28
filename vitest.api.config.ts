import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/api/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/app.ts'],
      reporter: ['text', 'html', 'json-summary'],
      reportsDirectory: 'coverage-api',
      thresholds: { lines: 95, branches: 90, functions: 100 },
    },
  },
});
