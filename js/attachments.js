const AttachmentManager = (() => {
    let attachments = [];
    let dragCounter = 0;
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB per file
    const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
    
    const init = () => {
        createAttachmentUI();
        setupEventListeners();
        loadAttachments();
    };
    
    const createAttachmentUI = () => {
        const attachmentSection = document.createElement('div');
        attachmentSection.className = 'accordion-item';
        attachmentSection.innerHTML = `
            <h2 class="accordion-header" id="heading-attachments">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" 
                        data-bs-target="#collapse-attachments" aria-expanded="false" 
                        aria-controls="collapse-attachments">
                    <i class="bi bi-paperclip me-2"></i>
                    Attachments
                    <span class="badge bg-secondary ms-2" id="attachmentCount">0</span>
                </button>
            </h2>
            <div id="collapse-attachments" class="accordion-collapse collapse" 
                 aria-labelledby="heading-attachments" data-bs-parent="#prdAccordion">
                <div class="accordion-body">
                    <!-- Drop Zone -->
                    <div id="dropZone" class="drop-zone">
                        <i class="bi bi-cloud-upload fs-1"></i>
                        <p class="mt-2">Drag & drop files here or click to browse</p>
                        <p class="text-muted small">Maximum file size: 5MB</p>
                        <input type="file" id="fileInput" class="d-none" multiple>
                        <button type="button" class="btn btn-outline-primary" id="browseBtn">
                            <i class="bi bi-folder2-open"></i> Browse Files
                        </button>
                    </div>
                    
                    <!-- Attachment List -->
                    <div id="attachmentList" class="mt-4">
                        <h6 class="d-none" id="attachmentListHeader">
                            <i class="bi bi-files"></i> Uploaded Files
                            <span class="text-muted small ms-2" id="totalSize">(Total: 0 KB)</span>
                        </h6>
                        <div id="attachmentItems" class="row g-3 mt-2">
                            <!-- Attachment items will be added here -->
                        </div>
                    </div>
                    
                    <!-- Progress Bar (hidden by default) -->
                    <div id="uploadProgress" class="mt-3 d-none">
                        <div class="progress">
                            <div class="progress-bar progress-bar-striped progress-bar-animated" 
                                 role="progressbar" style="width: 0%"></div>
                        </div>
                        <small class="text-muted" id="uploadStatus">Uploading...</small>
                    </div>
                </div>
            </div>
        `;
        
        // Insert after the last section but before export buttons
        const accordion = document.getElementById('prdAccordion');
        if (accordion) {
            const exportSection = accordion.querySelector('.export-section');
            if (exportSection) {
                accordion.insertBefore(attachmentSection, exportSection);
            } else {
                accordion.appendChild(attachmentSection);
            }
        }
    };
    
    const setupEventListeners = () => {
        const dropZone = document.getElementById('dropZone');
        const fileInput = document.getElementById('fileInput');
        const browseBtn = document.getElementById('browseBtn');
        
        if (!dropZone || !fileInput || !browseBtn) return;
        
        // Browse button click
        browseBtn.addEventListener('click', () => fileInput.click());
        
        // File input change
        fileInput.addEventListener('change', (e) => {
            handleFiles(e.target.files);
        });
        
        // Drag and drop events
        dropZone.addEventListener('dragenter', (e) => {
            e.preventDefault();
            dragCounter++;
            dropZone.classList.add('drag-over');
        });
        
        dropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            dragCounter--;
            if (dragCounter === 0) {
                dropZone.classList.remove('drag-over');
            }
        });
        
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
        });
        
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dragCounter = 0;
            dropZone.classList.remove('drag-over');
            handleFiles(e.dataTransfer.files);
        });
        
        // Click on drop zone to browse
        dropZone.addEventListener('click', (e) => {
            if (e.target === dropZone || e.target.parentElement === dropZone) {
                fileInput.click();
            }
        });
    };
    
    const handleFiles = async (files) => {
        const validFiles = [];
        const errors = [];
        
        for (const file of files) {
            if (file.size > MAX_FILE_SIZE) {
                errors.push(`${file.name} exceeds 5MB limit`);
                continue;
            }
            
            // Check if file already exists
            if (attachments.some(att => att.name === file.name)) {
                errors.push(`${file.name} already uploaded`);
                continue;
            }
            
            validFiles.push(file);
        }
        
        if (errors.length > 0) {
            showNotification(errors.join('<br>'), 'warning');
        }
        
        if (validFiles.length > 0) {
            await processFiles(validFiles);
        }
    };
    
    const processFiles = async (files) => {
        const progressBar = document.querySelector('#uploadProgress .progress-bar');
        const uploadProgress = document.getElementById('uploadProgress');
        const uploadStatus = document.getElementById('uploadStatus');
        
        uploadProgress.classList.remove('d-none');
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const progress = ((i + 1) / files.length) * 100;
            
            progressBar.style.width = `${progress}%`;
            uploadStatus.textContent = `Processing ${file.name}...`;
            
            try {
                const base64 = await fileToBase64(file);
                const attachment = {
                    id: generateId(),
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    data: base64,
                    uploadedAt: new Date().toISOString()
                };
                
                attachments.push(attachment);
                renderAttachment(attachment);
            } catch (error) {
                console.error('Error processing file:', error);
                showNotification(`Failed to process ${file.name}`, 'danger');
            }
        }
        
        setTimeout(() => {
            uploadProgress.classList.add('d-none');
            progressBar.style.width = '0%';
        }, 1000);
        
        updateAttachmentCount();
        saveAttachments();
    };
    
    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };
    
    const renderAttachment = (attachment) => {
        const attachmentItems = document.getElementById('attachmentItems');
        const attachmentListHeader = document.getElementById('attachmentListHeader');
        
        if (!attachmentItems) return;
        
        attachmentListHeader.classList.remove('d-none');
        
        const isImage = ALLOWED_IMAGE_TYPES.includes(attachment.type);
        const fileIcon = getFileIcon(attachment.type);
        
        const attachmentElement = document.createElement('div');
        attachmentElement.className = 'col-md-6 col-lg-4';
        attachmentElement.dataset.attachmentId = attachment.id;
        
        attachmentElement.innerHTML = `
            <div class="card attachment-card">
                <div class="card-body">
                    <div class="d-flex align-items-start">
                        ${isImage ? 
                            `<img src="${attachment.data}" class="attachment-preview me-3" alt="${attachment.name}">` :
                            `<i class="${fileIcon} fs-2 text-muted me-3"></i>`
                        }
                        <div class="flex-grow-1">
                            <h6 class="attachment-name text-truncate" title="${attachment.name}">
                                ${attachment.name}
                            </h6>
                            <small class="text-muted">${formatFileSize(attachment.size)}</small>
                        </div>
                        <button class="btn btn-sm btn-outline-danger" onclick="AttachmentManager.removeAttachment('${attachment.id}')">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        attachmentItems.appendChild(attachmentElement);
    };
    
    const removeAttachment = (attachmentId) => {
        const index = attachments.findIndex(att => att.id === attachmentId);
        if (index > -1) {
            attachments.splice(index, 1);
            
            const element = document.querySelector(`[data-attachment-id="${attachmentId}"]`);
            if (element) {
                element.remove();
            }
            
            updateAttachmentCount();
            saveAttachments();
            
            // Hide header if no attachments
            if (attachments.length === 0) {
                const attachmentListHeader = document.getElementById('attachmentListHeader');
                if (attachmentListHeader) {
                    attachmentListHeader.classList.add('d-none');
                }
            }
        }
    };
    
    const updateAttachmentCount = () => {
        const countBadge = document.getElementById('attachmentCount');
        const totalSizeElement = document.getElementById('totalSize');
        
        if (countBadge) {
            countBadge.textContent = attachments.length;
            countBadge.className = attachments.length > 0 ? 'badge bg-primary ms-2' : 'badge bg-secondary ms-2';
        }
        
        if (totalSizeElement) {
            const totalSize = attachments.reduce((sum, att) => sum + att.size, 0);
            totalSizeElement.textContent = `(Total: ${formatFileSize(totalSize)})`;
        }
    };
    
    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };
    
    const getFileIcon = (mimeType) => {
        const iconMap = {
            'application/pdf': 'bi bi-file-earmark-pdf-fill text-danger',
            'application/msword': 'bi bi-file-earmark-word-fill text-primary',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'bi bi-file-earmark-word-fill text-primary',
            'application/vnd.ms-excel': 'bi bi-file-earmark-excel-fill text-success',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'bi bi-file-earmark-excel-fill text-success',
            'application/vnd.ms-powerpoint': 'bi bi-file-earmark-ppt-fill text-warning',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'bi bi-file-earmark-ppt-fill text-warning',
            'text/plain': 'bi bi-file-earmark-text-fill',
            'text/csv': 'bi bi-file-earmark-spreadsheet-fill text-success',
            'application/zip': 'bi bi-file-earmark-zip-fill',
            'application/x-zip-compressed': 'bi bi-file-earmark-zip-fill'
        };
        
        if (mimeType.startsWith('image/')) return 'bi bi-file-earmark-image-fill text-info';
        if (mimeType.startsWith('video/')) return 'bi bi-file-earmark-play-fill text-danger';
        if (mimeType.startsWith('audio/')) return 'bi bi-file-earmark-music-fill text-purple';
        
        return iconMap[mimeType] || 'bi bi-file-earmark-fill';
    };
    
    const generateId = () => {
        return 'att_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    };
    
    const saveAttachments = () => {
        const currentDoc = window.StorageManager?.getCurrentDocument();
        if (currentDoc) {
            currentDoc.attachments = attachments;
            window.StorageManager.saveDocument(currentDoc);
        }
    };
    
    const loadAttachments = () => {
        const currentDoc = window.StorageManager?.getCurrentDocument();
        if (currentDoc && currentDoc.attachments) {
            attachments = currentDoc.attachments;
            
            // Clear existing UI
            const attachmentItems = document.getElementById('attachmentItems');
            if (attachmentItems) {
                attachmentItems.innerHTML = '';
            }
            
            // Render all attachments
            attachments.forEach(attachment => {
                renderAttachment(attachment);
            });
            
            updateAttachmentCount();
        }
    };
    
    const showNotification = (message, type = 'info') => {
        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-white bg-${type} border-0`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');
        
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">${message}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;
        
        let toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
            document.body.appendChild(toastContainer);
        }
        
        toastContainer.appendChild(toast);
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
        
        toast.addEventListener('hidden.bs.toast', () => {
            toast.remove();
        });
    };
    
    const getAttachments = () => attachments;
    
    const clearAttachments = () => {
        attachments = [];
        const attachmentItems = document.getElementById('attachmentItems');
        if (attachmentItems) {
            attachmentItems.innerHTML = '';
        }
        updateAttachmentCount();
        
        const attachmentListHeader = document.getElementById('attachmentListHeader');
        if (attachmentListHeader) {
            attachmentListHeader.classList.add('d-none');
        }
    };
    
    return {
        init,
        removeAttachment,
        getAttachments,
        clearAttachments,
        loadAttachments
    };
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AttachmentManager;
}