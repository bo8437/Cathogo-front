import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getWaitingClients, sendBackToAgent, forwardClient, getTreasuryOfficers } from '../../api/client';
import './treasury.css';

const formatPhysicalDepositDate = (dateString) => {
    if (!dateString) return 'No date specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const TreasuryDashboard = () => {
    // Get user role from token
    const token = localStorage.getItem('token');
    let userRole = 'Unknown';
    let userEmail = 'Unknown';
    
    if (token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const decodedToken = JSON.parse(window.atob(base64));
            userRole = decodedToken.role || 'Unknown';
            userEmail = decodedToken.email || 'Unknown';
            
            console.log('Token Details:', {
                role: userRole,
                email: userEmail,
                exp: decodedToken.exp,
                iat: decodedToken.iat
            });
        } catch (error) {
            console.error('Error decoding token:', error);
        }
    }

    // Verify role before rendering
    if (userRole !== 'Treasury OPS') {
        console.error('Access denied:', {
            userRole,
            userEmail,
            expectedRole: 'Treasury OPS'
        });
        return (
            <div className="error-container">
                <div className="error-message">
                    Access Denied: You must be logged in as Treasury OPS to view this dashboard
                </div>
                <div className="role-info">
                    Your current role: {userRole}
                </div>
                <button 
                    className="retry-button"
                    onClick={() => window.location.href = '/login'}
                >
                    Go to Login
                </button>
            </div>
        );
    }
    const navigate = useNavigate();
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchClients = async () => {
        try {
            console.log('Treasury Dashboard - Fetching clients');
            const response = await getWaitingClients();
            console.log('Treasury Dashboard - Raw Response:', response);
            
            // Handle both array and object response formats
            const clients = Array.isArray(response) ? response : response?.clients || [];
            console.log('Treasury Dashboard - Processed Clients:', clients);
            
            // Ensure we always have an array
            const clientArray = Array.isArray(clients) ? clients : [];
            console.log('Treasury Dashboard - Final Clients:', clientArray);
            setClients(clientArray);
            setLoading(false);
        } catch (error) {
            console.error('Treasury Dashboard - Error:', {
                message: error.message,
                response: error.response
            });
            setError('Failed to fetch waiting clients: ' + error.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClients();
    }, []);

    const handleView = (clientId) => {
        navigate(`/treasury/clients/${clientId}`);
    };

    const handleSendBack = async (clientId) => {
        try {
            const comment = prompt('Please enter a reason for sending back:');
            if (!comment) return;
            
            await sendBackToAgent(clientId, comment);
            // Refresh the clients list
            fetchClients();
        } catch (error) {
            setError('Failed to send client back: ' + error.message);
        }
    };

    const [selectedClient, setSelectedClient] = useState(null);
    const [showForwardModal, setShowForwardModal] = useState(false);
    const [selectedOfficer, setSelectedOfficer] = useState(null);
    const [officers, setOfficers] = useState([]);
    const [forwardComment, setForwardComment] = useState('');

    const fetchOfficers = async () => {
        try {
            const officers = await getTreasuryOfficers();
            setOfficers(officers);
        } catch (error) {
            console.error('Error fetching Treasury Officers:', error);
            setError('Failed to fetch Treasury Officers: ' + error.message);
        }
    };

    useEffect(() => {
        fetchOfficers();
    }, []);

    const handleForward = (clientId) => {
        setSelectedClient(clientId);
        setShowForwardModal(true);
    };

    const handleForwardConfirm = async () => {
        if (!selectedOfficer) {
            setError('Please select a Treasury Officer');
            return;
        }
        if (!forwardComment || forwardComment.length < 10) {
            setError('Please enter at least 10 characters for the forwarding reason');
            return;
        }

        try {
            // Verify user role
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Not authenticated. Please log in again.');
                return;
            }

            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const decodedToken = JSON.parse(window.atob(base64));
            const userRole = decodedToken.role;

            if (userRole !== 'Treasury OPS') {
                setError('Access denied: Only Treasury OPS can forward clients');
                return;
            }

            // Forward the client
            await forwardClient(selectedClient, selectedOfficer._id, forwardComment);
            
            // Show success message
            setError('Client forwarded successfully!');
            
            // Update UI
            setShowForwardModal(false);
            setSelectedClient(null);
            setSelectedOfficer(null);
            setForwardComment('');
            fetchClients();
        } catch (error) {
            // Handle different types of errors
            if (error.message === 'Access denied') {
                setError('Access denied: Please check your role permissions');
            } else if (error.message === 'Not authenticated') {
                setError('Authentication failed: Please log in again');
                // Redirect to login after a short delay
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
            } else {
                setError('Failed to forward client: ' + error.message);
            }
            console.error('Forward error:', {
                message: error.message,
                response: error.response,
                status: error.response?.status
            });
        }
    };

    if (loading) return <div className="loading">Loading clients...</div>;

    if (error) return (
        <div className="error-container">
            <div className="error-message">Error: {error}</div>
            <button 
                className="retry-button"
                onClick={() => {
                    setError('');
                    fetchClients();
                }}
            >
                Retry
            </button>
        </div>
    );

    if (!clients || clients.length === 0) return (
        <div className="empty-state">
            <h3>No Clients to Review</h3>
            <p>
                No clients are currently waiting for review.
                <br />
                <small>
                    This dashboard shows all clients with status "waiting".
                    If you believe this is incorrect, please check:
                    <ul>
                        <li>Are you logged in as Treasury OPS?</li>
                        <li>Are there any clients in the system with status "waiting"?</li>
                        <li>Is the backend API returning all clients correctly?</li>
                    </ul>
                </small>
            </p>
        </div>
    );

    return (
        <div className="treasury-dashboard">
            <div className="dashboard-header">
                <h2>Waiting Clients</h2>
                <p>Review and process clients waiting for Treasury OPS approval</p>
            </div>

            <div className="clients-table-container">
                <table className="clients-table">
                    <thead>
                        <tr>
                            <th>Client Name</th>
                            <th>Amount</th>
                            <th>Currency</th>
                            <th>Documents</th>
                            <th>Physical Deposit Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {clients.map(client => (
                            <tr key={client._id}>
                                <td>{client.name}</td>
                                <td>{client.currency} {client.amount}</td>
                                <td>{client.currency}</td>
                                <td>
                                    <span className="document-count">
                                        {client.documents.length}
                                    </span>
                                </td>
                                <td>
                                    {formatPhysicalDepositDate(client.physicalDepositDate)}
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button 
                                            className="view-button"
                                            onClick={() => handleView(client._id)}
                                        >
                                            View
                                        </button>
                                        <button 
                                            className="send-back-button"
                                            onClick={() => handleSendBack(client._id)}
                                        >
                                            Send Back
                                        </button>
                                        <button 
                                            className="forward-button"
                                            onClick={() => handleForward(client._id)}
                                        >
                                            Forward
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showForwardModal && (
                <div className="modal-overlay">
                    <div className="forward-modal">
                        <h3>Forward Client</h3>
                        <div className="officer-selection">
                            <label>Select Treasury Officer:</label>
                            <select
                                value={selectedOfficer?._id}
                                onChange={(e) => {
                                    const officer = officers.find(o => o._id === e.target.value);
                                    setSelectedOfficer(officer);
                                }}
                                required
                            >
                                <option value="">Select an officer...</option>
                                {officers.map(officer => (
                                    <option key={officer._id} value={officer._id}>
                                        {officer.email}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="comment-section">
                            <label>Reason for forwarding:</label>
                            <textarea
                                value={forwardComment}
                                onChange={(e) => setForwardComment(e.target.value)}
                                placeholder="Enter your reason for forwarding this client..."
                                rows="3"
                                required
                            />
                            <div className="comment-error">
                                {forwardComment.length < 10 && forwardComment.length > 0 && (
                                    <span>Please enter at least 10 characters</span>
                                )}
                            </div>
                        </div>
                        <div className="modal-buttons">
                            <button 
                                className="cancel-button"
                                onClick={() => {
                                    setShowForwardModal(false);
                                    setSelectedClient(null);
                                    setSelectedOfficer(null);
                                }}
                            >
                                Cancel
                            </button>
                            <button 
                                className="confirm-button"
                                onClick={handleForwardConfirm}
                                disabled={!selectedOfficer}
                            >
                                Forward
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TreasuryDashboard;
