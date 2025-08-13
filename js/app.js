/**
 * PRD-Builder Application
 * Main application module for creating and managing Product Requirements Documents
 */

const PRDBuilder = (function() {
    'use strict';

    // Application state
    const state = {
        currentDocument: null,
        documents: {},
        autoSaveInterval: null,
        storageWarningThreshold: 0.8,
        autoSaveDelay: 30000, // 30 seconds
        quillEditors: {} // Store Quill editor instances
    };

    // DOM element references
    const elements = {
        app: null,
        documentList: null,
        newPrdBtn: null,
        storageAlert: null,
        storageBar: null,
        storageText: null
    };

    // PRD sections configuration
    const sections = [
        {
            id: 'executive-summary',
            title: 'Executive Summary',
            icon: 'bi-briefcase',
            placeholder: 'Provide a high-level overview of the product or feature...',
            help: 'Summarize the key points of your PRD in 2-3 paragraphs'
        },
        {
            id: 'goals-objectives',
            title: 'Goals & Objectives',
            icon: 'bi-bullseye',
            placeholder: 'Define the primary goals and specific objectives...',
            help: 'List the main goals and measurable objectives for this product'
        },
        {
            id: 'functional-requirements',
            title: 'Functional Requirements',
            icon: 'bi-gear',
            placeholder: 'Describe the functional requirements in detail...',
            help: 'Specify what the product must do - features and capabilities'
        },
        {
            id: 'non-functional-requirements',
            title: 'Non-functional Requirements',
            icon: 'bi-shield-check',
            placeholder: 'Define performance, security, and other non-functional requirements...',
            help: 'Specify quality attributes like performance, security, usability'
        },
        {
            id: 'technical-specifications',
            title: 'Technical Specifications',
            icon: 'bi-cpu',
            placeholder: 'Outline the technical architecture and specifications...',
            help: 'Describe technical details, architecture, and implementation notes'
        },
        {
            id: 'risks-mitigations',
            title: 'Risks & Mitigations',
            icon: 'bi-exclamation-triangle',
            placeholder: 'Identify potential risks and mitigation strategies...',
            help: 'List potential risks and how to mitigate them'
        }
    ];

    /**
     * Initialize the application
     */
    function init() {
        cacheDOMElements();
        bindEvents();
        loadDocuments();
        initializeStorage();
        renderApplication();
        startAutoSave();
        
        console.log('PRD-Builder initialized successfully');
    }

    /**
     * Cache DOM element references
     */
    function cacheDOMElements() {
        elements.app = document.getElementById('app');
        elements.documentList = document.getElementById('documentList');
        elements.newPrdBtn = document.getElementById('newPrdBtn');
        elements.storageAlert = document.getElementById('storageAlert');
        elements.storageBar = document.getElementById('storageBar');
        elements.storageText = document.getElementById('storageText');
    }

    /**
     * Bind event listeners
     */
    function bindEvents() {
        if (elements.newPrdBtn) {
            elements.newPrdBtn.addEventListener('click', createNewDocument);
        }

        // Global keyboard shortcuts
        document.addEventListener('keydown', handleKeyboardShortcuts);

        // Handle before unload
        window.addEventListener('beforeunload', handleBeforeUnload);
    }

    /**
     * Handle keyboard shortcuts
     */
    function handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + S to save
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            saveCurrentDocument();
            showSaveIndicator();
        }
        
        // Ctrl/Cmd + N for new document
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            createNewDocument();
        }
    }

    /**
     * Handle before unload event
     */
    function handleBeforeUnload(e) {
        if (hasUnsavedChanges()) {
            e.preventDefault();
            e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
            return e.returnValue;
        }
    }

    /**
     * Check for unsaved changes
     */
    function hasUnsavedChanges() {
        // Implementation will be added with auto-save functionality
        return false;
    }

    /**
     * Load documents from localStorage
     */
    function loadDocuments() {
        try {
            const stored = localStorage.getItem('prd-documents');
            if (stored) {
                state.documents = JSON.parse(stored);
            }
            
            // Load current document ID
            const currentId = localStorage.getItem('prd-current-document');
            if (currentId && state.documents[currentId]) {
                state.currentDocument = currentId;
            }
        } catch (error) {
            console.error('Error loading documents:', error);
            state.documents = {};
        }
    }

    /**
     * Initialize storage monitoring
     */
    function initializeStorage() {
        updateStorageIndicator();
        
        // Check storage periodically
        setInterval(updateStorageIndicator, 5000);
    }

    /**
     * Update storage indicator
     */
    function updateStorageIndicator() {
        try {
            const used = new Blob(Object.values(localStorage)).size;
            const total = 10 * 1024 * 1024; // Assume 10MB limit
            const percentage = (used / total) * 100;
            
            if (elements.storageBar) {
                elements.storageBar.style.width = percentage + '%';
                
                // Update color based on usage
                elements.storageBar.classList.remove('bg-success', 'bg-warning', 'bg-danger');
                if (percentage < 50) {
                    elements.storageBar.classList.add('bg-success');
                } else if (percentage < 80) {
                    elements.storageBar.classList.add('bg-warning');
                } else {
                    elements.storageBar.classList.add('bg-danger');
                }
            }
            
            if (elements.storageText) {
                elements.storageText.textContent = Math.round(percentage) + '%';
            }
            
            // Update alert style based on usage
            if (elements.storageAlert) {
                elements.storageAlert.classList.remove('alert-info', 'alert-warning', 'alert-danger');
                if (percentage < 50) {
                    elements.storageAlert.classList.add('alert-info');
                } else if (percentage < 80) {
                    elements.storageAlert.classList.add('alert-warning');
                } else {
                    elements.storageAlert.classList.add('alert-danger');
                }
            }
            
            // Show warning if approaching limit
            if (percentage > state.storageWarningThreshold * 100) {
                showStorageWarning(percentage);
            }
        } catch (error) {
            console.error('Error checking storage:', error);
        }
    }

    /**
     * Show storage warning
     */
    function showStorageWarning(percentage) {
        if (elements.storageAlert) {
            elements.storageAlert.classList.remove('d-none');
            elements.storageAlert.classList.remove('alert-info');
            elements.storageAlert.classList.add('alert-warning');
            
            if (percentage > 95) {
                elements.storageAlert.classList.remove('alert-warning');
                elements.storageAlert.classList.add('alert-danger');
            }
        }
    }

    /**
     * Create a new document
     */
    function createNewDocument() {
        // Show the modal instead of using prompt
        const modal = new bootstrap.Modal(document.getElementById('newDocumentModal'));
        const nameInput = document.getElementById('documentName');
        const createBtn = document.getElementById('createDocumentBtn');
        
        // Clear previous input
        nameInput.value = '';
        
        // Show modal
        modal.show();
        
        // Focus on input when modal is shown
        document.getElementById('newDocumentModal').addEventListener('shown.bs.modal', function() {
            nameInput.focus();
        }, { once: true });
        
        // Remove previous event listeners
        const newCreateBtn = createBtn.cloneNode(true);
        createBtn.parentNode.replaceChild(newCreateBtn, createBtn);
        
        // Handle create button click
        newCreateBtn.onclick = function() {
            const name = nameInput.value.trim() || 'Untitled PRD';
            const id = 'doc_' + Date.now();
            
            state.documents[id] = {
                id: id,
                name: name,
                created: new Date().toISOString(),
                modified: new Date().toISOString(),
                sections: {}
            };
            
            state.currentDocument = id;
            saveDocuments();
            renderApplication();
            updateDocumentList();
            
            // Hide modal
            modal.hide();
        };
        
        // Handle Enter key in input
        nameInput.onkeypress = function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                newCreateBtn.click();
            }
        };
    }

    /**
     * Save documents to localStorage
     */
    function saveDocuments() {
        try {
            localStorage.setItem('prd-documents', JSON.stringify(state.documents));
            localStorage.setItem('prd-current-document', state.currentDocument);
        } catch (error) {
            console.error('Error saving documents:', error);
            if (error.name === 'QuotaExceededError') {
                handleStorageFull();
            }
        }
    }

    /**
     * Handle storage full error
     */
    function handleStorageFull() {
        if (confirm('Storage is full. Would you like to download all documents and clear storage?')) {
            downloadAllDocuments();
            clearStorage();
        }
    }

    /**
     * Download all documents
     */
    function downloadAllDocuments() {
        const data = JSON.stringify(state.documents, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'prd-documents-backup.json';
        a.click();
        URL.revokeObjectURL(url);
    }

    /**
     * Clear storage
     */
    function clearStorage() {
        if (confirm('This will remove all documents from browser storage. Continue?')) {
            localStorage.removeItem('prd-documents');
            localStorage.removeItem('prd-current-document');
            state.documents = {};
            state.currentDocument = null;
            renderApplication();
        }
    }

    /**
     * Save current document
     */
    function saveCurrentDocument() {
        if (!state.currentDocument) return;
        
        const doc = state.documents[state.currentDocument];
        if (!doc) return;
        
        // Collect data from all Quill editors
        sections.forEach(section => {
            const editor = state.quillEditors[section.id];
            if (editor) {
                // Save both HTML and plain text
                doc.sections[section.id] = {
                    html: editor.root.innerHTML,
                    text: editor.getText(),
                    delta: editor.getContents() // Quill Delta format for perfect reconstruction
                };
            }
        });
        
        doc.modified = new Date().toISOString();
        saveDocuments();
    }

    /**
     * Start auto-save
     */
    function startAutoSave() {
        if (state.autoSaveInterval) {
            clearInterval(state.autoSaveInterval);
        }
        
        state.autoSaveInterval = setInterval(() => {
            saveCurrentDocument();
            showSaveIndicator();
        }, state.autoSaveDelay);
    }

    /**
     * Show save indicator
     */
    function showSaveIndicator() {
        let indicator = document.getElementById('saveIndicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'saveIndicator';
            indicator.className = 'auto-save-indicator';
            document.body.appendChild(indicator);
        }
        
        indicator.textContent = 'Saving...';
        indicator.className = 'auto-save-indicator saving';
        
        setTimeout(() => {
            indicator.textContent = 'All changes saved';
            indicator.className = 'auto-save-indicator saved';
            
            setTimeout(() => {
                indicator.className = 'auto-save-indicator';
            }, 2000);
        }, 500);
    }

    /**
     * Update document list dropdown
     */
    function updateDocumentList() {
        if (!elements.documentList) return;
        
        elements.documentList.innerHTML = '';
        
        if (Object.keys(state.documents).length === 0) {
            const item = document.createElement('li');
            item.innerHTML = '<span class="dropdown-item-text text-muted">No documents</span>';
            elements.documentList.appendChild(item);
            return;
        }
        
        Object.values(state.documents).forEach(doc => {
            const item = document.createElement('li');
            const link = document.createElement('a');
            link.className = 'dropdown-item document-item';
            if (doc.id === state.currentDocument) {
                link.classList.add('active');
            }
            link.href = '#';
            link.innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <span>${doc.name}</span>
                    <small class="text-muted">${new Date(doc.modified).toLocaleDateString()}</small>
                </div>
            `;
            link.addEventListener('click', (e) => {
                e.preventDefault();
                switchDocument(doc.id);
            });
            item.appendChild(link);
            elements.documentList.appendChild(item);
        });
    }

    /**
     * Switch to a different document
     */
    function switchDocument(id) {
        saveCurrentDocument();
        state.currentDocument = id;
        localStorage.setItem('prd-current-document', id);
        renderApplication();
        updateDocumentList();
    }

    /**
     * Render the main application
     */
    function renderApplication() {
        if (!elements.app) return;
        
        if (!state.currentDocument || !state.documents[state.currentDocument]) {
            renderEmptyState();
            return;
        }
        
        const doc = state.documents[state.currentDocument];
        renderPRDForm(doc);
        updateDocumentList();
    }

    /**
     * Render empty state
     */
    function renderEmptyState() {
        elements.app.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-file-earmark-text" style="font-size: 4rem; color: var(--prd-primary);"></i>
                <h3 class="mt-3">No Document Selected</h3>
                <p class="text-muted">Create a new PRD to get started</p>
                <button class="btn btn-primary btn-lg" onclick="PRDBuilder.createNewDocument()">
                    <i class="bi bi-plus-circle"></i> Create New PRD
                </button>
            </div>
        `;
    }

    /**
     * Render PRD form
     */
    function renderPRDForm(doc) {
        const accordionId = 'prdAccordion';
        
        let html = `
            <div class="card mb-3">
                <div class="card-body">
                    <div class="d-flex align-items-center mb-2">
                        <h2 class="card-title mb-0 flex-grow-1" id="prdTitle">
                            <span id="titleText">${doc.name}</span>
                            <button class="btn btn-sm btn-link text-secondary ms-2" id="editTitleBtn" title="Edit title" onclick="PRDBuilder.startEditTitle()">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <input type="text" class="form-control form-control-lg d-none" id="titleInput" value="${doc.name}" 
                                   onkeypress="if(event.key==='Enter'){PRDBuilder.saveTitleChange();}"
                                   onblur="PRDBuilder.saveTitleChange()"
                                   onkeydown="if(event.key==='Escape'){PRDBuilder.cancelTitleEdit();}" />
                            <span class="section-indicator ${getSectionCompletion(doc) ? 'completed' : ''}"></span>
                        </h2>
                    </div>
                    <p class="text-muted mb-0">
                        Created: ${new Date(doc.created).toLocaleDateString()} | 
                        Modified: ${new Date(doc.modified).toLocaleString()}
                    </p>
                </div>
            </div>
            
            <div class="accordion" id="${accordionId}">
        `;
        
        sections.forEach((section, index) => {
            const isExpanded = index === 0;
            // Handle both old string format and new object format
            let content = doc.sections[section.id] || '';
            let hasContent = false;
            
            if (typeof content === 'object' && content !== null) {
                // New format with HTML/Delta
                hasContent = content.text && content.text.trim().length > 1; // Quill always has \n
            } else {
                // Old format (plain text)
                hasContent = content.trim().length > 0;
            }
            
            html += `
                <div class="accordion-item">
                    <h2 class="accordion-header">
                        <button class="accordion-button ${!isExpanded ? 'collapsed' : ''}" 
                                type="button" 
                                data-bs-toggle="collapse" 
                                data-bs-target="#${section.id}" 
                                aria-expanded="${isExpanded}" 
                                aria-controls="${section.id}">
                            <i class="${section.icon} me-2"></i>
                            ${section.title}
                            <span class="section-indicator ${hasContent ? 'completed' : ''} ms-2"></span>
                            <i class="bi bi-question-circle help-tooltip ms-auto" 
                               data-bs-toggle="tooltip" 
                               data-bs-placement="top" 
                               title="${section.help}"></i>
                        </button>
                    </h2>
                    <div id="${section.id}" 
                         class="accordion-collapse collapse ${isExpanded ? 'show' : ''}" 
                         data-bs-parent="#${accordionId}">
                        <div class="accordion-body">
                            <div class="quill-wrapper">
                                <div id="${section.id}-editor" class="quill-editor"></div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += `
            </div>
            
            <div class="card mt-4">
                <div class="card-body">
                    <h5 class="card-title">Actions</h5>
                    <div class="btn-group" role="group">
                        <button class="btn btn-primary" onclick="PRDBuilder.exportDocument('docx')">
                            <i class="bi bi-file-earmark-word"></i> Export to Word
                        </button>
                        <button class="btn btn-outline-primary" onclick="PRDBuilder.exportDocument('pdf')">
                            <i class="bi bi-file-earmark-pdf"></i> Export to PDF
                        </button>
                        <button class="btn btn-outline-primary" onclick="PRDBuilder.exportDocument('md')">
                            <i class="bi bi-markdown"></i> Export to Markdown
                        </button>
                    </div>
                    <button class="btn btn-outline-danger ms-3" onclick="PRDBuilder.deleteDocument()">
                        <i class="bi bi-trash"></i> Delete Document
                    </button>
                </div>
            </div>
        `;
        
        elements.app.innerHTML = html;
        
        // Initialize attachments after DOM is updated
        if (typeof AttachmentManager !== 'undefined') {
            AttachmentManager.init();
        }
        
        // Initialize tooltips
        const tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        tooltips.forEach(tooltip => new bootstrap.Tooltip(tooltip));
        
        // Title editing functionality is now handled via inline onclick handlers
        
        // Initialize Quill editors for each section
        initializeQuillEditors(doc);
        
        // Add listeners for auto-save
        Object.values(state.quillEditors).forEach(editor => {
            editor.on('text-change', debounce(() => {
                saveCurrentDocument();
                showSaveIndicator();
                updateSectionIndicators();
            }, 2000));
        });
    }

    /**
     * Initialize Quill editors
     */
    function initializeQuillEditors(doc) {
        // Clear existing editors
        state.quillEditors = {};
        
        sections.forEach(section => {
            const editorElement = document.getElementById(`${section.id}-editor`);
            if (editorElement) {
                // Configure Quill toolbar
                const toolbarOptions = [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    ['blockquote', 'code-block'],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    [{ 'indent': '-1'}, { 'indent': '+1' }],
                    ['link'],
                    ['clean']
                ];
                
                // Initialize Quill editor
                const quill = new Quill(`#${section.id}-editor`, {
                    theme: 'snow',
                    placeholder: section.placeholder,
                    modules: {
                        toolbar: toolbarOptions
                    }
                });
                
                // Load existing content
                const content = doc.sections[section.id];
                if (content) {
                    if (typeof content === 'object' && content.delta) {
                        // Load from Delta format (best for preserving formatting)
                        quill.setContents(content.delta);
                    } else if (typeof content === 'object' && content.html) {
                        // Load from HTML
                        quill.root.innerHTML = content.html;
                    } else if (typeof content === 'string') {
                        // Load plain text (for backward compatibility)
                        quill.setText(content);
                    }
                }
                
                // Store editor instance
                state.quillEditors[section.id] = quill;
            }
        });
    }
    
    /**
     * Update section indicators
     */
    function updateSectionIndicators() {
        if (!state.currentDocument) return;
        const doc = state.documents[state.currentDocument];
        if (!doc) return;
        
        sections.forEach(section => {
            const editor = state.quillEditors[section.id];
            const indicator = document.querySelector(`#${section.id}`).previousElementSibling.querySelector('.section-indicator');
            
            if (editor && indicator) {
                const text = editor.getText().trim();
                if (text.length > 0) {
                    indicator.classList.add('completed');
                } else {
                    indicator.classList.remove('completed');
                }
            }
        });
    }
    
    /**
     * Get section completion status
     */
    function getSectionCompletion(doc) {
        let completed = 0;
        let total = sections.length;
        
        sections.forEach(section => {
            const content = doc.sections[section.id];
            if (content) {
                if (typeof content === 'object' && content !== null) {
                    // New format - check text content
                    if (content.text && content.text.trim().length > 1) {
                        completed++;
                    }
                } else if (typeof content === 'string' && content.trim().length > 0) {
                    // Old format
                    completed++;
                }
            }
        });
        
        return completed === total;
    }

    /**
     * Delete current document
     */
    function deleteDocument() {
        if (!state.currentDocument) return;
        
        const currentDoc = state.documents[state.currentDocument];
        if (!currentDoc) return;
        
        // Show delete modal
        const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
        const deleteDocName = document.getElementById('deleteDocName');
        const confirmBtn = document.getElementById('confirmDeleteBtn');
        
        // Set document name in modal
        deleteDocName.textContent = currentDoc.name;
        
        // Show modal
        modal.show();
        
        // Remove previous event listeners
        const newConfirmBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
        
        // Handle confirm button click
        newConfirmBtn.onclick = function() {
            delete state.documents[state.currentDocument];
            state.currentDocument = null;
            
            // Select first available document
            const docs = Object.keys(state.documents);
            if (docs.length > 0) {
                state.currentDocument = docs[0];
            }
            
            saveDocuments();
            renderApplication();
            
            // Hide modal
            modal.hide();
        };
    }

    /**
     * Export document (placeholder - will be implemented in export.js)
     */
    async function exportDocument(format) {
        if (!state.currentDocument) return;
        
        const doc = state.documents[state.currentDocument];
        console.log(`Exporting document "${doc.name}" as ${format}`);
        
        // Check if ExportManager is available
        if (typeof ExportManager === 'undefined') {
            console.error('ExportManager not loaded');
            return;
        }
        
        let success = false;
        switch(format) {
            case 'docx':
            case 'word':
                success = await ExportManager.exportToWord(doc);
                break;
            case 'pdf':
                success = await ExportManager.exportToPDF(doc);
                break;
            case 'md':
            case 'markdown':
                success = ExportManager.exportToMarkdown(doc);
                break;
            default:
                console.error('Unknown export format:', format);
        }
        
        if (success) {
            console.log(`Successfully exported to ${format}`);
        }
    }

    /**
     * Start editing the document title
     */
    function startEditTitle() {
        const editTitleBtn = document.getElementById('editTitleBtn');
        const titleText = document.getElementById('titleText');
        const titleInput = document.getElementById('titleInput');
        
        if (titleText && titleInput && editTitleBtn) {
            titleText.classList.add('d-none');
            editTitleBtn.classList.add('d-none');
            titleInput.classList.remove('d-none');
            titleInput.focus();
            titleInput.select();
        }
    }
    
    /**
     * Save the title change
     */
    function saveTitleChange() {
        const titleText = document.getElementById('titleText');
        const titleInput = document.getElementById('titleInput');
        const editTitleBtn = document.getElementById('editTitleBtn');
        
        if (!state.currentDocument || !titleInput) return;
        
        const doc = state.documents[state.currentDocument];
        if (!doc) return;
        
        const newTitle = titleInput.value.trim();
        if (newTitle && newTitle !== doc.name) {
            doc.name = newTitle;
            titleText.textContent = newTitle;
            saveCurrentDocument();
            updateDocumentList();
            showSaveIndicator();
        }
        
        if (titleText && titleInput && editTitleBtn) {
            titleText.classList.remove('d-none');
            editTitleBtn.classList.remove('d-none');
            titleInput.classList.add('d-none');
        }
    }
    
    /**
     * Cancel title editing
     */
    function cancelTitleEdit() {
        const titleText = document.getElementById('titleText');
        const titleInput = document.getElementById('titleInput');
        const editTitleBtn = document.getElementById('editTitleBtn');
        
        if (!state.currentDocument) return;
        
        const doc = state.documents[state.currentDocument];
        if (!doc) return;
        
        if (titleInput) {
            titleInput.value = doc.name;
        }
        
        if (titleText && titleInput && editTitleBtn) {
            titleText.classList.remove('d-none');
            editTitleBtn.classList.remove('d-none');
            titleInput.classList.add('d-none');
        }
    }
    
    /**
     * Debounce helper function
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Public API
    return {
        init: init,
        createNewDocument: createNewDocument,
        deleteDocument: deleteDocument,
        exportDocument: exportDocument,
        startEditTitle: startEditTitle,
        saveTitleChange: saveTitleChange,
        cancelTitleEdit: cancelTitleEdit
    };
})();

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', PRDBuilder.init);