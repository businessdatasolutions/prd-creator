# Test File Cleanup Required in Playwright Tests

**Issue ID:** ISSUE-013
**Date Created:** 2025-08-13
**Priority:** Low
**Status:** Open

## Description
Playwright tests that create temporary test files don't always clean them up properly if tests fail. This can leave orphaned test files in the tests directory.

## Steps to Reproduce
1. Run Playwright tests that upload files
2. If test fails before cleanup
3. Test files remain in directory

## Affected Tests
- File attachment upload tests
- Drag and drop tests
- File size validation tests

## Example Problem Code
```javascript
test('Upload file attachments', async ({ page }) => {
  const testFilePath = path.join(__dirname, 'test-file.txt');
  fs.writeFileSync(testFilePath, 'Test file content');
  
  await page.setInputFiles('#fileInput', testFilePath);
  
  // If test fails here, file isn't cleaned up
  await expect(page.locator('#attachmentItems')).toContainText('test-file.txt');
  
  fs.unlinkSync(testFilePath); // May not execute
});
```

## Expected Behavior
- Test files always cleaned up
- No orphaned files after test runs
- Cleanup happens even on test failure

## Actual Behavior
- Files may remain if test fails
- Directory gets cluttered over time
- Manual cleanup required

## Proposed Solution
1. Use test.afterEach() for cleanup
2. Or use try/finally blocks
3. Or create files in temp directory that auto-cleans

## Better Implementation
```javascript
test.describe('File Tests', () => {
  let testFiles = [];
  
  test.afterEach(async () => {
    // Clean up all test files
    for (const file of testFiles) {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    }
    testFiles = [];
  });
  
  test('Upload file', async ({ page }) => {
    const testFile = path.join(__dirname, 'test.txt');
    testFiles.push(testFile);
    fs.writeFileSync(testFile, 'content');
    // ... test code
  });
});
```

## Resolution
*Pending implementation*