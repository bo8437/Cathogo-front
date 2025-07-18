import React, { useState, useEffect } from 'react';
import { tradeDeskService } from '../../services/tradeDeskService';
import { toast } from 'react-toastify';
import './styles.css';

const TradeDeskDashboard = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [note, setNote] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Not authenticated');
      setLoading(false);
      return;
    }
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      console.log('Fetching assigned clients for Trade Desk...');
      const response = await tradeDeskService.getAssignedClients();
      console.log('Received response:', response);
      
      if (!response) {
        console.warn('No data received from server');
        setClients([]);
        return;
      }

      // The service returns the array directly
      const clients = Array.isArray(response) ? response : [];
      console.log('Setting clients:', clients);
      setClients(clients);
    } catch (error) {
      console.error('Error fetching clients:', error);
      if (error?.type === 'timeout') {
        setError('Request timed out. Please check your internet connection or try again later.');
      } else if (error?.type === 'unauthorized') {
        setError('Not authorized. Please login again.');
      } else {
        setError(error.message || 'Failed to fetch clients');
      }
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (clientId, comment) => {
    try {
      await tradeDeskService.changeClientStatus(clientId, comment);
      toast.success('Client status updated successfully');
      await fetchClients();
    } catch (error) {
      console.error('Trade Desk Dashboard Error:', {
        message: error.message,
        status: error?.details?.status,
        statusText: error?.details?.statusText,
        data: error?.details?.data,
        config: error?.details?.config,
        fullUrl: error?.details?.fullUrl
      });
      
      if (error?.details?.status === 404) {
        setError('Could not find the Trade Desk API endpoint. Please check if the backend is running and accessible.');
      } else if (error?.details?.status === 401) {
        setError('Authentication failed. Please login again.');
      } else if (error?.details?.status === 403) {
        setError('Access denied. You must be a Trade Desk user to access this page.');
      } else {
        setError(
          <div className="error-container">
            <p>{error.message || 'Failed to update client status'}</p>
            <div className="error-details">
              <p>Status: {error?.response?.status}</p>
              <p>URL: {error?.config?.url}</p>
              <p>Full URL: {process.env.REACT_APP_API_URL + error?.config?.url}</p>
            </div>
          </div>
        );
      }
      setClients([]);
    }
  };

  const handleDeleteClient = async (clientId) => {
    if (!window.confirm('Are you sure you want to delete this client?')) {
      return;
    }

    try {
      await tradeDeskService.deleteClient(clientId);
      toast.success('Client deleted successfully');
      await fetchClients();
    } catch (error) {
      toast.error('Failed to delete client');
    }
  };

  const handleAddNote = async (clientId, note) => {
    try {
      await tradeDeskService.addNote(clientId, note);
      toast.success('Note added successfully');
      setShowNoteModal(false);
      setNote('');
      await fetchClients();
    } catch (error) {
      toast.error('Failed to add note');
    }
  };

  const handleSendToCore = async (clientId, comment) => {
    try {
      const response = await tradeDeskService.sendToCoreBanking(clientId, comment);
      toast.success('Client sent to Core Banking successfully');
      await fetchClients();
    } catch (error) {
      toast.error('Failed to send client to Core Banking');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div className="trade-desk-dashboard">
        <h2>Trade Desk Dashboard</h2>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="trade-desk-dashboard">
      <h2>Trade Desk Dashboard</h2>
      
      {clients.length > 0 ? (
        <div className="clients-list">
          {clients.map((client) => (
            <div key={client._id} className="client-card">
              <h3>{client.name}</h3>
              <p>Status: {client.status}</p>
              <p>Created By: {client.createdBy?.name} ({client.createdBy?.role})</p>
              <p>Last Modified By: {client.lastModifiedBy?.name} ({client.lastModifiedBy?.role})</p>
              <div className="client-actions">
                <button
                  onClick={() => {
                    setSelectedClient(client);
                    setShowDetailsModal(true);
                  }}
                  className="details-btn"
                >
                  View Details
                </button>
                <button
                  onClick={() => {
                    setSelectedClient(client);
                    setShowNoteModal(true);
                  }}
                  className="note-btn"
                >
                  Add Note
                </button>
                <button
                  onClick={() => handleSendToCore(client._id, 'Sending to Core Banking')}
                  className="core-btn"
                >
                  Send to Core
                </button>
                <button
                  onClick={() => handleStatusChange(client._id, 'Marking as completed')}
                  className="complete-btn"
                >
                  Complete
                </button>
                <button
                  onClick={() => handleDeleteClient(client._id)}
                  className="delete-btn"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-clients">
          <h3>No clients assigned</h3>
          <p>Waiting for clients to be forwarded from Treasury Officers</p>
        </div>
      )}

      {showDetailsModal && selectedClient && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Client Details</h3>
            <div className="client-details">
              <p>Name: {selectedClient.name}</p>
              <p>Beneficiary: {selectedClient.beneficiary}</p>
              <p>Amount: {selectedClient.amount} {selectedClient.currency}</p>
              <p>Status: {selectedClient.status}</p>
              <p>Created: {new Date(selectedClient.systemRegistrationDate).toLocaleDateString()}</p>
              <h4>Comments:</h4>
              <div className="comments-list">
                {selectedClient.comments?.map((comment, index) => (
                  <div key={index} className="comment-item">
                    <p>{comment.text}</p>
                    <small>
                      Added by {comment.createdBy} on {new Date(comment.createdAt).toLocaleDateString()}
                    </small>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() => {
                setShowDetailsModal(false);
                setSelectedClient(null);
              }}
              className="close-btn"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showNoteModal && selectedClient && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Add Note</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddNote(selectedClient._id, note);
              }}
            >
              <div className="form-group">
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Enter your note here..."
                  required
                  minLength="10"
                  className="note-input"
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowNoteModal(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Add Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TradeDeskDashboard;
