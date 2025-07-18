import React, { useState } from 'react';
import { uploadDocument } from '../../api/client';

const DocumentUpload = ({ clientId }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            // Validate file type
            const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
            if (!validTypes.includes(selectedFile.type)) {
                setError('Please select a PDF, JPEG, or PNG file');
                return;
            }
            
            // Validate file size (5MB max)
            if (selectedFile.size > 5 * 1024 * 1024) {
                setError('File size must be less than 5MB');
                return;
            }
            
            setFile(selectedFile);
            setError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return;

        setUploading(true);
        setError('');

        try {
            await uploadDocument(file, clientId);
            // Reset form
            setFile(null);
            e.target.reset();
        } catch (err) {
            setError(err.message || 'Failed to upload document');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="document-upload">
            <form onSubmit={handleSubmit} className="upload-form">
                <div className="form-group">
                    <input
                        type="file"
                        onChange={handleFileChange}
                        accept=".pdf,.jpg,.jpeg,.png"
                        disabled={uploading}
                    />
                </div>
                <button
                    type="submit"
                    className="upload-button"
                    disabled={uploading || !file}
                >
                    {uploading ? 'Uploading...' : 'Upload Document'}
                </button>
            </form>
            {error && <div className="error-message">{error}</div>}
        </div>
    );
};

export default DocumentUpload;
