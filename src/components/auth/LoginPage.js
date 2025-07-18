import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, getUserRole } from '../../services/auth';
import logo from '../assets/logo.png';


const LoginPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        role: 'Agent OPS'
    });
    const [error, setError] = useState('');
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
            await login(formData);
            // Get the user's role from the token
            const role = getUserRole();
            
            // Redirect to the appropriate dashboard based on role
            switch (role) {
                case 'Treasury OPS':
                    navigate('/treasury');
                    break;
                case 'Treasury Officer':
                    navigate('/treasury-officer');
                    break;
                case 'Trade Desk':
                    navigate('/trade-desk');
                    break;
                default:
                    navigate('/dashboard'); // Default to Agent OPS dashboard
            }
        } catch (err) {
            setError(err.message || 'Login failed. Please try again.');
            console.error('Login error details:', err.details);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                        <img 
                        src={logo}
                        alt="Company Logo"
                        style={{ maxWidth: '100px'}}
                    />
                </div>
                <h2>Login</h2>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="role">Role</label>
                        <select
                            id="role"
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            required
                        >
                            <option value="Agent OPS">Agent OPS</option>
                            <option value="Treasury OPS">Treasury OPS</option>
                            <option value="Treasury Officer">Treasury Officer</option>
                            <option value="Trade Desk">Trade Desk</option>
                        </select>
                    </div>
                    <button type="submit" className="login-button">Login</button>
                </form>
                <p className="signup-link">
                    Don't have an account? <a href="/signup">Sign up</a>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
