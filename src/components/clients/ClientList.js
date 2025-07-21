import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getClients } from '../../api/client';
import DocumentUpload from './DocumentUpload';
import DocumentPreview from './DocumentPreview';

const ClientList = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        const data = await getClients();
        setClients(data);
        setError('');
      } catch (err) {
        setError(err.message || 'Failed to fetch clients');
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

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
        <span className="error-message">{error}</span>
      </div>
    );
  }

  return (
    <div className="client-list-container">
      <header className="dashboard-header">
        <h1>Clients</h1>
        <button 
          className="new-client-button"
          onClick={() => navigate('/clients/new')}
        >
          New Client
        </button>
      </header>

      <main className="client-table-wrapper">
        <table className="clients-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Status</th>
              <th>Documents</th>
              <th>Amount</th>
              <th>Created</th>
              <th>Physical Deposit Date</th>
              <th>Actions</th>
              <th>View Details</th>
            </tr>
          </thead>
          <tbody>
            {clients.map(client => (
              <tr key={client._id}>
                <td>{client.name}</td>
                <td>
                  <span className={`status ${client.status}`}>
                    {client.status}
                  </span>
                </td>
                <td>
                  {client.documents?.length > 0 ? (
                    <div className="documents-container">
                      {client.documents.map((doc, index) => (
                        <DocumentPreview
                          key={index}
                          doc={doc}
                        />
                      ))}
                    </div>
                  ) : (
                    <span className="no-documents">No documents uploaded</span>
                  )}
                </td>
                <td>{client.currency} {client.amount}</td>
                <td>
                  {new Date(client.createdAt).toLocaleDateString()}
                </td>
                <td>
                  {new Date(client.physicalDepositDate).toLocaleDateString()}
                </td>
                <td>
                  <DocumentUpload clientId={client._id} />
                </td>
                <td>
                  <Link 
                    to={`/clients/${client._id}`} 
                    className="view-details-link"
                  >
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>

      <style jsx>{`
        .client-list-container {
          padding: 2rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .dashboard-header h1 {
          font-size: 2.5rem;
          color: #333;
          margin: 0;
        }

        .new-client-button {
          padding: 0.75rem 1.5rem;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.2s ease;
        }

        .new-client-button:hover {
          background-color: #0056b3;
        }

        .loading-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(255, 255, 255, 0.8);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .spinner {
          width: 60px;
          height: 60px;
          border: 8px solid #f3f3f3;
          border-top: 8px solid #3498db;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .error-container {
          text-align: center;
          padding: 2rem;
          color: #dc3545;
          font-weight: 500;
        }

        .clients-table {
          width: 100%;
          border-collapse: collapse;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          border-radius: 8px;
          overflow: hidden;
        }

        .clients-table th,
        .clients-table td {
          padding: 1rem;
          text-align: left;
          vertical-align: middle;
          border-bottom: 1px solid #eee;
        }

        .clients-table th {
          background-color: #f8f9fa;
          font-weight: 600;
          position: sticky;
          top: 0;
          z-index: 1;
        }

        .clients-table tr:nth-child(even) {
          background-color: #f8f9fa;
        }

        .documents-container {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .no-documents {
          color: #666;
          font-style: italic;
        }

        .view-details-link {
          color: #007bff;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s ease;
        }

        .view-details-link:hover {
          color: #0056b3;
          text-decoration: underline;
        }

        @media (max-width: 768px) {
          .client-list-container {
            padding: 1rem;
          }
          
          .dashboard-header {
            flex-direction: column;
            gap: 1rem;
          }
          
          .dashboard-header h1 {
            font-size: 2rem;
          }
          
          .clients-table {
            display: block;
            overflow-x: auto;
          }
          
          .clients-table th,
          .clients-table td {
            padding: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ClientList;