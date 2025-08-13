# Bootstrap Not Defined in Test Environment

**Issue ID:** ISSUE-003
**Date Created:** 2025-08-13
**Priority:** High
**Status:** Open

## Description
Multiple ExportManager tests are failing with "bootstrap is not defined" error. The ExportManager's `showNotification` function relies on Bootstrap's Toast component, which is not available in the test environment.

## Steps to Reproduce
1. Open `tests/test-runner.html`
2. Run all tests
3. Observe 7 ExportManager tests failing with "bootstrap is not defined"

## Failed Tests
- should export to Markdown format
- should handle empty sections gracefully
- should handle document with no attachments
- should sanitize filename for safe download
- should handle very long document names
- should handle special characters in section content

## Expected Behavior
- Tests should either mock Bootstrap or the notification system
- Export functionality should be testable without UI dependencies

## Actual Behavior
- Tests fail when trying to show notifications
- Error: "ReferenceError: bootstrap is not defined at showNotification"

## Proposed Solution
1. Mock the Bootstrap Toast in test environment
2. Or add Bootstrap CDN to test-runner.html
3. Or refactor showNotification to check if Bootstrap exists before using it

## Resolution
*Pending implementation*