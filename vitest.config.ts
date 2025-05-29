import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    watch: false,
    setupFiles: ['packages/ui-react/vitest.setup.tsx'],
    coverage: {
      provider: 'v8',
    },
    exclude: [
      '**/node_modules/**',
      '**/types/**',
      '**/constants/**',
      '**/assets/**',
    ],
  },
}); 