# Playwright E2E Test Suite for PRD-Builder

## Overview
Comprehensive end-to-end testing suite using Playwright for automated browser testing of the PRD-Builder application.

## Test Coverage

### 1. Document Management (4 tests)
- ✅ Create new PRD documents
- ✅ Edit document titles inline
- ✅ Switch between multiple documents
- ✅ Delete documents with confirmation

### 2. Content Creation (3 tests)
- ✅ Fill all PRD sections
- ✅ Auto-save functionality
- ✅ Section collapse/expand state persistence

### 3. File Attachments (4 tests)
- ✅ Upload file attachments
- ✅ Drag and drop file upload
- ✅ Remove attachments
- ✅ File size validation (5MB limit)

### 4. Export Functionality (3 tests)
- ✅ Export to Word (.docx)
- ✅ Export to PDF
- ✅ Export to Markdown (.md)

### 5. Storage Management (3 tests)
- ✅ Monitor storage usage
- ✅ Storage full warnings
- ✅ Unsaved changes warning

### 6. Search and Navigation (2 tests)
- ✅ Search documents
- ✅ Document list dropdown

### 7. UI Responsiveness (2 tests)
- ✅ Mobile viewport (375x667)
- ✅ Tablet viewport (768x1024)

### 8. Error Handling (2 tests)
- ✅ Corrupted localStorage recovery
- ✅ CDN resource failure handling

### 9. Performance Tests (3 tests)
- ✅ Page load time (<3s)
- ✅ Document creation (<1s)
- ✅ Performance with 20+ documents

### 10. Accessibility Tests (2 tests)
- ✅ Keyboard navigation
- ✅ Screen reader labels

**Total: 28 comprehensive E2E tests**

## Installation

### Prerequisites
- Node.js 14+ installed
- npm or yarn package manager

### Setup
```bash
# Install Playwright
npm init -y  # If package.json doesn't exist
npm install --save-dev @playwright/test

# Install browsers
npx playwright install

# Install additional dependencies for CI
npm install --save-dev http-server
```

## Running Tests

### Run All Tests
```bash
# Run tests in all browsers
npx playwright test

# Run tests in specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Run tests in headed mode (see browser)
npx playwright test --headed

# Run specific test suite
npx playwright test -g "Document Management"
```

### Run Specific Test Groups
```bash
# Document tests only
npx playwright test -g "Document Management"

# Export tests only
npx playwright test -g "Export Functionality"

# Performance tests only
npx playwright test -g "Performance Tests"
```

### Debug Mode
```bash
# Run with Playwright Inspector
npx playwright test --debug

# Run with browser dev tools
npx playwright test --headed --debug
```

### Generate Test Report
```bash
# Run tests and generate HTML report
npx playwright test --reporter=html

# Open HTML report
npx playwright show-report

# Generate JSON report for CI
npx playwright test --reporter=json > test-results.json
```

## CI/CD Integration

### GitHub Actions
```yaml
name: Playwright Tests
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

### GitLab CI
```yaml
playwright-tests:
  image: mcr.microsoft.com/playwright:latest
  stage: test
  script:
    - npm ci
    - npx playwright test
  artifacts:
    when: always
    paths:
      - playwright-report/
    expire_in: 1 week
```

## Test Configuration

### Environment Variables
```bash
# Run in CI mode (no retries, fail on test.only)
CI=true npx playwright test

# Custom app URL
APP_URL=http://localhost:3000 npx playwright test

# Parallel workers
WORKERS=4 npx playwright test
```

### Custom Timeouts
```javascript
// In test file
test.setTimeout(60000); // 60 seconds for specific test

// In config
timeout: 30 * 1000, // 30 seconds global timeout
```

## Writing New Tests

### Test Structure
```javascript
test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup before each test
    await page.goto(APP_URL);
  });

  test('should do something', async ({ page }) => {
    // Arrange
    await page.click('#button');
    
    // Act
    await page.fill('#input', 'value');
    
    // Assert
    await expect(page.locator('#result')).toHaveText('expected');
  });
});
```

### Best Practices
1. **Use data-testid attributes** for reliable element selection
2. **Wait for elements** before interacting: `await page.waitForSelector()`
3. **Use explicit waits** over arbitrary timeouts
4. **Clean up test data** in afterEach hooks
5. **Keep tests independent** - each test should run in isolation
6. **Use Page Object Model** for complex applications

## Troubleshooting

### Common Issues

#### 1. File Access Errors
```bash
# Chrome needs special flags for file:// URLs
--allow-file-access-from-files
--disable-web-security
```

#### 2. localStorage Not Persisting
```javascript
// Clear and set up fresh state
await page.evaluate(() => localStorage.clear());
```

#### 3. Timeout Errors
```javascript
// Increase timeout for slow operations
await page.click('#button', { timeout: 10000 });
```

#### 4. Element Not Found
```javascript
// Wait for element to be visible
await page.waitForSelector('#element', { state: 'visible' });
```

## Debugging Tips

### 1. Take Screenshots
```javascript
await page.screenshot({ path: 'debug.png', fullPage: true });
```

### 2. Pause Execution
```javascript
await page.pause(); // Opens Playwright Inspector
```

### 3. Console Logs
```javascript
page.on('console', msg => console.log(msg.text()));
```

### 4. Network Monitoring
```javascript
page.on('request', request => console.log('>>', request.url()));
page.on('response', response => console.log('<<', response.url()));
```

## Performance Metrics

### Expected Results
- **Page Load**: < 3 seconds
- **Document Creation**: < 1 second
- **Export Generation**: < 2 seconds
- **Section Switch**: < 200ms
- **Auto-save Trigger**: 2 seconds after typing

### Browser Compatibility
- ✅ Chrome/Chromium 90+
- ✅ Firefox 85+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile Chrome
- ✅ Mobile Safari

## Test Reports

### Coverage Report
```bash
# Generate coverage report
npx playwright test --reporter=html
npx playwright show-report
```

### JSON Report for Analysis
```bash
# Generate JSON report
npx playwright test --reporter=json > results.json

# Parse with jq
cat results.json | jq '.suites[].specs[].title'
```

### Custom Reporters
```javascript
// In playwright.config.js
reporter: [
  ['list'],
  ['json', { outputFile: 'test-results.json' }],
  ['html', { open: 'never' }],
  ['junit', { outputFile: 'junit.xml' }]
]
```

## Maintenance

### Update Playwright
```bash
# Update to latest version
npm update @playwright/test

# Update browsers
npx playwright install
```

### Update Selectors
```bash
# Record new selectors
npx playwright codegen http://localhost:3000
```

### Review Failed Tests
```bash
# Re-run failed tests only
npx playwright test --last-failed
```

---

## Quick Start Commands

```bash
# One-line setup and run
npm install -D @playwright/test && npx playwright install && npx playwright test

# Quick smoke test
npx playwright test -g "Create a new PRD" --project=chromium

# Full regression test
npx playwright test --project=all --reporter=html
```

## Support

For issues or questions:
1. Check the [Playwright Documentation](https://playwright.dev)
2. Review test output and screenshots in `playwright-report/`
3. Enable debug mode for detailed execution flow
4. Check browser console for JavaScript errors

---

Last Updated: 2025-08-13
Playwright Version: Latest
Test Count: 28 E2E Tests