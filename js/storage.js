/**
 * Storage Module for PRD-Builder
 * Handles localStorage operations, document management, and persistence
 */

const StorageManager = (function() {
    'use strict';

    const STORAGE_KEYS = {
        DOCUMENTS: 'prd-documents',
        CURRENT_DOCUMENT: 'prd-current-document',
        PREFERENCES: 'prd-preferences',
        COLLAPSE_STATES: 'prd-collapse-states'
    };

    const STORAGE_LIMIT = 10 * 1024 * 1024; // 10MB assumed limit

    /**
     * Get all documents from storage
     */
    function getDocuments() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
            return data ? JSON.parse(data) : {};
        } catch (error) {
            console.error('Error loading documents:', error);
            return {};
        }
    }

    /**
     * Save documents to storage
     */
    function saveDocuments(documents) {
        try {
            localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
            return true;
        } catch (error) {
            if (error.name === 'QuotaExceededError') {
                return { error: 'STORAGE_FULL', message: 'Storage quota exceeded' };
            }
            console.error('Error saving documents:', error);
            return { error: 'SAVE_ERROR', message: error.message };
        }
    }

    /**
     * Get current document ID
     */
    function getCurrentDocumentId() {
        return localStorage.getItem(STORAGE_KEYS.CURRENT_DOCUMENT);
    }

    /**
     * Set current document ID
     */
    function setCurrentDocumentId(id) {
        if (id) {
            localStorage.setItem(STORAGE_KEYS.CURRENT_DOCUMENT, id);
        } else {
            localStorage.removeItem(STORAGE_KEYS.CURRENT_DOCUMENT);
        }
    }

    /**
     * Create a new document
     */
    function createDocument(name = 'Untitled PRD') {
        const id = 'doc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        const now = new Date().toISOString();
        
        return {
            id: id,
            name: name,
            created: now,
            modified: now,
            sections: {
                'executive-summary': '',
                'goals-objectives': '',
                'functional-requirements': '',
                'non-functional-requirements': '',
                'technical-specifications': '',
                'risks-mitigations': ''
            },
            attachments: [],
            metadata: {
                version: '1.0.0',
                author: '',
                status: 'draft',
                tags: []
            }
        };
    }

    /**
     * Delete a document
     */
    function deleteDocument(id) {
        const documents = getDocuments();
        if (documents[id]) {
            delete documents[id];
            const result = saveDocuments(documents);
            
            // If this was the current document, clear it
            if (getCurrentDocumentId() === id) {
                setCurrentDocumentId(null);
            }
            
            return result;
        }
        return false;
    }

    /**
     * Update document modified timestamp
     */
    function touchDocument(id) {
        const documents = getDocuments();
        if (documents[id]) {
            documents[id].modified = new Date().toISOString();
            return saveDocuments(documents);
        }
        return false;
    }

    /**
     * Get storage usage statistics
     */
    function getStorageStats() {
        try {
            let totalSize = 0;
            
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    const item = localStorage.getItem(key);
                    totalSize += item ? item.length : 0;
                }
            }
            
            // Rough estimate (characters * 2 for UTF-16)
            totalSize = totalSize * 2;
            
            return {
                used: totalSize,
                limit: STORAGE_LIMIT,
                percentage: (totalSize / STORAGE_LIMIT) * 100,
                available: STORAGE_LIMIT - totalSize
            };
        } catch (error) {
            console.error('Error calculating storage stats:', error);
            return {
                used: 0,
                limit: STORAGE_LIMIT,
                percentage: 0,
                available: STORAGE_LIMIT
            };
        }
    }

    /**
     * Export all documents as JSON
     */
    function exportAllDocuments() {
        const documents = getDocuments();
        const preferences = getPreferences();
        const exportData = {
            version: '1.0.0',
            exported: new Date().toISOString(),
            documents: documents,
            preferences: preferences
        };
        
        return JSON.stringify(exportData, null, 2);
    }

    /**
     * Import documents from JSON
     */
    function importDocuments(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            if (!data.documents) {
                throw new Error('Invalid import data: missing documents');
            }
            
            const documents = getDocuments();
            let imported = 0;
            
            for (let id in data.documents) {
                if (data.documents.hasOwnProperty(id)) {
                    // Generate new ID to avoid conflicts
                    const newId = 'doc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                    documents[newId] = data.documents[id];
                    documents[newId].id = newId;
                    documents[newId].name = documents[newId].name + ' (Imported)';
                    imported++;
                }
            }
            
            const result = saveDocuments(documents);
            if (result === true) {
                return { success: true, imported: imported };
            } else {
                return { success: false, error: result };
            }
        } catch (error) {
            console.error('Error importing documents:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Clear all storage
     */
    function clearAllStorage() {
        try {
            localStorage.removeItem(STORAGE_KEYS.DOCUMENTS);
            localStorage.removeItem(STORAGE_KEYS.CURRENT_DOCUMENT);
            localStorage.removeItem(STORAGE_KEYS.PREFERENCES);
            localStorage.removeItem(STORAGE_KEYS.COLLAPSE_STATES);
            return true;
        } catch (error) {
            console.error('Error clearing storage:', error);
            return false;
        }
    }

    /**
     * Get user preferences
     */
    function getPreferences() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
            return data ? JSON.parse(data) : {
                autoSaveEnabled: true,
                autoSaveInterval: 30000,
                theme: 'light',
                defaultView: 'expanded',
                showStorageIndicator: true
            };
        } catch (error) {
            console.error('Error loading preferences:', error);
            return {};
        }
    }

    /**
     * Save user preferences
     */
    function savePreferences(preferences) {
        try {
            localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(preferences));
            return true;
        } catch (error) {
            console.error('Error saving preferences:', error);
            return false;
        }
    }

    /**
     * Get collapse states for sections
     */
    function getCollapseStates(documentId) {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.COLLAPSE_STATES);
            const states = data ? JSON.parse(data) : {};
            return states[documentId] || {};
        } catch (error) {
            console.error('Error loading collapse states:', error);
            return {};
        }
    }

    /**
     * Save collapse states for sections
     */
    function saveCollapseStates(documentId, states) {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.COLLAPSE_STATES);
            const allStates = data ? JSON.parse(data) : {};
            allStates[documentId] = states;
            localStorage.setItem(STORAGE_KEYS.COLLAPSE_STATES, JSON.stringify(allStates));
            return true;
        } catch (error) {
            console.error('Error saving collapse states:', error);
            return false;
        }
    }

    /**
     * Search documents by name or content
     */
    function searchDocuments(query) {
        const documents = getDocuments();
        const results = [];
        const searchTerm = query.toLowerCase();
        
        for (let id in documents) {
            if (documents.hasOwnProperty(id)) {
                const doc = documents[id];
                let match = false;
                
                // Search in name
                if (doc.name && doc.name.toLowerCase().includes(searchTerm)) {
                    match = true;
                }
                
                // Search in sections
                if (!match && doc.sections) {
                    for (let section in doc.sections) {
                        if (doc.sections[section] && 
                            doc.sections[section].toLowerCase().includes(searchTerm)) {
                            match = true;
                            break;
                        }
                    }
                }
                
                if (match) {
                    results.push({
                        id: doc.id,
                        name: doc.name,
                        modified: doc.modified
                    });
                }
            }
        }
        
        // Sort by modified date (newest first)
        results.sort((a, b) => new Date(b.modified) - new Date(a.modified));
        
        return results;
    }

    /**
     * Get recent documents
     */
    function getRecentDocuments(limit = 5) {
        const documents = getDocuments();
        const docs = Object.values(documents);
        
        // Sort by modified date (newest first)
        docs.sort((a, b) => new Date(b.modified) - new Date(a.modified));
        
        return docs.slice(0, limit).map(doc => ({
            id: doc.id,
            name: doc.name,
            modified: doc.modified
        }));
    }

    /**
     * Validate document structure
     */
    function validateDocument(doc) {
        const requiredFields = ['id', 'name', 'created', 'modified', 'sections'];
        const requiredSections = [
            'executive-summary',
            'goals-objectives',
            'functional-requirements',
            'non-functional-requirements',
            'technical-specifications',
            'risks-mitigations'
        ];
        
        for (let field of requiredFields) {
            if (!doc.hasOwnProperty(field)) {
                return { valid: false, error: `Missing required field: ${field}` };
            }
        }
        
        if (!doc.sections || typeof doc.sections !== 'object') {
            return { valid: false, error: 'Invalid sections structure' };
        }
        
        for (let section of requiredSections) {
            if (!doc.sections.hasOwnProperty(section)) {
                doc.sections[section] = ''; // Auto-fix missing sections
            }
        }
        
        return { valid: true };
    }

    /**
     * Create backup of all data
     */
    function createBackup() {
        const backup = {
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            data: {}
        };
        
        // Backup all PRD-related localStorage items
        for (let key in localStorage) {
            if (key.startsWith('prd-')) {
                backup.data[key] = localStorage.getItem(key);
            }
        }
        
        return backup;
    }

    /**
     * Restore from backup
     */
    function restoreBackup(backup) {
        try {
            if (!backup || !backup.data) {
                throw new Error('Invalid backup data');
            }
            
            // Clear existing data
            for (let key in localStorage) {
                if (key.startsWith('prd-')) {
                    localStorage.removeItem(key);
                }
            }
            
            // Restore backup data
            for (let key in backup.data) {
                localStorage.setItem(key, backup.data[key]);
            }
            
            return { success: true };
        } catch (error) {
            console.error('Error restoring backup:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get current document
     */
    function getCurrentDocument() {
        const currentId = getCurrentDocumentId();
        if (!currentId) return null;
        
        const documents = getDocuments();
        return documents[currentId] || null;
    }
    
    /**
     * Save/update a specific document
     */
    function saveDocument(doc) {
        if (!doc || !doc.id) return false;
        
        const documents = getDocuments();
        documents[doc.id] = doc;
        documents[doc.id].modified = new Date().toISOString();
        
        const result = saveDocuments(documents);
        return result === true;
    }
    
    /**
     * Get a specific document by ID
     */
    function getDocument(docId) {
        if (!docId) return null;
        const documents = getDocuments();
        return documents[docId] || null;
    }
    
    // Public API
    return {
        getDocuments,
        saveDocuments,
        getCurrentDocumentId,
        setCurrentDocumentId,
        getCurrentDocument,
        getDocument,
        saveDocument,
        createDocument,
        deleteDocument,
        touchDocument,
        getStorageStats,
        exportAllDocuments,
        importDocuments,
        clearAllStorage,
        getPreferences,
        savePreferences,
        getCollapseStates,
        saveCollapseStates,
        searchDocuments,
        getRecentDocuments,
        validateDocument,
        createBackup,
        restoreBackup
    };
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StorageManager;
}

// Make StorageManager available globally
if (typeof window !== 'undefined') {
    window.StorageManager = StorageManager;
}