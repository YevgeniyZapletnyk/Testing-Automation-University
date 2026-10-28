import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    setupFiles: ['tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: [['text', { skipFull: false }], 'html', 'json', 'json-summary'],
      include: ['src/**/*.ts'],
      thresholds: {
        lines: 80,
        branches: 90,
        functions: 100,
      },
    },
  },
});
