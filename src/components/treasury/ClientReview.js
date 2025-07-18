import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClient, sendBackToAgent, forwardClient } from '../../api/client';
import DocumentPreview from '../clients/DocumentPreview';
import './treasury.css';

const ClientReview = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [client, setClient] = useState(null);
    const [comment, setComment] = useState('');
    const [action, setAction] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!comment) {
            setError('Comment is required');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            if (action === 'send-back') {
                await sendBackToAgent(id, comment);
            } else if (action === 'forward') {
                await forwardClient(id, comment);
            }

            // Navigate back to dashboard
            navigate('/treasury');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading">Loading client details...</div>;
    if (error) return <div className="error">Error: {error}</div>;
    if (!client) return null;

    return (
        <div className="client-review">
            <div className="review-header">
                <h2>Review Client</h2>
                <button 
                    className="back-button"
                    onClick={() => navigate('/treasury')}
                >
                    Back to Dashboard
                </button>
            </div>

            <div className="client-info">
                <h3>Client Information</h3>
                <div className="info-grid">
                    <div>
                        <strong>Name:</strong> {client.name}
                    </div>
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
                </div>
            </div>

            <div className="documents-section">
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
                    <p className="no-documents">No documents uploaded</p>
                )}
            </div>

            <div className="action-section">
                <div className="action-buttons">
                    <button 
                        className="action-button"
                        onClick={() => setAction('send-back')}
                        disabled={action === 'send-back'}
                    >
                        Send Back to Agent OPS
                    </button>
                    <button 
                        className="action-button"
                        onClick={() => setAction('forward')}
                        disabled={action === 'forward'}
                    >
                        Forward to Treasury Officer
                    </button>
                </div>

                {action && (
                    <form onSubmit={handleSubmit} className="comment-form">
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Enter your comment..."
                            required
                            className="comment-input"
                        />
                        <div className="form-buttons">
                            <button 
                                type="button"
                                className="cancel-button"
                                onClick={() => setAction('')}
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                className="submit-button"
                                disabled={loading}
                            >
                                {loading ? 'Processing...' : 'Submit'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ClientReview;
