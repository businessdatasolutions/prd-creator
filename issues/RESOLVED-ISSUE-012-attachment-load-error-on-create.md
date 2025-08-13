# AttachmentManager Throws Error on Document Creation

**Issue ID:** ISSUE-012
**Date Created:** 2025-08-13
**Priority:** High
**Status:** Open

## Description
When creating a new PRD document, an error is thrown: "Uncaught TypeError: window.StorageManager?.getCurrentDocument is not a function". This is related to ISSUE-002 but specifically occurs during the attachment initialization process.

## Steps to Reproduce
1. Open application
2. Click "New PRD" button
3. Enter document name in prompt
4. Error appears in console

## Console Error
```
Uncaught TypeError: window.StorageManager?.getCurrentDocument is not a function
    at loadAttachments (attachments.js:line)
```

## Root Cause
This is a duplicate manifestation of ISSUE-002. The AttachmentManager is trying to call `StorageManager.getCurrentDocument()` which doesn't exist in the public API.

## Impact
- Console errors on every document creation
- Attachments may not load properly
- Potential data loss for attachments

## Temporary Workaround
The error doesn't prevent the application from working, but it should be fixed by implementing ISSUE-002's solution.

## Related Issues
- ISSUE-002: StorageManager getCurrentDocument TypeError

## Proposed Solution
Already addressed in ISSUE-002 - need to add missing methods to StorageManager:
1. getCurrentDocument()
2. saveDocument()
3. getDocument()

## Resolution
*Will be resolved when ISSUE-002 is fixed*