// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/e2e',
  timeout: 120000,
  expect: {
    timeout: 30000
  },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [
    ['html'],
    ['list']
  ],
  use: {
    baseURL: 'http://localhost:1234',
    actionTimeout: 30000,
    navigationTimeout: 30000,
    trace: 'on',
    video: 'on-first-retry',
    screenshot: 'only-on-failure',
    launchOptions: {
      args: ['--disable-gpu', '--no-sandbox', '--disable-setuid-sandbox']
    }
  },

  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome']
      },
    }
  ],

  // CI環境ではwebServer設定を無効化（GitHub Actionsで別途サーバーを起動）
  ...(!process.env.CI && {
    webServer: {
      command: 'python backend/app.py',
      port: 1234,
      reuseExistingServer: true,
      timeout: 120000,
    }
  })
});
