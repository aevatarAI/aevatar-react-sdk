import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    watch: false,
    setupFiles: ['packages/ui-react/vitest.setup.tsx'],
    coverage: {
      provider: 'v8',
      exclude: [
        '**/node_modules/**',
        '**/types/**',
        '**/constants/**',
        '**/assets/**',
        '**/demo/**',
        '**/dist/**',
        '**/coverage/**',
        '**/scripts/**',
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.spec.ts',
        '**/*.spec.tsx',
        '**/vitest.setup.tsx',
        '**/vitest.config.ts',
      ],
    },
    exclude: [
      '**/node_modules/**',
      '**/types/**',
      '**/constants/**',
      '**/assets/**',
      '**/demo/**',
      '**/dist/**',
      '**/coverage/**',
      '**/scripts/**',
    ],
  },
}); 