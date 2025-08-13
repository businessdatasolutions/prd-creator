/**
 * Quick Playwright Test to Identify Issues
 */

const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const APP_URL = 'file://' + path.resolve(__dirname, '../index.html');

test.describe('PRD-Builder Core Functionality Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(APP_URL);
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('1. Application loads successfully', async ({ page }) => {
    await page.goto(APP_URL);
    await expect(page.locator('#app')).toBeVisible();
    await expect(page.locator('.navbar-brand')).toContainText('PRD-Builder');
  });

  test('2. Create new PRD document', async ({ page }) => {
    // Click New PRD button
    await page.click('#newPrdBtn');
    
    // Wait for any dialog/prompt
    await page.waitForTimeout(1000);
    
    // Check if document area is visible
    const appContent = await page.locator('#app').textContent();
    console.log('App content after new PRD:', appContent.substring(0, 200));
  });

  test('3. Edit document title', async ({ page }) => {
    // First create a document
    await page.click('#newPrdBtn');
    await page.waitForTimeout(1000);
    
    // Try to find and edit title
    const titleElement = await page.locator('#prdTitle').isVisible().catch(() => false);
    if (titleElement) {
      await page.hover('#prdTitle');
      const editBtn = await page.locator('#editTitleBtn').isVisible().catch(() => false);
      console.log('Edit button visible:', editBtn);
    } else {
      console.log('Title element not found');
    }
  });

  test('4. Fill document sections', async ({ page }) => {
    // Create document
    await page.click('#newPrdBtn');
    await page.waitForTimeout(1000);
    
    // Try to expand Executive Summary
    const accordionButton = await page.locator('[data-bs-target="#collapse-executive-summary"]').isVisible().catch(() => false);
    if (accordionButton) {
      await page.click('[data-bs-target="#collapse-executive-summary"]');
      await page.waitForTimeout(500);
      
      const textarea = await page.locator('#executive-summary-content').isVisible().catch(() => false);
      if (textarea) {
        await page.fill('#executive-summary-content', 'Test content');
        console.log('Successfully filled executive summary');
      } else {
        console.log('Textarea not found');
      }
    } else {
      console.log('Accordion button not found');
    }
  });

  test('5. File attachment section', async ({ page }) => {
    // Create document
    await page.click('#newPrdBtn');
    await page.waitForTimeout(1000);
    
    // Try to find attachments section
    const attachmentSection = await page.locator('[data-bs-target="#collapse-attachments"]').isVisible().catch(() => false);
    console.log('Attachment section exists:', attachmentSection);
    
    if (attachmentSection) {
      await page.click('[data-bs-target="#collapse-attachments"]');
      await page.waitForTimeout(500);
      
      const dropZone = await page.locator('#dropZone').isVisible().catch(() => false);
      console.log('Drop zone visible:', dropZone);
    }
  });

  test('6. Export buttons exist', async ({ page }) => {
    // Create document
    await page.click('#newPrdBtn');
    await page.waitForTimeout(1000);
    
    // Check for export buttons
    const wordExport = await page.locator('button:has-text("Export to Word")').isVisible().catch(() => false);
    const pdfExport = await page.locator('button:has-text("Export to PDF")').isVisible().catch(() => false);
    const mdExport = await page.locator('button:has-text("Export to Markdown")').isVisible().catch(() => false);
    
    console.log('Export buttons - Word:', wordExport, 'PDF:', pdfExport, 'Markdown:', mdExport);
  });

  test('7. Storage indicator', async ({ page }) => {
    const storageBar = await page.locator('#storageBar').isVisible().catch(() => false);
    const storageText = await page.locator('#storageText').isVisible().catch(() => false);
    
    console.log('Storage indicators - Bar:', storageBar, 'Text:', storageText);
  });

  test('8. Document dropdown', async ({ page }) => {
    const dropdownToggle = await page.locator('.dropdown-toggle:has-text("Documents")').isVisible().catch(() => false);
    
    if (dropdownToggle) {
      await page.click('.dropdown-toggle:has-text("Documents")');
      await page.waitForTimeout(500);
      
      const documentList = await page.locator('#documentList').isVisible().catch(() => false);
      console.log('Document list visible:', documentList);
    } else {
      console.log('Document dropdown not found');
    }
  });

  test('9. Check for console errors', async ({ page }) => {
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto(APP_URL);
    await page.waitForTimeout(2000);
    
    console.log('Console errors found:', errors.length);
    errors.forEach(err => console.log('Error:', err));
  });

  test('10. Check responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(APP_URL);
    
    const navbarToggler = await page.locator('.navbar-toggler').isVisible().catch(() => false);
    console.log('Mobile menu button visible:', navbarToggler);
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    
    const appVisible = await page.locator('#app').isVisible().catch(() => false);
    console.log('App visible on tablet:', appVisible);
  });
});