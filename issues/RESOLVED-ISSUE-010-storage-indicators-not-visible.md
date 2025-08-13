# Storage Indicators Not Visible by Default

**Issue ID:** ISSUE-010
**Date Created:** 2025-08-13
**Priority:** Low
**Status:** Open

## Description
The storage usage indicators (progress bar and percentage text) are not visible when the application loads. The storage alert div has the `d-none` class which hides it completely.

## Steps to Reproduce
1. Open the application
2. Look for storage indicators
3. Storage bar (#storageBar) and text (#storageText) are hidden
4. Alert only shows when storage reaches warning thresholds

## Test Results
```javascript
Storage indicators - Bar: false Text: false
```

## Expected Behavior
- Storage indicators should be visible at all times
- Show current storage usage even when low
- Provide constant feedback about storage consumption

## Actual Behavior
- Storage alert has `d-none` class
- Only becomes visible at warning thresholds (80%, 95%)
- Users don't know storage status until it's almost full

## HTML Issue
```html
<div class="alert alert-info d-none" id="storageAlert">
```

## Proposed Solution
1. Remove `d-none` class from storageAlert
2. Or add logic to show it when any document exists
3. Consider showing it in a less prominent location when usage is low
4. Use different colors based on usage levels:
   - Green: 0-50%
   - Yellow: 50-80%
   - Red: 80-100%

## Resolution
*Pending implementation*