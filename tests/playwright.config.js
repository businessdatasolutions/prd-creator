/**
 * Playwright Configuration for PRD-Builder E2E Tests
 */

const { defineConfig, devices } = require('@playwright/test');
const path = require('path');

module.exports = defineConfig({
  // Test directory
  testDir: './',
  
  // Test match pattern
  testMatch: 'playwright-tests.js',
  
  // Maximum time one test can run for
  timeout: 30 * 1000,
  
  // Maximum time expect() should wait for condition
  expect: {
    timeout: 5000
  },
  
  // Run tests in parallel
  fullyParallel: true,
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Number of workers on CI, use default locally
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter to use
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
    ['json', { outputFile: 'test-results.json' }]
  ],
  
  // Shared settings for all projects
  use: {
    // Base URL for the application
    baseURL: 'file://' + path.resolve(__dirname, '../index.html'),
    
    // Collect trace when retrying the failed test
    trace: 'on-first-retry',
    
    // Screenshot on failure
    screenshot: 'only-on-failure',
    
    // Video on failure
    video: 'retain-on-failure',
    
    // Viewport size
    viewport: { width: 1280, height: 720 },
    
    // Ignore HTTPS errors
    ignoreHTTPSErrors: true,
    
    // Locale
    locale: 'en-US',
    
    // Timezone
    timezoneId: 'America/New_York',
  },
  
  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Chrome specific options
        launchOptions: {
          args: [
            '--allow-file-access-from-files',
            '--disable-web-security'
          ]
        }
      },
    },
    
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        launchOptions: {
          firefoxUserPrefs: {
            'security.fileuri.strict_origin_policy': false
          }
        }
      },
    },
    
    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        launchOptions: {
          args: ['--disable-web-security']
        }
      },
    },
    
    // Test against mobile viewports
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
    
    // Test against tablet viewports
    {
      name: 'iPad',
      use: { ...devices['iPad (gen 7)'] },
    },
  ],
  
  // Run local dev server before starting tests
  webServer: process.env.CI ? {
    command: 'npx http-server .. -p 8080',
    port: 8080,
    reuseExistingServer: !process.env.CI,
  } : undefined,
});