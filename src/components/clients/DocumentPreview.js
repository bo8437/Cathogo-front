import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_BASE_URL = 'http://localhost:5000';

const DocumentPreview = ({ doc = {} }) => {
    const [showPreview, setShowPreview] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState('');


    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/octet-stream',
        };
    };

    const handlePreview = async () => {
        if (!doc || !doc.filePath) {
            toast.error('No document available for preview');
            return;
        }

        setIsLoading(true);

        try {
            if (doc.fileType === 'application/pdf') {
                const fileName = doc.filePath.split(/[\\/]/).pop();
                const downloadUrl = `${API_BASE_URL}/api/client/document/download/${encodeURIComponent(fileName)}`;
                
                // For PDFs, open in a new tab
                const response = await axios.get(downloadUrl, {
                    headers: getAuthHeaders(),
                    responseType: 'blob'
                });

                const fileBlob = new Blob([response.data], { type: 'application/pdf' });
                const fileUrl = URL.createObjectURL(fileBlob);
                
                // Open PDF in a new tab
                window.open(fileUrl, '_blank');
                URL.revokeObjectURL(fileUrl); // Clean up
            } else {
                // For images, set the preview URL and show modal
                setPreviewUrl(doc.filePath);
                setShowPreview(true);
            }
        } catch (error) {
            console.error('Error handling document:', error);
            toast.error(`Failed to open document: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = async (e) => {
        console.log('1. Download button clicked');
        e.stopPropagation();
        
        if (!doc || !doc.filePath) {
            console.error('No document or file path available');
            toast.error('No document available for download');
            return;
        }

        setIsLoading(true);

        try {
            // Extract just the filename from the path
            const fileName = doc.filePath.split(/[\\/]/).pop();
            console.log('Downloading file:', fileName);
            
            const downloadUrl = `${API_BASE_URL}/api/client/document/download/${encodeURIComponent(fileName)}`;
            const token = localStorage.getItem('token');
            
            if (!token) {
                throw new Error('Please log in to download files');
            }

            // Use fetch to get the file with proper auth header
            const response = await fetch(downloadUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/pdf,image/*'
                },
                credentials: 'include' // Important for sending cookies if using httpOnly cookies
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to download file');
            }

            // Get the blob from the response
            const blob = await response.blob();
            
            // Create a URL for the blob
            const blobUrl = window.URL.createObjectURL(blob);
            
            // Create a temporary anchor element
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = fileName || 'document';
            
            // Append to body, trigger download, and clean up
            document.body.appendChild(link);
            link.click();
            
            // Clean up
            setTimeout(() => {
                document.body.removeChild(link);
                window.URL.revokeObjectURL(blobUrl);
                toast.success('Download started successfully');
            }, 100);
        } catch (error) {
            console.error('Download error:', error);
            
            if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                toast.error('Cannot connect to the server. Please check your connection or contact support.');
            } else if (error.message === 'Failed to fetch') {
                toast.error('Network error. Please check your internet connection.');
            } else if (error.response?.status === 401) {
                toast.error('Session expired. Please log in again.');
                // Optionally redirect to login
                // navigate('/login');
            } else {
                toast.error(`Download failed: ${error.message || 'Please try again later'}`);
            }
        } finally {
            setIsLoading(false);
        }
    };
    


    const handleClose = () => {
        setShowPreview(false);
        setPreviewUrl('');
    };

    if (!doc || !doc.filePath) {
        return <span className="no-document">No document</span>;
    }

    const isImage = doc.fileType && doc.fileType.startsWith('image/');
    const fileExtension = doc.fileName?.split('.').pop()?.toLowerCase() || 'file';

    return (
        <div className="document-preview">
            <div className="document-info">
                <span className="document-name" title={doc.fileName}>
                    {doc.fileName || 'Untitled document'}
                </span>
                <span className="document-type">{fileExtension}</span>
            </div>
            
            <div className="document-actions">
                <button 
                    onClick={handlePreview} 
                    className="action-button preview-button"
                    disabled={isLoading}
                    title={isImage ? 'Preview' : 'Open in viewer'}
                >
                    {isLoading ? 'Loading...' : isImage ? 'Preview' : 'View'}
                </button>
                
                <button
                    onClick={handleDownload}
                    className="action-button preview-button"
                    disabled={isLoading}
                    title="Download">
                    Download
                    </button>
            </div>

            {showPreview && isImage && (
                <div className="document-preview-modal" onClick={handleClose}>
                    <div className="preview-content" onClick={e => e.stopPropagation()}>
                        <button 
                            onClick={handleClose} 
                            className="close-button"
                            aria-label="Close preview"
                        >
                            &times;
                        </button>
                        <div className="preview-header">
                            <h3>Document Preview</h3>
                            <p>{doc.fileName}</p>
                        </div>
                        <div className="preview-body">
                            <img
                                src={previewUrl}
                                alt={doc.fileName}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = '/image-not-found.png';
                                    e.target.alt = 'Preview not available';
                                }}
                                style={{ maxWidth: '100%', maxHeight: '80vh' }}
                            />
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .document-preview {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 8px 0;
                    border-bottom: 1px solid #eee;
                }
                
                .document-info {
                    flex: 1;
                    min-width: 0;
                    margin-right: 12px;
                }
                
                .document-name {
                    display: block;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    font-weight: 500;
                }
                
                .document-type {
                    font-size: 0.8em;
                    color: #666;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                
                .document-actions {
                    display: flex;
                    gap: 8px;
                }
                
                .action-button {
                    padding: 4px 12px;
                    border: 1px solid #ddd;
                    background: white;
                    border-radius: 4px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                
                .action-button:hover {
                    background:rgb(97, 34, 34);
                }
                
                .action-button:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
                
                .preview-button {
                    color: #0066cc;
                    border-color: #0066cc;
                }
                
                .download-button {
                    min-width: 32px;
                }
                
                .document-preview-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.7);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                    padding: 20px;
                }
                
                .preview-content {
                    background: white;
                    border-radius: 8px;
                    max-width: 90%;
                    max-height: 90vh;
                    overflow: auto;
                    position: relative;
                    padding: 20px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
                }
                
                .close-button {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #666;
                }
                
                .preview-header {
                    margin-bottom: 20px;
                    text-align: center;
                }
                
                .preview-body {
                    max-height: 70vh;
                    overflow: auto;
                    display: flex;
                    justify-content: center;
                }
                
                .no-document {
                    color: #999;
                    font-style: italic;
                }
                
                @media (max-width: 768px) {
                    .document-preview {
                        flex-direction: column;
                        align-items: flex-start;
                    }
                    
                    .document-actions {
                        width: 100%;
                        margin-top: 8px;
                        justify-content: flex-end;
                    }
                }
            `}</style>
        </div>
    );
};

export default DocumentPreview; 






