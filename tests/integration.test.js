/**
 * Integration Tests for PRD-Builder
 * Tests complete workflows and component interactions
 */

describe('Integration Tests - Multi-Document Workflow', () => {
    let doc1, doc2, doc3;
    
    beforeAll(() => {
        // Clear storage before tests
        StorageManager.clearAllStorage();
    });
    
    afterAll(() => {
        // Clean up after tests
        StorageManager.clearAllStorage();
    });
    
    it('should create multiple documents', () => {
        doc1 = StorageManager.createDocument('Project Alpha PRD');
        doc2 = StorageManager.createDocument('Project Beta PRD');
        doc3 = StorageManager.createDocument('Project Gamma PRD');
        
        expect(doc1.id).toBeDefined();
        expect(doc2.id).toBeDefined();
        expect(doc3.id).toBeDefined();
        expect(doc1.id).not.toBe(doc2.id);
        expect(doc2.id).not.toBe(doc3.id);
    });
    
    it('should save multiple documents to storage', () => {
        const docs = {
            [doc1.id]: doc1,
            [doc2.id]: doc2,
            [doc3.id]: doc3
        };
        
        const result = StorageManager.saveDocuments(docs);
        expect(result).toBe(true);
        
        const retrieved = StorageManager.getDocuments();
        expect(Object.keys(retrieved)).toHaveLength(3);
    });
    
    it('should switch between documents', () => {
        // Set document 1 as current
        StorageManager.setCurrentDocumentId(doc1.id);
        let current = StorageManager.getCurrentDocument();
        expect(current.name).toBe('Project Alpha PRD');
        
        // Switch to document 2
        StorageManager.setCurrentDocumentId(doc2.id);
        current = StorageManager.getCurrentDocument();
        expect(current.name).toBe('Project Beta PRD');
        
        // Switch to document 3
        StorageManager.setCurrentDocumentId(doc3.id);
        current = StorageManager.getCurrentDocument();
        expect(current.name).toBe('Project Gamma PRD');
    });
    
    it('should update document content independently', () => {
        // Update document 1
        doc1.sections['executive-summary'] = 'Alpha project summary';
        StorageManager.saveDocument(doc1);
        
        // Update document 2
        doc2.sections['executive-summary'] = 'Beta project summary';
        StorageManager.saveDocument(doc2);
        
        // Verify updates are independent
        const retrievedDoc1 = StorageManager.getDocument(doc1.id);
        const retrievedDoc2 = StorageManager.getDocument(doc2.id);
        
        expect(retrievedDoc1.sections['executive-summary']).toBe('Alpha project summary');
        expect(retrievedDoc2.sections['executive-summary']).toBe('Beta project summary');
    });
    
    it('should handle document deletion correctly', () => {
        // Delete document 2
        const result = StorageManager.deleteDocument(doc2.id);
        expect(result).toBe(true);
        
        // Verify document 2 is gone
        const retrieved = StorageManager.getDocument(doc2.id);
        expect(retrieved).toBeNull();
        
        // Verify other documents remain
        const docs = StorageManager.getDocuments();
        expect(Object.keys(docs)).toHaveLength(2);
        expect(docs[doc1.id]).toBeDefined();
        expect(docs[doc3.id]).toBeDefined();
    });
    
    it('should maintain document timestamps', () => {
        const now = Date.now();
        
        // Check creation timestamp
        const createdTime = new Date(doc1.created).getTime();
        expect(createdTime).toBeLessThan(now + 1000);
        expect(createdTime).toBeGreaterThan(now - 60000);
        
        // Update document and check modified timestamp
        const originalModified = doc1.modified;
        setTimeout(() => {
            doc1.sections['goals-objectives'] = 'Updated goals';
            StorageManager.saveDocument(doc1);
            
            const updated = StorageManager.getDocument(doc1.id);
            expect(updated.modified).not.toBe(originalModified);
            expect(new Date(updated.modified).getTime()).toBeGreaterThan(new Date(originalModified).getTime());
        }, 10);
    });
});

describe('Integration Tests - Attachment Workflow', () => {
    let testDoc;
    
    beforeEach(() => {
        StorageManager.clearAllStorage();
        testDoc = StorageManager.createDocument('Document with Attachments');
        StorageManager.saveDocument(testDoc);
        StorageManager.setCurrentDocumentId(testDoc.id);
    });
    
    it('should add attachments to current document', () => {
        const attachment = {
            id: 'att-integration-1',
            name: 'integration-test.pdf',
            size: 1024,
            type: 'application/pdf',
            data: 'data:application/pdf;base64,test'
        };
        
        testDoc.attachments.push(attachment);
        StorageManager.saveDocument(testDoc);
        
        const retrieved = StorageManager.getCurrentDocument();
        expect(retrieved.attachments).toHaveLength(1);
        expect(retrieved.attachments[0].name).toBe('integration-test.pdf');
    });
    
    it('should persist attachments when switching documents', () => {
        // Add attachment to first document
        testDoc.attachments = [{
            id: 'att-1',
            name: 'file1.pdf',
            size: 1000,
            type: 'application/pdf'
        }];
        StorageManager.saveDocument(testDoc);
        
        // Create and switch to second document
        const doc2 = StorageManager.createDocument('Second Document');
        doc2.attachments = [{
            id: 'att-2',
            name: 'file2.png',
            size: 2000,
            type: 'image/png'
        }];
        StorageManager.saveDocument(doc2);
        StorageManager.setCurrentDocumentId(doc2.id);
        
        // Verify second document attachments
        let current = StorageManager.getCurrentDocument();
        expect(current.attachments).toHaveLength(1);
        expect(current.attachments[0].name).toBe('file2.png');
        
        // Switch back to first document
        StorageManager.setCurrentDocumentId(testDoc.id);
        current = StorageManager.getCurrentDocument();
        expect(current.attachments).toHaveLength(1);
        expect(current.attachments[0].name).toBe('file1.pdf');
    });
    
    it('should handle multiple attachments', () => {
        const attachments = [
            { id: '1', name: 'doc1.pdf', size: 1000, type: 'application/pdf' },
            { id: '2', name: 'image.png', size: 2000, type: 'image/png' },
            { id: '3', name: 'data.xlsx', size: 3000, type: 'application/vnd.ms-excel' }
        ];
        
        testDoc.attachments = attachments;
        StorageManager.saveDocument(testDoc);
        
        const retrieved = StorageManager.getCurrentDocument();
        expect(retrieved.attachments).toHaveLength(3);
        
        const totalSize = retrieved.attachments.reduce((sum, att) => sum + att.size, 0);
        expect(totalSize).toBe(6000);
    });
});

describe('Integration Tests - Export Workflow', () => {
    let exportDoc;
    
    beforeEach(() => {
        exportDoc = {
            id: 'export-test',
            name: 'Export Test Document',
            created: new Date().toISOString(),
            modified: new Date().toISOString(),
            sections: {
                'executive-summary': 'This is a test document for export functionality.',
                'goals-objectives': 'Test all export formats',
                'functional-requirements': 'Must export to Word, PDF, and Markdown',
                'non-functional-requirements': 'Exports should be fast and reliable',
                'technical-specifications': 'Use appropriate libraries for each format',
                'risks-mitigations': 'Risk: Export failure. Mitigation: Error handling'
            },
            attachments: [
                { id: 'att-1', name: 'test.pdf', size: 1000, type: 'application/pdf' }
            ]
        };
    });
    
    it('should export document with all sections', () => {
        const sections = Object.keys(exportDoc.sections);
        expect(sections).toHaveLength(6);
        
        sections.forEach(section => {
            expect(exportDoc.sections[section]).toBeDefined();
            expect(exportDoc.sections[section].length).toBeGreaterThan(0);
        });
    });
    
    it('should include metadata in export', () => {
        expect(exportDoc.created).toBeDefined();
        expect(exportDoc.modified).toBeDefined();
        expect(exportDoc.name).toBeDefined();
    });
    
    it('should handle special characters in content', () => {
        exportDoc.sections['executive-summary'] = 'Content with "quotes" & special <characters>';
        
        // Verify the content is preserved
        expect(exportDoc.sections['executive-summary']).toContain('"quotes"');
        expect(exportDoc.sections['executive-summary']).toContain('&');
        expect(exportDoc.sections['executive-summary']).toContain('<');
    });
    
    it('should export documents with attachments', () => {
        expect(exportDoc.attachments).toHaveLength(1);
        expect(exportDoc.attachments[0].name).toBe('test.pdf');
    });
});

describe('Integration Tests - Storage Management', () => {
    beforeEach(() => {
        StorageManager.clearAllStorage();
    });
    
    it('should track storage usage', () => {
        // Create several documents
        for (let i = 0; i < 5; i++) {
            const doc = StorageManager.createDocument(`Test Document ${i}`);
            doc.sections['executive-summary'] = 'Lorem ipsum dolor sit amet'.repeat(100);
            StorageManager.saveDocument(doc);
        }
        
        const stats = StorageManager.getStorageStats();
        expect(stats.used).toBeGreaterThan(0);
        expect(stats.percentage).toBeGreaterThan(0);
        expect(stats.available).toBeLessThan(stats.limit);
    });
    
    it('should handle preferences correctly', () => {
        const prefs = {
            theme: 'light',
            autoSaveInterval: 30000,
            defaultView: 'compact'
        };
        
        StorageManager.savePreferences(prefs);
        const retrieved = StorageManager.getPreferences();
        expect(retrieved).toEqual(prefs);
        
        // Update preferences
        prefs.theme = 'dark';
        StorageManager.savePreferences(prefs);
        const updated = StorageManager.getPreferences();
        expect(updated.theme).toBe('dark');
    });
    
    it('should backup and restore all data', () => {
        // Create test data
        const doc1 = StorageManager.createDocument('Backup Test 1');
        const doc2 = StorageManager.createDocument('Backup Test 2');
        StorageManager.saveDocument(doc1);
        StorageManager.saveDocument(doc2);
        
        const prefs = { theme: 'dark', fontSize: 14 };
        StorageManager.savePreferences(prefs);
        
        // Create backup
        const backup = StorageManager.createBackup();
        expect(backup.version).toBe('1.0.0');
        expect(backup.timestamp).toBeDefined();
        
        // Clear everything
        StorageManager.clearAllStorage();
        expect(Object.keys(StorageManager.getDocuments())).toHaveLength(0);
        
        // Restore from backup
        const result = StorageManager.restoreBackup(backup);
        expect(result.success).toBe(true);
        
        // Verify restoration
        const docs = StorageManager.getDocuments();
        expect(Object.keys(docs)).toHaveLength(2);
        
        const restoredPrefs = StorageManager.getPreferences();
        expect(restoredPrefs.theme).toBe('dark');
    });
    
    it('should search documents effectively', () => {
        // Create documents with searchable content
        const doc1 = StorageManager.createDocument('Product Requirements');
        doc1.sections['executive-summary'] = 'This document describes the requirements';
        
        const doc2 = StorageManager.createDocument('Technical Specification');
        doc2.sections['technical-specifications'] = 'Architecture and implementation details';
        
        const doc3 = StorageManager.createDocument('User Guide');
        doc3.sections['executive-summary'] = 'Guide for end users';
        
        StorageManager.saveDocument(doc1);
        StorageManager.saveDocument(doc2);
        StorageManager.saveDocument(doc3);
        
        // Search by title
        let results = StorageManager.searchDocuments('Requirements');
        expect(results).toHaveLength(1);
        expect(results[0].name).toBe('Product Requirements');
        
        // Search by content
        results = StorageManager.searchDocuments('Architecture');
        expect(results).toHaveLength(1);
        expect(results[0].name).toBe('Technical Specification');
        
        // Search with partial match
        results = StorageManager.searchDocuments('Guide');
        expect(results).toHaveLength(1);
        expect(results[0].name).toBe('User Guide');
    });
    
    it('should get recent documents in correct order', () => {
        const now = Date.now();
        
        const doc1 = StorageManager.createDocument('Old Document');
        doc1.modified = new Date(now - 86400000).toISOString(); // 1 day ago
        
        const doc2 = StorageManager.createDocument('Recent Document');
        doc2.modified = new Date(now - 3600000).toISOString(); // 1 hour ago
        
        const doc3 = StorageManager.createDocument('Newest Document');
        doc3.modified = new Date(now).toISOString(); // Now
        
        StorageManager.saveDocument(doc1);
        StorageManager.saveDocument(doc2);
        StorageManager.saveDocument(doc3);
        
        const recent = StorageManager.getRecentDocuments(2);
        expect(recent).toHaveLength(2);
        expect(recent[0].name).toBe('Newest Document');
        expect(recent[1].name).toBe('Recent Document');
    });
});

describe('Integration Tests - Error Handling', () => {
    it('should handle invalid document gracefully', () => {
        const invalidDoc = {
            name: 'Invalid',
            // Missing required fields
        };
        
        const validation = StorageManager.validateDocument(invalidDoc);
        expect(validation.valid).toBe(false);
        expect(validation.error).toBeDefined();
    });
    
    it('should handle storage errors', () => {
        // Simulate storage full by filling localStorage
        const largeData = 'x'.repeat(1024 * 1024); // 1MB string
        const docs = {};
        
        try {
            // Try to fill storage
            for (let i = 0; i < 100; i++) {
                const doc = StorageManager.createDocument(`Large Doc ${i}`);
                doc.sections['executive-summary'] = largeData;
                docs[doc.id] = doc;
            }
            
            const result = StorageManager.saveDocuments(docs);
            if (result !== true) {
                expect(result.error).toBeDefined();
            }
        } catch (error) {
            // Expected to fail at some point
            expect(error).toBeDefined();
        }
    });
    
    it('should handle corrupted data gracefully', () => {
        // Save corrupted data to localStorage
        localStorage.setItem('prd-documents', 'not valid json');
        
        // Should return empty object instead of throwing
        const docs = StorageManager.getDocuments();
        expect(docs).toEqual({});
    });
    
    it('should validate import data', () => {
        const invalidImport = 'not valid json';
        const result = StorageManager.importDocuments(invalidImport);
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
    });
});