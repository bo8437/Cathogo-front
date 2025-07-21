import React from 'react';
import DocumentPreview from '../clients/DocumentPreview';
import './dashboard.css';

const ClientDetailsModal = ({ client, onClose }) => {
  return (
    <div className="modal">
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">Client Details</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <div className="client-details">
          <div className="details-section">
            <h4>Basic Information</h4>
            <div className="details-grid">
              <div>
                <label>Name:</label>
                <p>{client.name}</p>
              </div>
              <div>
                <label>Beneficiary:</label>
                <p>{client.beneficiary}</p>
              </div>
              <div>
                <label>Domiciliation:</label>
                <p>{client.domiciliation}</p>
              </div>
              <div>
                <label>Currency:</label>
                <p>{client.currency}</p>
              </div>
              <div>
                <label>Amount:</label>
                <p>{client.amount}</p>
              </div>
              <div>
                <label>Reason:</label>
                <p>{client.reason}</p>
              </div>
            </div>
          </div>

          <div className="details-section">
            <h4>Documents</h4>
            {console.log('Client documents:', client.documents)}
            {client.documents?.length > 0 ? (
                <div className="documents-container">
                    {client.documents.map((doc, index) => {
                        console.log(`Document ${index} raw data:`, doc);
                        
                        // Handle case where doc is just an ID string
                        const documentData = typeof doc === 'string' 
                            ? { filePath: doc, fileName: `Document-${index + 1}` } 
                            : doc;
                            
                        console.log(`Document ${index} processed:`, documentData);
                        
                        return (
                            <DocumentPreview
                                key={index}
                                doc={documentData}
                            />
                        );
                    })}
                </div>
            ) : (
                <span className="no-documents">No documents uploaded</span>
            )}
          </div>

          <div className="details-section">
            <h4>Status and Timeline</h4>
            <div className="details-grid">
              <div>
                <label>Status:</label>
                <span className={`status-badge status-${client.status}`}>
                  {client.status}
                </span>
              </div>
              <div>
                <label>Physical Deposit Date:</label>
                <p>{new Date(client.physicalDepositDate).toLocaleDateString()}</p>
              </div>
              <div>
                <label>System Registration Date:</label>
                <p>{new Date(client.systemRegistrationDate).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {client.comments.length > 0 && (
            <div className="details-section">
              <h4>Comments</h4>
              <div className="comments-list">
                {client.comments.map((comment, index) => (
                  <div key={index} className="comment-item">
                    <p>{comment.text}</p>
                    <small>
                      {new Date(comment.createdAt).toLocaleString()}
                    </small>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientDetailsModal;
