import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClient } from '../../api/client';
import DocumentPreview from './DocumentPreview';
import ClientComments from './ClientComments';
import './client.css';

const ClientDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [client, setClient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchClient = async () => {
            try {
                const data = await getClient(id);
                setClient(data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchClient();
    }, [id]);

    if (loading) return <div className="loading">Loading client details...</div>;
    if (error) return <div className="error">Error: {error}</div>;
    if (!client) return null;

    return (
        <div className="client-details">
            <div className="client-header">
                <h2>{client.name}</h2>
                <button 
                    className="back-button"
                    onClick={() => navigate('/dashboard')}
                >
                    Back to Clients
                </button>
            </div>

            <div className="client-info">
                <div className="info-section">
                    <h3>Client Information</h3>
                    <div className="info-grid">
                        <div>
                            <strong>Beneficiary:</strong> {client.beneficiary}
                        </div>
                        <div>
                            <strong>Domiciliation:</strong> {client.domiciliation}
                        </div>
                        <div>
                            <strong>Currency:</strong> {client.currency}
                        </div>
                        <div>
                            <strong>Amount:</strong> {client.amount}
                        </div>
                        <div>
                            <strong>Reason:</strong> {client.reason}
                        </div>
                        <div>
                            <strong>Physical Deposit Date:</strong> 
                            {new Date(client.physicalDepositDate).toLocaleDateString()}
                        </div>
                        <div>
                            <strong>Status:</strong> 
                            <span className={`status ${client.status}`}>
                                {client.status}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="info-section">
                    <h3>Documents</h3>
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
                </div>

                <ClientComments clientId={id} />
            </div>
        </div>
    );
};

export default ClientDetails;
