const { defineConfig } = require('@playwright/test');
const path = require('path');

module.exports = defineConfig({
  testDir: './tests',
  testMatch: '**/*test.js',
  timeout: 30000,
  fullyParallel: false,
  reporter: 'list',
  use: {
    headless: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { 
        browserName: 'chromium',
        launchOptions: {
          args: ['--allow-file-access-from-files', '--disable-web-security']
        }
      },
    },
  ],
});