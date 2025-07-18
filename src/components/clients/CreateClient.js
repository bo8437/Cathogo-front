import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '../../api/client';



const CreateClient = () => {
    const [formData, setFormData] = useState({
        name: '',
        beneficiary: '',
        domiciliation: '',
        currency: '',
        amount: '',
        reason: '',
        physicalDepositDate: new Date().toISOString().split('T')[0]
    });

    // Format date for display
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            await createClient(formData);
            setSuccess('Client created successfully!');
            // Navigate after a short delay to show the success message
            setTimeout(() => navigate('/dashboard'), 2000);
        } catch (err) {
            setError(err.message || 'Failed to create client');
        }
    };

    return (
        <div className="client-form-container">
            <h2>Create New Client</h2>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            <form onSubmit={handleSubmit} className="client-form">
                <div className="form-group">
                    <label htmlFor="name">Client Name</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="beneficiary">Beneficiary</label>
                    <input
                        type="text"
                        id="beneficiary"
                        name="beneficiary"
                        value={formData.beneficiary}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="domiciliation">Domiciliation</label>
                    <input
                        type="text"
                        id="domiciliation"
                        name="domiciliation"
                        value={formData.domiciliation}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="currency">Currency</label>
                    <select
                        id="currency"
                        name="currency"
                        value={formData.currency}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select Currency</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="JPY">JPY</option>
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="amount">Amount</label>
                    <input
                        type="number"
                        id="amount"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        step="0.01"
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="reason">Reason</label>
                    <textarea
                        id="reason"
                        name="reason"
                        value={formData.reason}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="physicalDepositDate">Physical Deposit Date</label>
                    <div className="date-input-container">
                        <input
                            type="date"
                            id="physicalDepositDate"
                            name="physicalDepositDate"
                            value={formData.physicalDepositDate}
                            onChange={handleChange}
                            required
                        />
                        <span className="date-format">(YYYY-MM-DD)</span>
                    </div>
                </div>
                <button type="submit" className="submit-button">Create Client</button>
            </form>
        </div>
    );
};

export default CreateClient;
