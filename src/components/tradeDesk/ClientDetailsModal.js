import React, { useEffect } from 'react';
import './styles.css';

const ClientDetailsModal = ({ client, onClose }) => {
  if (!client) return null;

  // Log the client data for debugging
  useEffect(() => {
    console.log('Client data in modal:', client);
  }, [client]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  // Format amount with currency
  const formatAmount = (amount, currency) => {
    if (amount === undefined || amount === null) return 'N/A';
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency || 'USD',
      }).format(amount);
    } catch (error) {
      console.error('Error formatting amount:', error);
      return `${amount} ${currency || ''}`.trim();
    }
  };

  // Helper to safely access nested properties
  const safeGet = (obj, path, defaultValue = 'N/A') => {
    try {
      const value = path.split('.').reduce((o, p) => (o && o[p] !== undefined ? o[p] : null), client);
      return value !== null && value !== undefined ? value : defaultValue;
    } catch (error) {
      console.error(`Error accessing ${path}:`, error);
      return defaultValue;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Client Details</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        
        <div className="client-details-container">
          {/* Basic Information Section */}
          <div className="details-section">
            <h3>Basic Information</h3>
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">Name:</span>
                <span className="detail-value">{safeGet(client, 'name')}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Beneficiary:</span>
                <span className="detail-value">{safeGet(client, 'beneficiary')}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Domiciliation:</span>
                <span className="detail-value">{safeGet(client, 'domiciliation')}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Currency:</span>
                <span className="detail-value">{safeGet(client, 'currency')}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Amount:</span>
                <span className="detail-value">
                  {formatAmount(safeGet(client, 'amount'), safeGet(client, 'currency'))}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Reason:</span>
                <span className="detail-value">{safeGet(client, 'reason')}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Physical Deposit Date:</span>
                <span className="detail-value">{formatDate(safeGet(client, 'physicalDepositDate'))}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Status:</span>
                <span className={`status-badge status-${safeGet(client, 'status', 'pending').toLowerCase()}`}>
                  {safeGet(client, 'status')}
                </span>
              </div>
            </div>
          </div>

          {/* Dates Section */}
          <div className="details-section">
            <h3>Dates</h3>
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">System Registration Date:</span>
                <span className="detail-value">
                  {formatDate(safeGet(client, 'systemRegistrationDate'))}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Created At:</span>
                <span className="detail-value">
                  {formatDate(safeGet(client, 'createdAt'))}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Last Updated:</span>
                <span className="detail-value">
                  {formatDate(safeGet(client, 'updatedAt'))}
                </span>
              </div>
            </div>
          </div>

          {/* Documents Section */}
          <div className="details-section">
            <h3>Documents</h3>
            {client.documents?.length > 0 ? (
              <div className="documents-grid">
                {client.documents.map((doc, index) => (
                  <div key={index} className="document-item">
                    <div className="document-info">
                      <p><strong>{doc.fileName || 'Document ' + (index + 1)}</strong></p>
                      {doc.fileType && <p className="document-type">{doc.fileType}</p>}
                    </div>
                    <a
                      href={`/uploads/${doc.filePath}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="view-doc-btn"
                    >
                      View Document
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <p>No documents available</p>
            )}
          </div>

          {/* Created By & Last Modified By */}
          <div className="details-section">
            <h3>Audit Information</h3>
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">Created By:</span>
                <span className="detail-value">
                  {(() => {
                    const createdBy = safeGet(client, 'createdBy');
                    if (!createdBy) return 'N/A';
                    if (typeof createdBy === 'object') {
                      return `${createdBy.name || 'Unknown'} (${createdBy.role || 'N/A'})`;
                    }
                    return createdBy;
                  })()}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Last Modified By:</span>
                <span className="detail-value">
                  {(() => {
                    const lastModifiedBy = safeGet(client, 'lastModifiedBy');
                    if (!lastModifiedBy) return 'N/A';
                    if (typeof lastModifiedBy === 'object') {
                      return `${lastModifiedBy.name || 'Unknown'} (${lastModifiedBy.role || 'N/A'})`;
                    }
                    return lastModifiedBy;
                  })()}
                </span>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="details-section">
            <h3>Comments</h3>
            {client.comments?.length > 0 ? (
              <div className="comments-list">
                {client.comments.map((comment, index) => (
                  <div key={index} className="comment-item">
                    <p className="comment-text">{comment.text}</p>
                    <div className="comment-meta">
                      {comment.createdBy && (
                        <span className="comment-author">
                          {typeof comment.createdBy === 'object' 
                            ? comment.createdBy.name 
                            : comment.createdBy}
                        </span>
                      )}
                      <span className="comment-date">
                        {formatDate(comment.createdAt || comment.date)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No comments available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDetailsModal;
