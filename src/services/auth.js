import api from '../api/client';

export const signup = async (userData) => {
    try {
        const response = await api.post('/api/auth/signup', userData);
        localStorage.setItem('token', response.data.token);
        return response.data;
    } catch (error) {
        console.error('Signup error:', error.response?.data || error);
        throw error.response?.data || error;
    }
};

export const login = async (userData) => {
    try {
        const response = await api.post('/api/auth/login', userData);
        localStorage.setItem('token', response.data.token);
        return response.data;
    } catch (error) {
        console.error('Login error:', error.response?.data || error);
        throw error.response?.data || error;
    }
};

export const logout = () => {
    localStorage.removeItem('token');
};

export const isAuthenticated = () => {
    return !!localStorage.getItem('token');
};

export const getUserRole = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        console.error('No token found in localStorage');
        return null;
    }
    
    try {
        // Decode the JWT token
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const decoded = JSON.parse(window.atob(base64));
        console.log('Decoded token:', {
            role: decoded.role,
            email: decoded.email,
            exp: decoded.exp
        });
        
        if (!decoded.role) {
            console.error('No role found in token');
            return null;
        }

        return decoded.role;
    } catch (error) {
        console.error('Error decoding token:', {
            message: error.message,
            token: token.substring(0, 20) + '...',
            error: error
        });
        return null;
    }
};
