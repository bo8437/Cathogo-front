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
        return <div className="loading">Loading clients...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="client-list">
            <div className="header-actions">
           
                <h2>Clients</h2>
                <button 
                    className="new-client-button"
                    onClick={() => navigate('/clients/new')}
                >
                    New Client
                </button>
            </div>
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
                                                document={doc}
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
                                <Link to={`/clients/${client._id}`} className="view-details-link">
                                    View Details
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <style>
                {`
                    .clients-table td {
                        padding: 1rem;
                        text-align: left;
                        border-bottom: 1px solid #ddd;
                        vertical-align: top;
                    }

                    .view-details-link {
                        color: #007bff;
                        text-decoration: none;
                        font-weight: 500;
                    }

                    .view-details-link:hover {
                        color: #0056b3;
                        text-decoration: underline;
                    }
                `}
            </style>
        </div>
    );
};

export default ClientList;
