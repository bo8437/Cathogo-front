import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { treasuryOfficerService } from '../../services/treasuryOfficerService';
import { toast } from 'react-toastify';
import ForwardClientModal from './ForwardClientModal';
import ClientDetailsModal from './ClientDetailsModal';
import './dashboard.css';

const TreasuryOfficerDashboard = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

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
      console.log('Fetching assigned clients...');
      const response = await treasuryOfficerService.getAssignedClients();
      console.log('Received response:', response);
      
      if (!response) {
        console.warn('No data received from server');
        setClients([]);
        return;
      }
      
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
      setClients([]); // Clear clients on error
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (clientId, newStatus) => {
    try {
      await treasuryOfficerService.changeClientStatus(clientId, newStatus);
      toast.success('Client status updated successfully');
      await fetchClients();
    } catch (error) {
      toast.error('Failed to update client status');
    }
  };

  const handleForwardClient = async (clientId, target, comment) => {
    try {
      const result = await treasuryOfficerService.forwardClient(clientId, target, comment);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error('Failed to forward client');
      }
      setShowForwardModal(false);
      setSelectedClient(null);
      await fetchClients();
    } catch (error) {
      toast.error('Failed to forward client');
    }
  };

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner"></div>
        <p>Loading clients...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          <span className="error-icon">⚠</span>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="treasury-dashboard">
      <header className="dashboard-header">
        <h1>Assigned Clients</h1>
      </header>

      {clients.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-content">
            <span className="empty-state-icon">📄</span>
            <h2>No clients assigned</h2>
            <p>You don't have any assigned clients at the moment.</p>
          </div>
        </div>
      ) : (
        <div className="clients-list">
          {clients.map((client) => (
            <div key={client._id} className="client-card">
              <div className="client-header">
                <h3>{client.name}</h3>
                <div className="client-status">
                  <span className={`status-badge status-${client.status}`}>
                    {client.status}
                  </span>
                </div>
              </div>

              <div className="client-info">
              <div className="info-item">
                  <span className="label">Name:</span>
                  <span className="value">{client.name}</span>
                </div>
                <div className="info-item">
                  <span className="label">Beneficiary:</span>
                  <span className="value">{client.beneficiary}</span>
                </div>
                <div className="info-item">
                  <span className="label">Domiciliation:</span>
                  <span className="value">{client.domiciliation}</span>
                </div>
                <div className="info-item">
                  <span className="label">Amount:</span>
                  <span className="value">{client.amount} {client.currency}</span>
                </div>
                <div className="info-item">
                  <span className="label">Registration Date:</span>
                  <span className="value">
                    {new Date(client.systemRegistrationDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

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


                <Link
                  to={`/clients/${client._id}`}
                  className="btn btn-view"
                  style={{
                      padding: '8px 16px',
                      border: '1px solid #ddd',
                      background: '#fff',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      textDecoration: 'none',
                      color: '#333'
                  }}
                  >
                  View Details
              </Link>

                <button
                  onClick={() => handleStatusChange(client._id, 'completed')}
                  className="complete-btn"
                >
                  Complete
                </button>
                <button
                  onClick={() => {
                    setSelectedClient(client);
                    setShowForwardModal(true);
                  }}
                  className="forward-btn"
                >
                  Forward
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showDetailsModal && selectedClient && (
        <ClientDetailsModal
          client={selectedClient}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedClient(null);
          }}
        />
      )}

      {showForwardModal && selectedClient && (
        <ForwardClientModal
          clientId={selectedClient._id}
          onClose={() => {
            setShowForwardModal(false);
            setSelectedClient(null);
          }}
          onSubmit={handleForwardClient}
        />
      )}
    </div>
  );
};

export default TreasuryOfficerDashboard;