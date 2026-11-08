import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    testTimeout: 60000,
    hookTimeout: 60000,
    fileParallelism: false,
    maxConcurrency: 1,
    setupFiles: ['./test/setupEnv.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      'server-only': path.resolve(__dirname, './test/emptyModule.js'),
    },
  },
});
