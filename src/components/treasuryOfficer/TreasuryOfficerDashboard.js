import React, { useState, useEffect } from 'react';
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
      
      // Handle empty response
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
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div className="treasury-dashboard">
        {error ? (
          <div>Error: {error}</div>
        ) : (
          <div>
            <h2>Assigned Clients</h2>
            {clients.length === 0 ? (
              <div>No clients assigned</div>
            ) : (
              <div className="clients-list">
                {clients.map((client) => (
                  <div key={client._id} className="client-card">
                    <h3>{client.name}</h3>
                    <p>Beneficiary: {client.beneficiary}</p>
                    <p>Amount: {client.amount} {client.currency}</p>
                    <p>Status: {client.status}</p>
                    <p>Registration Date: {new Date(client.systemRegistrationDate).toLocaleDateString()}</p>
                    <div className="client-actions">
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
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="treasury-dashboard">
      {loading ? (
        <div className="loading">Loading...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <div>
          <h2>Assigned Clients</h2>
          {clients.length === 0 ? (
            <div className="no-clients">No clients assigned</div>
          ) : (
            <div className="clients-list">
              {clients.map((client) => (
                <div key={client._id} className="client-card">
                  <h3>{client.name}</h3>
                  <div className="client-info">
                    <p>Beneficiary: <strong>{client.beneficiary}</strong></p>
                    <p>Amount: <strong>{client.amount} {client.currency}</strong></p>
                    <p>Status: <span className={`status-badge status-${client.status}`}>
                      {client.status}
                    </span></p>
                    <p>Registration Date: {new Date(client.systemRegistrationDate).toLocaleDateString()}</p>
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
