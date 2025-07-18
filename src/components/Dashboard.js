import React from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../services/auth';

const Dashboard = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="dashboard-container">
            <h1>Welcome to Dashboard</h1>
            <button onClick={handleLogout} className="logout-button">
                Logout
            </button>
        </div>
    );
};

export default Dashboard;
