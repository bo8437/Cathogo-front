import React from 'react';
import { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

const DocumentPreview = ({ document = {} }) => {
    const [showPreview, setShowPreview] = useState(false);

    const handlePreview = () => {
        console.log('Preview button clicked:', document);
        if (!document || !document.fileType) {
            console.log('No document data available');
            return;
        }
        
        if (document.fileType === 'application/pdf') {
            const fileName = document.filePath.split('/').pop();
            const downloadUrl = `${API_BASE_URL}/api/client/document/download/${encodeURIComponent(fileName)}`;
            
            // Get token from localStorage or your auth state
            const token = localStorage.getItem('authToken') || null;
            
            if (!token) {
                console.error('No authentication token found');
                // You might want to redirect to login here
                return;
            }
            
            // Create link element
            const link = window.document.createElement('a');
            link.href = downloadUrl;
            link.download = fileName;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            
            try {
                // Add authorization header to the request
                const headers = {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                };
                
                // Make the request with axios
                axios.get(downloadUrl, { headers })
                    .then(response => {
                        // Create blob from response
                        const blob = new Blob([response.data], { type: 'application/pdf' });
                        const blobUrl = window.URL.createObjectURL(blob);
                        
                        // Create and click link
                        link.href = blobUrl;
                        window.document.body.appendChild(link);
                        link.click();
                        window.document.body.removeChild(link);
                        
                        // Clean up blob URL
                        window.URL.revokeObjectURL(blobUrl);
                    })
                    .catch(error => {
                        console.error('Error downloading file:', error);
                        // Handle download errors
                    });
            } catch (error) {
                console.error('Error creating download link:', error);
            }
        } else {
            setShowPreview(true);
        }
    };

    const handleClose = () => {
        setShowPreview(false);
    };

    return (
        <div className="document-item">
            <div className="document-info">
                <span className="document-name">{document.fileName}</span>
                <span className="document-type">{document.fileType}</span>
            </div>
            <div className="document-actions">
                <button onClick={handlePreview} className="preview-button">
                    {document.fileType === 'application/pdf' ? 'Open in PDF Reader' : 'Preview'}
                </button>
            </div>

            {showPreview && (
                <div className="document-preview-modal">
                    <div className="preview-content">
                        <button onClick={handleClose} className="close-button">&times;</button>
                        <div className="preview-header">
                            <h3>Document Preview</h3>
                            <p>{document.fileName}</p>
                        </div>
                        <div className="preview-body">
                            {document.fileType !== 'application/pdf' && (
                                <img
                                    src={document.filePath}
                                    alt={document.fileName}
                                    style={{ maxWidth: '100%', maxHeight: '600px' }}
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentPreview;
