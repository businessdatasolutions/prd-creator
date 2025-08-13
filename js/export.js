/**
 * Export Module for PRD-Builder
 * Handles export functionality for Word, PDF, and Markdown formats
 */

const ExportManager = (() => {
    
    /**
     * Export document to Word format (.docx)
     */
    async function exportToWord(doc) {
        try {
            // Check if docx library is loaded
            if (typeof docx === 'undefined') {
                throw new Error('docx library not loaded. Please check your internet connection.');
            }
            
            const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = docx;
            
            // Create document with optimized settings for Track Changes
            const wordDoc = new Document({
                creator: "PRD-Builder",
                title: doc.name,
                description: "Product Requirements Document",
                styles: {
                    default: {
                        heading1: {
                            run: {
                                size: 32,
                                bold: true,
                                color: "2E74B5"
                            },
                            paragraph: {
                                spacing: {
                                    before: 240,
                                    after: 120
                                }
                            }
                        },
                        heading2: {
                            run: {
                                size: 26,
                                bold: true,
                                color: "2E74B5"
                            },
                            paragraph: {
                                spacing: {
                                    before: 240,
                                    after: 120
                                }
                            }
                        },
                        document: {
                            run: {
                                size: 22,
                                font: "Calibri"
                            },
                            paragraph: {
                                spacing: {
                                    line: 276,
                                    after: 200
                                }
                            }
                        }
                    }
                },
                sections: [{
                    properties: {
                        page: {
                            margin: {
                                top: 1440,    // 1 inch
                                right: 1440,
                                bottom: 1440,
                                left: 1440
                            }
                        }
                    },
                    children: createWordContent(doc)
                }]
            });
            
            // Generate and download the document
            const blob = await Packer.toBlob(wordDoc);
            downloadFile(blob, `${sanitizeFilename(doc.name)}.docx`, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
            
            return true;
        } catch (error) {
            console.error('Error exporting to Word:', error);
            showNotification('Failed to export to Word: ' + error.message, 'danger');
            return false;
        }
    }
    
    /**
     * Create Word document content from PRD data
     */
    function createWordContent(doc) {
        const { Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } = docx;
        const children = [];
        
        // Title
        children.push(
            new Paragraph({
                text: doc.name,
                heading: HeadingLevel.TITLE,
                alignment: AlignmentType.CENTER,
                spacing: {
                    after: 400
                }
            })
        );
        
        // Metadata
        children.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: `Created: ${new Date(doc.created).toLocaleDateString()} | Modified: ${new Date(doc.modified).toLocaleString()}`,
                        italics: true,
                        size: 20,
                        color: "595959"
                    })
                ],
                alignment: AlignmentType.CENTER,
                spacing: {
                    after: 400
                }
            })
        );
        
        // Add review instructions
        children.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: "Review Instructions: ",
                        bold: true,
                        size: 22
                    }),
                    new TextRun({
                        text: "Please check the box (☐ → ☑) next to each section after review and add any comments in the provided space.",
                        italics: true,
                        size: 22,
                        color: "595959"
                    })
                ],
                spacing: {
                    after: 600
                },
                border: {
                    top: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
                    bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" }
                },
                shading: {
                    fill: "F5F5F5"
                }
            })
        );
        
        // Sections
        const sections = [
            { id: 'executive-summary', title: 'Executive Summary' },
            { id: 'goals-objectives', title: 'Goals & Objectives' },
            { id: 'functional-requirements', title: 'Functional Requirements' },
            { id: 'non-functional-requirements', title: 'Non-functional Requirements' },
            { id: 'technical-specifications', title: 'Technical Specifications' },
            { id: 'risks-mitigations', title: 'Risks & Mitigations' }
        ];
        
        sections.forEach(section => {
            const content = doc.sections[section.id];
            if (content && content.trim()) {
                // Section heading with checkbox
                children.push(
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: "☐  ",  // Unicode checkbox character with space
                                size: 32,
                                font: "Arial Unicode MS"
                            }),
                            new TextRun({
                                text: section.title,
                                bold: true,
                                size: 28
                            })
                        ],
                        heading: HeadingLevel.HEADING_1,
                        spacing: {
                            before: 400,
                            after: 200
                        }
                    })
                );
                
                // Section content - split by paragraphs
                const paragraphs = content.split('\n\n');
                paragraphs.forEach(para => {
                    if (para.trim()) {
                        children.push(
                            new Paragraph({
                                text: para.trim(),
                                spacing: {
                                    after: 200
                                }
                            })
                        );
                    }
                });
                
                // Add comment section after content
                children.push(
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: "Reviewer Comments:",
                                bold: true,
                                italics: true,
                                size: 22,
                                color: "1F4788"
                            })
                        ],
                        spacing: {
                            before: 200,
                            after: 100
                        }
                    })
                );
                
                // Add bordered comment box with lines for writing
                for (let i = 0; i < 4; i++) {
                    children.push(
                        new Paragraph({
                            text: "_____________________________________________________________________________",
                            spacing: {
                                after: 240  // Space between lines for writing
                            },
                            indent: {
                                left: 360  // Indent comment lines
                            }
                        })
                    );
                }
                
                // Add spacing after comment section
                children.push(
                    new Paragraph({
                        text: "",
                        spacing: {
                            after: 400
                        }
                    })
                );
            }
        });
        
        // Attachments section if any
        if (doc.attachments && doc.attachments.length > 0) {
            // Attachments heading with checkbox
            children.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: "☐  ",  // Unicode checkbox character with space
                            size: 32,
                            font: "Arial Unicode MS"
                        }),
                        new TextRun({
                            text: "Attachments",
                            bold: true,
                            size: 28
                        })
                    ],
                    heading: HeadingLevel.HEADING_1,
                    spacing: {
                        before: 400,
                        after: 200
                    }
                })
            );
            
            doc.attachments.forEach(attachment => {
                children.push(
                    new Paragraph({
                        text: `• ${attachment.name} (${formatFileSize(attachment.size)})`,
                        spacing: {
                            after: 100
                        }
                    })
                );
            });
            
            // Add comment section for attachments
            children.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: "Reviewer Comments:",
                            bold: true,
                            italics: true,
                            size: 22,
                            color: "1F4788"
                        })
                    ],
                    spacing: {
                        before: 200,
                        after: 100
                    }
                })
            );
            
            // Add bordered comment box with lines for writing
            for (let i = 0; i < 4; i++) {
                children.push(
                    new Paragraph({
                        text: "_____________________________________________________________________________",
                        spacing: {
                            after: 240  // Space between lines for writing
                        },
                        indent: {
                            left: 360  // Indent comment lines
                        }
                    })
                );
            }
        }
        
        // Add Review Summary section at the end
        children.push(
            new Paragraph({
                text: "",
                spacing: {
                    before: 800
                }
            })
        );
        
        // Add page break before review summary
        children.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: "DOCUMENT REVIEW SUMMARY",
                        bold: true,
                        size: 32,
                        color: "1F4788"
                    })
                ],
                alignment: AlignmentType.CENTER,
                spacing: {
                    before: 400,
                    after: 400
                },
                border: {
                    top: { style: BorderStyle.DOUBLE, size: 3, color: "1F4788" },
                    bottom: { style: BorderStyle.DOUBLE, size: 3, color: "1F4788" }
                }
            })
        );
        
        // Review checklist table
        const reviewSections = [
            "Executive Summary",
            "Goals & Objectives",
            "Functional Requirements",
            "Non-functional Requirements",
            "Technical Specifications",
            "Risks & Mitigations"
        ];
        
        if (doc.attachments && doc.attachments.length > 0) {
            reviewSections.push("Attachments");
        }
        
        // Add review status header
        children.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: "Section Review Status:",
                        bold: true,
                        size: 24
                    })
                ],
                spacing: {
                    before: 200,
                    after: 200
                }
            })
        );
        
        // Add checklist for each section
        reviewSections.forEach(sectionName => {
            children.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: "☐  ",
                            size: 24,
                            font: "Arial Unicode MS"
                        }),
                        new TextRun({
                            text: sectionName,
                            size: 22
                        }),
                        new TextRun({
                            text: " - Reviewed by: _________________________ Date: _____________",
                            size: 20,
                            color: "595959"
                        })
                    ],
                    spacing: {
                        after: 180
                    },
                    indent: {
                        left: 360
                    }
                })
            );
        });
        
        // Add final approval section
        children.push(
            new Paragraph({
                text: "",
                spacing: {
                    before: 400
                }
            })
        );
        
        children.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: "Final Document Approval:",
                        bold: true,
                        size: 24
                    })
                ],
                spacing: {
                    before: 200,
                    after: 200
                },
                border: {
                    top: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" }
                }
            })
        );
        
        // Approval signatures
        const approvers = [
            "Product Manager",
            "Technical Lead",
            "Project Manager",
            "Stakeholder Representative"
        ];
        
        approvers.forEach(role => {
            children.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: `${role}: `,
                            bold: true,
                            size: 22
                        })
                    ],
                    spacing: {
                        after: 100
                    }
                })
            );
            
            children.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: "Name: _________________________ Signature: _________________________ Date: _____________",
                            size: 20
                        })
                    ],
                    spacing: {
                        after: 300
                    },
                    indent: {
                        left: 720
                    }
                })
            );
        });
        
        // Add overall comments section
        children.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: "Overall Review Comments:",
                        bold: true,
                        size: 24
                    })
                ],
                spacing: {
                    before: 400,
                    after: 200
                },
                border: {
                    top: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" }
                }
            })
        );
        
        // Add lines for overall comments
        for (let i = 0; i < 6; i++) {
            children.push(
                new Paragraph({
                    text: "_________________________________________________________________________________",
                    spacing: {
                        after: 240
                    }
                })
            );
        }
        
        return children;
    }
    
    /**
     * Export document to PDF format
     */
    async function exportToPDF(doc) {
        try {
            // Check if jsPDF is loaded
            if (typeof jspdf === 'undefined' || !jspdf.jsPDF) {
                throw new Error('jsPDF library not loaded. Please check your internet connection.');
            }
            
            const { jsPDF } = jspdf;
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });
            
            // Set document properties
            pdf.setProperties({
                title: doc.name,
                subject: 'Product Requirements Document',
                author: 'PRD-Builder',
                keywords: 'PRD, requirements, product',
                creator: 'PRD-Builder'
            });
            
            // Title
            pdf.setFontSize(20);
            pdf.setTextColor(46, 116, 181);
            pdf.text(doc.name, 105, 20, { align: 'center' });
            
            // Metadata
            pdf.setFontSize(10);
            pdf.setTextColor(89, 89, 89);
            pdf.text(`Created: ${new Date(doc.created).toLocaleDateString()} | Modified: ${new Date(doc.modified).toLocaleString()}`, 105, 30, { align: 'center' });
            
            let yPosition = 45;
            const pageHeight = pdf.internal.pageSize.height;
            const margins = { top: 20, bottom: 20, left: 20, right: 20 };
            const maxWidth = 170;
            
            // Sections
            const sections = [
                { id: 'executive-summary', title: 'Executive Summary' },
                { id: 'goals-objectives', title: 'Goals & Objectives' },
                { id: 'functional-requirements', title: 'Functional Requirements' },
                { id: 'non-functional-requirements', title: 'Non-functional Requirements' },
                { id: 'technical-specifications', title: 'Technical Specifications' },
                { id: 'risks-mitigations', title: 'Risks & Mitigations' }
            ];
            
            sections.forEach(section => {
                const content = doc.sections[section.id];
                if (content && content.trim()) {
                    // Check if we need a new page
                    if (yPosition > pageHeight - 40) {
                        pdf.addPage();
                        yPosition = margins.top;
                    }
                    
                    // Section heading
                    pdf.setFontSize(14);
                    pdf.setTextColor(46, 116, 181);
                    pdf.setFont(undefined, 'bold');
                    pdf.text(section.title, margins.left, yPosition);
                    yPosition += 10;
                    
                    // Section content
                    pdf.setFontSize(11);
                    pdf.setTextColor(0, 0, 0);
                    pdf.setFont(undefined, 'normal');
                    
                    const lines = pdf.splitTextToSize(content, maxWidth);
                    lines.forEach(line => {
                        if (yPosition > pageHeight - margins.bottom) {
                            pdf.addPage();
                            yPosition = margins.top;
                        }
                        pdf.text(line, margins.left, yPosition);
                        yPosition += 6;
                    });
                    
                    yPosition += 5;
                }
            });
            
            // Attachments
            if (doc.attachments && doc.attachments.length > 0) {
                if (yPosition > pageHeight - 40) {
                    pdf.addPage();
                    yPosition = margins.top;
                }
                
                pdf.setFontSize(14);
                pdf.setTextColor(46, 116, 181);
                pdf.setFont(undefined, 'bold');
                pdf.text('Attachments', margins.left, yPosition);
                yPosition += 10;
                
                pdf.setFontSize(11);
                pdf.setTextColor(0, 0, 0);
                pdf.setFont(undefined, 'normal');
                
                doc.attachments.forEach(attachment => {
                    if (yPosition > pageHeight - margins.bottom) {
                        pdf.addPage();
                        yPosition = margins.top;
                    }
                    pdf.text(`• ${attachment.name} (${formatFileSize(attachment.size)})`, margins.left + 5, yPosition);
                    yPosition += 6;
                });
            }
            
            // Save the PDF
            pdf.save(`${sanitizeFilename(doc.name)}.pdf`);
            return true;
        } catch (error) {
            console.error('Error exporting to PDF:', error);
            showNotification('Failed to export to PDF: ' + error.message, 'danger');
            return false;
        }
    }
    
    /**
     * Export document to Markdown format
     */
    function exportToMarkdown(doc) {
        try {
            let markdown = `# ${doc.name}\n\n`;
            markdown += `*Created: ${new Date(doc.created).toLocaleDateString()} | Modified: ${new Date(doc.modified).toLocaleString()}*\n\n`;
            markdown += '---\n\n';
            
            // Sections
            const sections = [
                { id: 'executive-summary', title: 'Executive Summary' },
                { id: 'goals-objectives', title: 'Goals & Objectives' },
                { id: 'functional-requirements', title: 'Functional Requirements' },
                { id: 'non-functional-requirements', title: 'Non-functional Requirements' },
                { id: 'technical-specifications', title: 'Technical Specifications' },
                { id: 'risks-mitigations', title: 'Risks & Mitigations' }
            ];
            
            sections.forEach(section => {
                const content = doc.sections[section.id];
                if (content && content.trim()) {
                    markdown += `## ${section.title}\n\n`;
                    markdown += `${content.trim()}\n\n`;
                }
            });
            
            // Attachments
            if (doc.attachments && doc.attachments.length > 0) {
                markdown += '## Attachments\n\n';
                doc.attachments.forEach(attachment => {
                    markdown += `- ${attachment.name} (${formatFileSize(attachment.size)})\n`;
                });
                markdown += '\n';
            }
            
            // Create and download file
            const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
            downloadFile(blob, `${sanitizeFilename(doc.name)}.md`, 'text/markdown');
            
            return true;
        } catch (error) {
            console.error('Error exporting to Markdown:', error);
            showNotification('Failed to export to Markdown: ' + error.message, 'danger');
            return false;
        }
    }
    
    /**
     * Helper function to download a file
     */
    function downloadFile(blob, filename, mimeType) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        showNotification(`Successfully exported: ${filename}`, 'success');
    }
    
    /**
     * Sanitize filename for safe download
     */
    function sanitizeFilename(filename) {
        return filename.replace(/[^a-z0-9\s\-_]/gi, '').trim() || 'PRD-Document';
    }
    
    /**
     * Format file size for display
     */
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }
    
    /**
     * Show notification toast
     */
    function showNotification(message, type = 'info') {
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
    }
    
    // Public API
    return {
        exportToWord,
        exportToPDF,
        exportToMarkdown
    };
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ExportManager;
}