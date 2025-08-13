# Recent Documents Returned in Wrong Order

**Issue ID:** ISSUE-007
**Date Created:** 2025-08-13
**Priority:** Low
**Status:** Open

## Description
The integration test "should get recent documents in correct order" is failing. The `getRecentDocuments()` function is not returning documents in the expected order (newest first).

## Steps to Reproduce
1. Run Integration Tests - Storage Management
2. Test "should get recent documents in correct order" fails
3. Expected "Newest Document" but got "Old Document"

## Test Details
- Creates 3 documents with different modified timestamps:
  - Old Document (1 day ago)
  - Recent Document (1 hour ago)  
  - Newest Document (now)
- Calls `getRecentDocuments(2)` expecting newest first
- Gets "Old Document" instead of "Newest Document"

## Expected Behavior
- Documents should be sorted by modified date, newest first
- `getRecentDocuments(2)` should return:
  1. Newest Document
  2. Recent Document

## Actual Behavior
- Documents appear to be in wrong order
- Returns "Old Document" as the first item

## Root Cause
The `getRecentDocuments()` function in StorageManager may have incorrect sorting logic or the sort comparison function is inverted.

## Proposed Solution
1. Check the sort function in `getRecentDocuments()`
2. Ensure it's sorting by `modified` field in descending order
3. Fix might be changing `a.modified - b.modified` to `b.modified - a.modified`

## Resolution
*Pending implementation*