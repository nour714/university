import { defineConfig, devices } from '@playwright/test';

const isCI = Boolean(process.env.CI);
const port = 5500;
const baseURL = `http://localhost:${port}`;

export default defineConfig({
  testDir: './e2e',
  timeout: 60000,
  expect: {
    timeout: 10000,
  },
  fullyParallel: false,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: 1, // Deterministic sequential tests across the seeded database
  reporter: isCI ? [['github'], ['list']] : 'list',
  globalSetup: './e2e/global-setup.ts',
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: [
    {
      name: 'Desktop Chrome',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 800 },
        channel: isCI ? undefined : 'chrome',
      },
    },
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 5'],
        viewport: { width: 390, height: 844 },
        channel: isCI ? undefined : 'chrome',
      },
    },
  ],
  webServer: {
    command: 'npm run start -- -p 5500',
    url: baseURL,
    timeout: 120000,
    reuseExistingServer: !isCI,
    env: {
      NODE_ENV: 'production',
      E2E_HTTP_ONLY: '1',
      PORT: '5500',
      DATABASE_URL_OWNER: 'postgres://postgres:postgres@localhost:5434/postgres?sslmode=disable',
      DATABASE_URL_APP: 'postgres://academic_app:test_app_pass_32_chars_minimum@localhost:5434/postgres?sslmode=disable',
      DATABASE_URL_GRADER: 'postgres://academic_grader:test_grader_pass_32_chars_minimum@localhost:5434/postgres?sslmode=disable',
      APP_SECRET: 'test_app_secret_32_characters_minimum_length',
      CODE_PEPPER: 'test_code_pepper_32_characters_minimum_length',
      CRON_SECRET: 'test_cron_secret_16_min',
      DB_SSL: 'disable',
      DB_POOL_MAX: '5',
    },
  },
});
