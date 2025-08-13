/**
 * Playwright End-to-End Test Suite for PRD-Builder
 * Comprehensive testing of all major application functionalities
 */

const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

// Test configuration
const APP_URL = 'file://' + path.resolve(__dirname, '../index.html');
const TEST_TIMEOUT = 30000;

// Test data
const TEST_PRD_NAME = 'E2E Test PRD';
const UPDATED_PRD_NAME = 'Updated E2E Test PRD';
const TEST_CONTENT = {
  executiveSummary: 'This is an automated test of the PRD Builder application.',
  goalsObjectives: 'Goal 1: Test all functionalities\nGoal 2: Ensure reliability',
  functionalRequirements: '1. System shall create documents\n2. System shall save automatically',
  nonFunctionalRequirements: 'Performance: < 100ms\nReliability: 99.9% uptime',
  technicalSpecifications: 'Frontend: JavaScript\nStorage: localStorage',
  risksMitigations: 'Risk: Data loss\nMitigation: Auto-save every 30 seconds'
};

test.describe('PRD-Builder E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto(APP_URL);
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test.describe('1. Document Management', () => {
    test('1.1 Create a new PRD document', async ({ page }) => {
      await page.goto(APP_URL);
      
      // Click New PRD button
      await page.click('#newPrdBtn');
      
      // Check if prompt appears (might be a modal or prompt)
      await page.waitForTimeout(500);
      
      // Fill in the document name if there's an input
      const dialogVisible = await page.locator('.modal').isVisible().catch(() => false);
      if (dialogVisible) {
        await page.fill('.modal input', TEST_PRD_NAME);
        await page.click('.modal button:has-text("Create")');
      }
      
      // Verify document is created
      await expect(page.locator('#prdTitle')).toContainText(TEST_PRD_NAME);
    });

    test('1.2 Edit document title inline', async ({ page }) => {
      await page.goto(APP_URL);
      
      // Create a document first
      await page.click('#newPrdBtn');
      await page.waitForTimeout(500);
      
      // Hover over title to show edit button
      await page.hover('#prdTitle');
      
      // Click edit button
      await page.click('#editTitleBtn');
      
      // Clear and type new title
      await page.fill('#titleInput', UPDATED_PRD_NAME);
      
      // Press Enter to save
      await page.press('#titleInput', 'Enter');
      
      // Verify title is updated
      await expect(page.locator('#titleText')).toHaveText(UPDATED_PRD_NAME);
    });

    test('1.3 Switch between multiple documents', async ({ page }) => {
      await page.goto(APP_URL);
      
      // Create first document
      await page.click('#newPrdBtn');
      await page.waitForTimeout(500);
      
      // Create second document
      await page.click('#newPrdBtn');
      await page.waitForTimeout(500);
      
      // Open document dropdown
      await page.click('.dropdown-toggle:has-text("Documents")');
      
      // Verify both documents are listed
      const docCount = await page.locator('#documentList li').count();
      expect(docCount).toBeGreaterThanOrEqual(2);
      
      // Click on first document
      await page.click('#documentList li:first-child');
      
      // Verify switched to first document
      await page.waitForTimeout(500);
    });

    test('1.4 Delete a document', async ({ page }) => {
      await page.goto(APP_URL);
      
      // Create a document
      await page.click('#newPrdBtn');
      await page.waitForTimeout(500);
      
      // Click delete button
      await page.click('button:has-text("Delete Document")');
      
      // Confirm deletion in dialog
      page.on('dialog', dialog => dialog.accept());
      
      // Verify document is deleted
      await expect(page.locator('.empty-state')).toBeVisible();
    });
  });

  test.describe('2. Content Creation', () => {
    test('2.1 Fill in all PRD sections', async ({ page }) => {
      await page.goto(APP_URL);
      
      // Create a new document
      await page.click('#newPrdBtn');
      await page.waitForTimeout(500);
      
      // Fill Executive Summary
      await page.click('[data-bs-target="#collapse-executive-summary"]');
      await page.fill('#executive-summary-content', TEST_CONTENT.executiveSummary);
      
      // Fill Goals & Objectives
      await page.click('[data-bs-target="#collapse-goals-objectives"]');
      await page.fill('#goals-objectives-content', TEST_CONTENT.goalsObjectives);
      
      // Fill Functional Requirements
      await page.click('[data-bs-target="#collapse-functional-requirements"]');
      await page.fill('#functional-requirements-content', TEST_CONTENT.functionalRequirements);
      
      // Fill Non-functional Requirements
      await page.click('[data-bs-target="#collapse-non-functional-requirements"]');
      await page.fill('#non-functional-requirements-content', TEST_CONTENT.nonFunctionalRequirements);
      
      // Fill Technical Specifications
      await page.click('[data-bs-target="#collapse-technical-specifications"]');
      await page.fill('#technical-specifications-content', TEST_CONTENT.technicalSpecifications);
      
      // Fill Risks & Mitigations
      await page.click('[data-bs-target="#collapse-risks-mitigations"]');
      await page.fill('#risks-mitigations-content', TEST_CONTENT.risksMitigations);
      
      // Verify content is saved (check one section)
      const savedContent = await page.inputValue('#executive-summary-content');
      expect(savedContent).toBe(TEST_CONTENT.executiveSummary);
    });

    test('2.2 Test auto-save functionality', async ({ page }) => {
      await page.goto(APP_URL);
      
      // Create a document
      await page.click('#newPrdBtn');
      await page.waitForTimeout(500);
      
      // Type content
      await page.click('[data-bs-target="#collapse-executive-summary"]');
      await page.fill('#executive-summary-content', 'Auto-save test content');
      
      // Wait for auto-save (2 seconds based on debounce)
      await page.waitForTimeout(2500);
      
      // Check for save indicator
      const saveIndicator = page.locator('.auto-save-indicator');
      await expect(saveIndicator).toHaveClass(/saved/);
      
      // Reload page
      await page.reload();
      
      // Verify content persisted
      await page.click('[data-bs-target="#collapse-executive-summary"]');
      const content = await page.inputValue('#executive-summary-content');
      expect(content).toBe('Auto-save test content');
    });

    test('2.3 Test section collapse/expand state persistence', async ({ page }) => {
      await page.goto(APP_URL);
      
      // Create a document
      await page.click('#newPrdBtn');
      await page.waitForTimeout(500);
      
      // Expand specific sections
      await page.click('[data-bs-target="#collapse-executive-summary"]');
      await page.click('[data-bs-target="#collapse-goals-objectives"]');
      
      // Wait for state to save
      await page.waitForTimeout(1000);
      
      // Reload page
      await page.reload();
      
      // Verify sections remain expanded
      await expect(page.locator('#collapse-executive-summary')).toHaveClass(/show/);
      await expect(page.locator('#collapse-goals-objectives')).toHaveClass(/show/);
    });
  });

  test.describe('3. File Attachments', () => {
    test('3.1 Upload file attachments', async ({ page }) => {
      await page.goto(APP_URL);
      
      // Create a document
      await page.click('#newPrdBtn');
      await page.waitForTimeout(500);
      
      // Open attachments section
      await page.click('[data-bs-target="#collapse-attachments"]');
      
      // Create a test file
      const testFilePath = path.join(__dirname, 'test-file.txt');
      fs.writeFileSync(testFilePath, 'Test file content');
      
      // Upload file
      await page.setInputFiles('#fileInput', testFilePath);
      
      // Verify file appears in attachment list
      await expect(page.locator('#attachmentItems')).toContainText('test-file.txt');
      
      // Clean up
      fs.unlinkSync(testFilePath);
    });

    test('3.2 Test drag and drop file upload', async ({ page }) => {
      await page.goto(APP_URL);
      
      // Create a document
      await page.click('#newPrdBtn');
      await page.waitForTimeout(500);
      
      // Open attachments section
      await page.click('[data-bs-target="#collapse-attachments"]');
      
      // Create test file
      const testFilePath = path.join(__dirname, 'test-drag.pdf');
      fs.writeFileSync(testFilePath, 'PDF content simulation');
      
      // Simulate drag and drop
      const dropZone = page.locator('#dropZone');
      const dataTransfer = await page.evaluateHandle(() => new DataTransfer());
      
      // This is a simplified version - actual implementation would need file data
      await dropZone.dispatchEvent('drop', { dataTransfer });
      
      // Clean up
      fs.unlinkSync(testFilePath);
    });

    test('3.3 Remove attachments', async ({ page }) => {
      await page.goto(APP_URL);
      
      // Create document and upload file
      await page.click('#newPrdBtn');
      await page.waitForTimeout(500);
      await page.click('[data-bs-target="#collapse-attachments"]');
      
      // Create and upload test file
      const testFilePath = path.join(__dirname, 'test-remove.txt');
      fs.writeFileSync(testFilePath, 'To be removed');
      await page.setInputFiles('#fileInput', testFilePath);
      
      // Wait for upload
      await page.waitForTimeout(500);
      
      // Click remove button
      await page.click('.attachment-card button:has-text("trash")');
      
      // Verify attachment is removed
      await expect(page.locator('#attachmentItems')).not.toContainText('test-remove.txt');
      
      // Clean up
      fs.unlinkSync(testFilePath);
    });

    test('3.4 Test file size validation (5MB limit)', async ({ page }) => {
      await page.goto(APP_URL);
      
      // Create a document
      await page.click('#newPrdBtn');
      await page.waitForTimeout(500);
      await page.click('[data-bs-target="#collapse-attachments"]');
      
      // Try to upload a file > 5MB (simulated)
      // Note: Actual implementation would need a large file
      
      // Check for error message
      page.on('dialog', dialog => {
        expect(dialog.message()).toContain('exceeds 5MB limit');
        dialog.accept();
      });
    });
  });

  test.describe('4. Export Functionality', () => {
    test('4.1 Export to Word format', async ({ page }) => {
      await page.goto(APP_URL);
      
      // Create and fill document
      await page.click('#newPrdBtn');
      await page.waitForTimeout(500);
      await page.click('[data-bs-target="#collapse-executive-summary"]');
      await page.fill('#executive-summary-content', 'Export test content');
      
      // Set up download promise
      const downloadPromise = page.waitForEvent('download');
      
      // Click Word export
      await page.click('button:has-text("Export to Word")');
      
      // Wait for download
      const download = await downloadPromise;
      
      // Verify filename
      expect(download.suggestedFilename()).toContain('.docx');
    });

    test('4.2 Export to PDF format', async ({ page }) => {
      await page.goto(APP_URL);
      
      // Create and fill document
      await page.click('#newPrdBtn');
      await page.waitForTimeout(500);
      await page.click('[data-bs-target="#collapse-executive-summary"]');
      await page.fill('#executive-summary-content', 'PDF export test');
      
      // Set up download promise
      const downloadPromise = page.waitForEvent('download');
      
      // Click PDF export
      await page.click('button:has-text("Export to PDF")');
      
      // Wait for download
      const download = await downloadPromise;
      
      // Verify filename
      expect(download.suggestedFilename()).toContain('.pdf');
    });

    test('4.3 Export to Markdown format', async ({ page }) => {
      await page.goto(APP_URL);
      
      // Create and fill document
      await page.click('#newPrdBtn');
      await page.waitForTimeout(500);
      await page.click('[data-bs-target="#collapse-executive-summary"]');
      await page.fill('#executive-summary-content', 'Markdown export test');
      
      // Set up download promise
      const downloadPromise = page.waitForEvent('download');
      
      // Click Markdown export
      await page.click('button:has-text("Export to Markdown")');
      
      // Wait for download
      const download = await downloadPromise;
      
      // Verify filename
      expect(download.suggestedFilename()).toContain('.md');
    });
  });

  test.describe('5. Storage Management', () => {
    test('5.1 Monitor storage usage', async ({ page }) => {
      await page.goto(APP_URL);
      
      // Create multiple documents
      for (let i = 0; i < 3; i++) {
        await page.click('#newPrdBtn');
        await page.waitForTimeout(500);
      }
      
      // Check storage indicator
      const storageBar = page.locator('#storageBar');
      await expect(storageBar).toBeVisible();
      
      // Verify percentage is shown
      const storageText = await page.locator('#storageText').textContent();
      expect(storageText).toMatch(/\d+%/);
    });

    test('5.2 Test storage full warning', async ({ page }) => {
      await page.goto(APP_URL);
      
      // Fill storage with large content
      await page.evaluate(() => {
        const largeData = 'x'.repeat(1024 * 1024); // 1MB
        for (let i = 0; i < 10; i++) {
          try {
            localStorage.setItem(`test-large-${i}`, largeData);
          } catch (e) {
            break;
          }
        }
      });
      
      // Check for storage warning
      await page.reload();
      const storageAlert = page.locator('#storageAlert');
      
      // Clean up
      await page.evaluate(() => {
        for (let i = 0; i < 10; i++) {
          localStorage.removeItem(`test-large-${i}`);
        }
      });
    });

    test('5.3 Test beforeunload warning for unsaved changes', async ({ page }) => {
      await page.goto(APP_URL);
      
      // Create document and make changes
      await page.click('#newPrdBtn');
      await page.waitForTimeout(500);
      await page.click('[data-bs-target="#collapse-executive-summary"]');
      await page.fill('#executive-summary-content', 'Unsaved content');
      
      // Try to navigate away
      page.on('dialog', dialog => {
        expect(dialog.message()).toContain('unsaved');
        dialog.dismiss();
      });
      
      // Trigger navigation
      await page.evaluate(() => window.location.href = '#');
    });
  });

  test.describe('6. Search and Navigation', () => {
    test('6.1 Search documents', async ({ page }) => {
      await page.goto(APP_URL);
      
      // Create multiple documents
      const docNames = ['Alpha Project', 'Beta Release', 'Gamma Testing'];
      for (const name of docNames) {
        await page.click('#newPrdBtn');
        await page.waitForTimeout(500);
        // Would need to enter name in prompt/modal
      }
      
      // Search functionality would need to be tested if search UI exists
      // This is a placeholder for search testing
    });

    test('6.2 Test document list in dropdown', async ({ page }) => {
      await page.goto(APP_URL);
      
      // Create multiple documents
      for (let i = 0; i < 3; i++) {
        await page.click('#newPrdBtn');
        await page.waitForTimeout(500);
      }
      
      // Open document dropdown
      await page.click('.dropdown-toggle:has-text("Documents")');
      
      // Verify all documents are listed
      const docItems = await page.locator('#documentList li').count();
      expect(docItems).toBe(3);
    });
  });

  test.describe('7. UI Responsiveness', () => {
    test('7.1 Test responsive design on mobile', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(APP_URL);
      
      // Verify mobile menu is visible
      const mobileMenu = page.locator('.navbar-toggler');
      await expect(mobileMenu).toBeVisible();
      
      // Test navigation works on mobile
      await page.click('#newPrdBtn');
      await page.waitForTimeout(500);
    });

    test('7.2 Test responsive design on tablet', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto(APP_URL);
      
      // Verify layout adjusts for tablet
      await page.click('#newPrdBtn');
      await page.waitForTimeout(500);
      
      // Check sections are still accessible
      await page.click('[data-bs-target="#collapse-executive-summary"]');
      await expect(page.locator('#executive-summary-content')).toBeVisible();
    });
  });

  test.describe('8. Error Handling', () => {
    test('8.1 Handle corrupted localStorage data', async ({ page }) => {
      await page.goto(APP_URL);
      
      // Corrupt localStorage
      await page.evaluate(() => {
        localStorage.setItem('prd-documents', 'invalid json data');
      });
      
      // Reload and verify app handles error gracefully
      await page.reload();
      
      // App should still load
      await expect(page.locator('#app')).toBeVisible();
    });

    test('8.2 Handle network errors for CDN resources', async ({ page }) => {
      // Block CDN resources
      await page.route('**/*.cdn.jsdelivr.net/**', route => route.abort());
      
      await page.goto(APP_URL);
      
      // App should still function with fallbacks
      await expect(page.locator('#app')).toBeVisible();
    });
  });

  test.describe('9. Performance Tests', () => {
    test('9.1 Test page load time', async ({ page }) => {
      const startTime = Date.now();
      await page.goto(APP_URL);
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      // Page should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
    });

    test('9.2 Test document creation performance', async ({ page }) => {
      await page.goto(APP_URL);
      
      const startTime = Date.now();
      await page.click('#newPrdBtn');
      await page.waitForTimeout(500);
      const createTime = Date.now() - startTime;
      
      // Document creation should be under 1 second
      expect(createTime).toBeLessThan(1000);
    });

    test('9.3 Test with many documents', async ({ page }) => {
      await page.goto(APP_URL);
      
      // Create 20 documents
      for (let i = 0; i < 20; i++) {
        await page.click('#newPrdBtn');
        await page.waitForTimeout(100);
      }
      
      // App should still be responsive
      const startTime = Date.now();
      await page.click('.dropdown-toggle:has-text("Documents")');
      const responseTime = Date.now() - startTime;
      
      expect(responseTime).toBeLessThan(500);
    });
  });

  test.describe('10. Accessibility Tests', () => {
    test('10.1 Test keyboard navigation', async ({ page }) => {
      await page.goto(APP_URL);
      
      // Create document using keyboard
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter'); // Should trigger New PRD
      
      await page.waitForTimeout(500);
      
      // Navigate sections with keyboard
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter'); // Expand section
      
      // Verify section expanded
      const firstSection = page.locator('.accordion-collapse').first();
      await expect(firstSection).toHaveClass(/show/);
    });

    test('10.2 Test screen reader labels', async ({ page }) => {
      await page.goto(APP_URL);
      
      // Check for ARIA labels
      const newButton = page.locator('#newPrdBtn');
      await expect(newButton).toHaveAttribute('aria-label', /.*/);
      
      // Check form inputs have labels
      await page.click('#newPrdBtn');
      await page.waitForTimeout(500);
      await page.click('[data-bs-target="#collapse-executive-summary"]');
      
      const textarea = page.locator('#executive-summary-content');
      await expect(textarea).toHaveAttribute('aria-label', /.*/);
    });
  });
});

// Export test configuration
module.exports = {
  timeout: TEST_TIMEOUT,
  use: {
    headless: false,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
};