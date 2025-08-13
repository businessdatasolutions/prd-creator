# Blob URL Local Resource Loading Error

**Issue ID:** ISSUE-008
**Date Created:** 2025-08-13
**Priority:** Low
**Status:** Open

## Description
Console shows multiple "Not allowed to load local resource: blob:mock-url" errors during export tests. This is caused by the mock URL.createObjectURL returning 'blob:mock-url' which the browser tries to load.

## Steps to Reproduce
1. Run ExportManager tests
2. Check browser console
3. See multiple "Not allowed to load local resource: blob:mock-url" errors

## Expected Behavior
- Mock URLs should not cause browser errors
- Tests should run cleanly without console errors

## Actual Behavior
- Browser attempts to load mock blob URLs
- Console shows security errors about local resources
- Tests still pass but console is polluted with errors

## Root Cause
The export tests mock `window.URL.createObjectURL` to return 'blob:mock-url', but when the export code tries to create download links, the browser attempts to access this invalid URL.

## Proposed Solution
1. Use a more realistic mock URL format like 'blob:http://localhost/mock'
2. Or prevent the actual download trigger in test environment
3. Or mock the entire download process to avoid URL creation

## Impact
- Low - tests still pass
- Console noise makes debugging harder
- May mask real errors

## Resolution
*Pending implementation*