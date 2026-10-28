import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    exclude: ['tests/api/**'],
    setupFiles: ['tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: [['text', { skipFull: false }], 'html', 'json', 'json-summary'],
      include: ['src/**/*.ts'],
      exclude: ['src/app.ts', 'src/server.ts'],
      thresholds: {
        lines: 80,
        branches: 90,
        functions: 100,
      },
    },
  },
});
