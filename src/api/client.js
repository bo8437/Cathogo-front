import axios from 'axios';

const API_BASE_URL = '/api';

const clientApi = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 5000
});

// Add JWT token to requests
clientApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (!token) {
        console.error('No token found in localStorage');
        throw new Error('Not authenticated');
    }

    // Check if token already has Bearer prefix
    const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    config.headers.Authorization = authHeader;
    
    console.log('Request Headers:', {
        Authorization: authHeader.substring(0, 30) + '...', // Log first 30 chars
        'Content-Type': config.headers['Content-Type']
    });
    
    return config;
}, (error) => {
    console.error('Request error:', {
        message: error.message,
        config: error.config,
        response: error.response
    });
    return Promise.reject(error);
});

// Add response interceptor for better error handling
clientApi.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            // Server responded with an error
            console.error('Server error:', {
                status: error.response.status,
                data: error.response.data,
                headers: error.response.headers
            });
            
            // Handle specific error cases
            if (error.response.status === 401) {
                console.error('Unauthorized access. Token may be expired or invalid');
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
            
            if (error.response.status === 403) {
                console.error('Access denied. Check user role and permissions');
            }
        } else if (error.request) {
            // Request made but no response
            console.error('Request failed:', error.request);
        } else {
            // Something happened in setting up the request
            console.error('Request setup error:', error.message);
        }
        
        return Promise.reject(error);
    }
);

// Add JWT token to requests
clientApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
});

clientApi.interceptors.response.use(
    (response) => response,
    (error) => {
        return Promise.reject(error);
    }
);

// API Functions
const createClient = async (clientData) => {
    try {
        const response = await clientApi.post('/api/client', clientData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

const uploadDocument = async (file, clientId) => {
    try {
        const formData = new FormData();
        formData.append('document', file);
        formData.append('clientId', clientId);
        
        const response = await clientApi.post('/api/client/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

const getClients = async () => {
    try {
        const response = await clientApi.get('/api/client');
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

const getClient = async (clientId) => {
    try {
        const response = await clientApi.get(`/api/client/${clientId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Treasury OPS specific endpoints
const getWaitingClients = async () => {
    try {
        console.log('API Request: GET /api/client/waiting');
        const response = await clientApi.get('/api/client/waiting');
        console.log('API Response:', {
            status: response.status,
            data: response.data,
            headers: response.headers
        });
        
        // The API returns data in the format { clients: [] }
        const clients = response.data?.clients || [];
        console.log('Found Clients:', clients);
        
        // Ensure we always return an array
        const data = Array.isArray(clients) ? clients : [];
        console.log('Processed Data:', data);
        return data;
    } catch (error) {
        console.error('API Error:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            headers: error.response?.headers
        });
        throw error.response?.data || error;
    }
};

const sendBackToAgent = async (clientId, comment) => {
    try {
        console.log('Sending client back to Agent...', clientId);
        const response = await clientApi.post('/api/client/send-back', {
            clientId,
            comment
        });
        console.log('Send back response:', response.data);
        return response.data.client;
    } catch (error) {
        console.error('Error sending client back:', error.response?.data || error);
        throw error.response?.data || error;
    }
};

// Forward Client to Treasury Officer
// POST /api/client/forward
// Required Role: Treasury OPS
const forwardClient = async (clientId, treasuryOfficerId, comment) => {
    try {
        // Validate required parameters
        if (!clientId) {
            throw new Error('Client ID is required');
        }
        if (!treasuryOfficerId) {
            throw new Error('Treasury Officer ID is required');
        }
        if (!comment) {
            throw new Error('Comment is required');
        }

        // Log request details
        console.log('Forward request:', {
            clientId,
            treasuryOfficerId,
            comment,
            timestamp: new Date().toISOString()
        });

        // Make API call with proper headers
        const response = await clientApi.post('/api/client/forward', {
            clientId,
            treasuryOfficerId,
            comment
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        // Log response details
        console.log('Forward response:', {
            status: response.status,
            data: response.data,
            headers: response.headers
        });

        // Handle different response types
        if (response.status === 200) {
            return response.data;
        } else if (response.status === 401) {
            throw new Error('Access denied');
        } else if (response.status === 403) {
            throw new Error('Access denied');
        } else if (response.status === 404) {
            throw new Error('Client not found');
        } else {
            throw new Error('Failed to forward client');
        }
    } catch (error) {
        console.error('Forward error:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            headers: error.response?.headers,
            config: error.config
        });

        // Throw error with backend message if available
        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        } else if (error.response?.status === 401) {
            throw new Error('Access denied');
        } else if (error.response?.status === 403) {
            throw new Error('Access denied');
        } else if (error.response?.status === 404) {
            throw new Error('Client not found');
        } else {
            throw error;
        }
    }
};

// Treasury Officers API
const getTreasuryOfficers = async () => {
    try {
        const response = await clientApi.get('/api/client/treasury-officers');
        return response.data.officers;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Export all API functions
export {
    createClient,
    uploadDocument,
    getClients,
    getClient,
    getWaitingClients,
    sendBackToAgent,
    forwardClient,
    getTreasuryOfficers
};

// Export the API instance for direct use if needed
export default clientApi;
