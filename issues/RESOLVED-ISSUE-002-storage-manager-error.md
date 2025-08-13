# StorageManager getCurrentDocument TypeError

**Issue ID:** ISSUE-002
**Date Created:** 2025-08-13
**Priority:** High
**Status:** Resolved

## Description
JavaScript console shows an error: `Uncaught TypeError: window.StorageManager?.getCurrentDocument is not a function`. This error occurs in the attachments.js file when trying to access the current document from StorageManager.

## Steps to Reproduce
1. Open the PRD-Builder application
2. Open browser developer console
3. Interact with attachment functionality
4. Observe the TypeError in console

## Expected Behavior
- StorageManager should expose a getCurrentDocument() method
- Attachments should be able to retrieve and save to the current document
- No console errors should appear

## Actual Behavior
- TypeError is thrown when attachments.js tries to call StorageManager.getCurrentDocument()
- The method appears to not be exposed in the StorageManager public API
- This may affect attachment persistence and loading

## Technical Analysis
The issue appears in:
- `js/attachments.js` - Lines where `window.StorageManager?.getCurrentDocument()` is called
- The StorageManager in `js/storage.js` may not be exposing this method in its public interface

## Proposed Solution
1. Check if getCurrentDocument() exists in storage.js
2. If not, add it to the public API return statement
3. Ensure the method returns the current document object
4. Update any calls to use the correct method name or pattern

## Impact
- Attachment saving may not persist correctly
- Attachments may not load when switching documents
- Console errors affect application stability

## Resolution
**Date Resolved:** 2025-08-13

Added the missing methods to StorageManager's public API:
1. `getCurrentDocument()` - Returns the currently active document object
2. `saveDocument(doc)` - Saves/updates a specific document with automatic modified timestamp
3. `getDocument(docId)` - Gets a specific document by ID

**Files Modified:**
- `js/storage.js`: Added three new methods and exposed them in the public API

The implementation ensures that:
- AttachmentManager can properly save and load attachments
- Document modifications are tracked with timestamps
- The API is consistent with the rest of the application

This resolves the TypeError and ensures attachments persist correctly when switching between documents.