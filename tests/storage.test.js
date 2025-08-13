/**
 * Unit Tests for StorageManager
 */

describe('StorageManager', () => {
    let originalLocalStorage;
    
    beforeAll(() => {
        // Save original localStorage
        originalLocalStorage = { ...localStorage };
    });
    
    beforeEach(() => {
        // Clear localStorage before each test
        localStorage.clear();
    });
    
    afterAll(() => {
        // Restore original localStorage
        localStorage.clear();
        Object.keys(originalLocalStorage).forEach(key => {
            localStorage.setItem(key, originalLocalStorage[key]);
        });
    });
    
    it('should get empty documents object initially', () => {
        const docs = StorageManager.getDocuments();
        expect(docs).toEqual({});
    });
    
    it('should create a new document with default name', () => {
        const doc = StorageManager.createDocument();
        expect(doc.name).toBe('Untitled PRD');
        expect(doc.id).toBeDefined();
        expect(doc.sections).toBeDefined();
        expect(doc.attachments).toEqual([]);
    });
    
    it('should create a new document with custom name', () => {
        const doc = StorageManager.createDocument('My Custom PRD');
        expect(doc.name).toBe('My Custom PRD');
    });
    
    it('should save and retrieve documents', () => {
        const docs = {
            'doc1': StorageManager.createDocument('Document 1'),
            'doc2': StorageManager.createDocument('Document 2')
        };
        
        const result = StorageManager.saveDocuments(docs);
        expect(result).toBe(true);
        
        const retrieved = StorageManager.getDocuments();
        expect(Object.keys(retrieved)).toHaveLength(2);
    });
    
    it('should get and set current document ID', () => {
        expect(StorageManager.getCurrentDocumentId()).toBeNull();
        
        StorageManager.setCurrentDocumentId('test-id');
        expect(StorageManager.getCurrentDocumentId()).toBe('test-id');
        
        StorageManager.setCurrentDocumentId(null);
        expect(StorageManager.getCurrentDocumentId()).toBeNull();
    });
    
    it('should get current document', () => {
        const doc = StorageManager.createDocument('Test Doc');
        const docs = { [doc.id]: doc };
        StorageManager.saveDocuments(docs);
        StorageManager.setCurrentDocumentId(doc.id);
        
        const current = StorageManager.getCurrentDocument();
        expect(current).toBeDefined();
        expect(current.name).toBe('Test Doc');
    });
    
    it('should return null when no current document', () => {
        const current = StorageManager.getCurrentDocument();
        expect(current).toBeNull();
    });
    
    it('should save a single document', () => {
        const doc = StorageManager.createDocument('Test Doc');
        const result = StorageManager.saveDocument(doc);
        expect(result).toBe(true);
        
        const retrieved = StorageManager.getDocument(doc.id);
        expect(retrieved.name).toBe('Test Doc');
    });
    
    it('should update modified timestamp when saving document', () => {
        const doc = StorageManager.createDocument('Test Doc');
        const originalModified = doc.modified;
        
        // Wait a bit to ensure timestamp changes
        setTimeout(() => {
            StorageManager.saveDocument(doc);
            const retrieved = StorageManager.getDocument(doc.id);
            expect(retrieved.modified).not.toBe(originalModified);
        }, 10);
    });
    
    it('should delete a document', () => {
        const doc = StorageManager.createDocument('To Delete');
        const docs = { [doc.id]: doc };
        StorageManager.saveDocuments(docs);
        StorageManager.setCurrentDocumentId(doc.id);
        
        const result = StorageManager.deleteDocument(doc.id);
        expect(result).toBe(true);
        
        const remaining = StorageManager.getDocuments();
        expect(remaining[doc.id]).toBeUndefined();
        expect(StorageManager.getCurrentDocumentId()).toBeNull();
    });
    
    it('should calculate storage statistics', () => {
        const stats = StorageManager.getStorageStats();
        expect(stats.used).toBeGreaterThan(-1);
        expect(stats.limit).toBeGreaterThan(0);
        expect(stats.percentage).toBeGreaterThan(-1);
        expect(stats.available).toBeGreaterThan(-1);
    });
    
    it('should validate document structure', () => {
        const validDoc = StorageManager.createDocument('Valid Doc');
        const validation = StorageManager.validateDocument(validDoc);
        expect(validation.valid).toBe(true);
    });
    
    it('should detect invalid document structure', () => {
        const invalidDoc = { name: 'Invalid' };
        const validation = StorageManager.validateDocument(invalidDoc);
        expect(validation.valid).toBe(false);
        expect(validation.error).toBeDefined();
    });
    
    it('should search documents by name', () => {
        const doc1 = StorageManager.createDocument('Alpha Document');
        const doc2 = StorageManager.createDocument('Beta Document');
        const doc3 = StorageManager.createDocument('Gamma File');
        
        const docs = {
            [doc1.id]: doc1,
            [doc2.id]: doc2,
            [doc3.id]: doc3
        };
        StorageManager.saveDocuments(docs);
        
        const results = StorageManager.searchDocuments('Document');
        expect(results).toHaveLength(2);
        expect(results[0].name).toContain('Document');
        expect(results[1].name).toContain('Document');
    });
    
    it('should get recent documents', () => {
        const doc1 = StorageManager.createDocument('Old Document');
        doc1.modified = new Date(Date.now() - 86400000).toISOString(); // 1 day ago
        
        const doc2 = StorageManager.createDocument('New Document');
        doc2.modified = new Date().toISOString();
        
        const docs = {
            [doc1.id]: doc1,
            [doc2.id]: doc2
        };
        StorageManager.saveDocuments(docs);
        
        const recent = StorageManager.getRecentDocuments(1);
        expect(recent).toHaveLength(1);
        expect(recent[0].name).toBe('New Document');
    });
    
    it('should save and retrieve preferences', () => {
        const prefs = {
            theme: 'dark',
            autoSave: true,
            autoSaveInterval: 30000
        };
        
        StorageManager.savePreferences(prefs);
        const retrieved = StorageManager.getPreferences();
        expect(retrieved).toEqual(prefs);
    });
    
    it('should save and retrieve collapse states', () => {
        const states = {
            'section1': true,
            'section2': false
        };
        
        StorageManager.saveCollapseStates('doc-id', states);
        const retrieved = StorageManager.getCollapseStates('doc-id');
        expect(retrieved).toEqual(states);
    });
    
    it('should export all documents as JSON', () => {
        const doc = StorageManager.createDocument('Export Test');
        const docs = { [doc.id]: doc };
        StorageManager.saveDocuments(docs);
        
        const exported = StorageManager.exportAllDocuments();
        expect(typeof exported).toBe('string');
        
        const parsed = JSON.parse(exported);
        expect(parsed.version).toBe('1.0.0');
        expect(parsed.documents).toBeDefined();
        expect(Object.keys(parsed.documents)).toHaveLength(1);
    });
    
    it('should import documents from JSON', () => {
        const exportData = {
            version: '1.0.0',
            documents: {
                'imported-1': StorageManager.createDocument('Imported Doc 1'),
                'imported-2': StorageManager.createDocument('Imported Doc 2')
            }
        };
        
        const jsonString = JSON.stringify(exportData);
        const result = StorageManager.importDocuments(jsonString);
        
        expect(result.success).toBe(true);
        expect(result.imported).toBe(2);
        
        const docs = StorageManager.getDocuments();
        expect(Object.keys(docs)).toHaveLength(2);
    });
    
    it('should create and restore backup', () => {
        const doc = StorageManager.createDocument('Backup Test');
        const docs = { [doc.id]: doc };
        StorageManager.saveDocuments(docs);
        
        const backup = StorageManager.createBackup();
        expect(backup.version).toBe('1.0.0');
        expect(backup.timestamp).toBeDefined();
        expect(backup.data).toBeDefined();
        
        // Clear storage
        StorageManager.clearAllStorage();
        expect(StorageManager.getDocuments()).toEqual({});
        
        // Restore backup
        const result = StorageManager.restoreBackup(backup);
        expect(result.success).toBe(true);
        
        const restored = StorageManager.getDocuments();
        expect(Object.keys(restored)).toHaveLength(1);
    });
    
    it('should clear all storage', () => {
        const doc = StorageManager.createDocument('To Clear');
        const docs = { [doc.id]: doc };
        StorageManager.saveDocuments(docs);
        StorageManager.setCurrentDocumentId(doc.id);
        
        const result = StorageManager.clearAllStorage();
        expect(result).toBe(true);
        
        expect(StorageManager.getDocuments()).toEqual({});
        expect(StorageManager.getCurrentDocumentId()).toBeNull();
        expect(StorageManager.getPreferences()).toEqual({});
    });
});