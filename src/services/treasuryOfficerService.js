import axios from 'axios';
import { toast } from 'react-toastify';

const treasuryApi = axios.create({
  baseURL: '/api', // Use the proxy URL
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 30000, // Increased to 30 seconds
  withCredentials: true
});

// Add JWT token to requests
treasuryApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('No token found in localStorage');
    throw new Error('Not authenticated');
  }

  // Check if token already has Bearer prefix
  const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  config.headers.Authorization = authHeader;
  
  // Add additional headers for debugging
  config.headers['X-Requested-With'] = 'XMLHttpRequest';
  config.headers['Access-Control-Allow-Origin'] = '*';
  
  console.log('Treasury API Request Headers:', {
    Authorization: authHeader.substring(0, 30) + '...', // Log first 30 chars
    'Content-Type': config.headers['Content-Type'],
    'X-Requested-With': config.headers['X-Requested-With']
  });
  
  return config;
}, (error) => {
  console.error('Treasury API Request error:', {
    message: error.message,
    config: error.config,
    response: error.response
  });
  return Promise.reject(error);
});

// Add response interceptor for better error handling
treasuryApi.interceptors.response.use(
  (response) => {
    console.log('Treasury API Response:', {
      status: response.status,
      data: response.data,
      headers: response.headers
    });
    return response;
  },
  (error) => {
    if (error.response) {
      console.error('Treasury API Server error:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
      
      // Handle specific error cases
      switch (error.response.status) {
        case 401:
          toast.error('Session expired. Please login again.');
          break;
        case 403:
          toast.error('Access denied. You don\'t have permission.');
          break;
        case 404:
          toast.error('API endpoint not found. Please check if the backend service is running and the endpoint is correctly configured.');
          break;
        default:
          toast.error(`Server error: ${error.response.data?.message || 'Unknown error'}`);
      }
    } else {
      console.error('Treasury API Network error:', error.message);
      toast.error('Network error: Could not connect to the server');
    }
    return Promise.reject({
     message: error.message,
     type: error.response?.status === 401 ? 'unauthorized' : 'timeout',
     originalError: error
   });
  }
);





export const treasuryOfficerService = {
  // Get assigned clients
  getAssignedClients: async () => {
    try {
      // Check token before making request
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Treasury API Request: GET /api/client/treasury-officer/assigned');
      
      // Use full path with /api prefix
      const response = await treasuryApi.get('/api/client/treasury-officer/assigned', {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Access-Control-Allow-Origin': '*'
        }
      });

      console.log('Treasury API Response:', {
        status: response.status,
        data: response.data,
        headers: response.headers
      });

      // The API returns data in the format { clients: [] }
      const clients = response.data?.clients || [];
      
      // Ensure we always return an array
      const data = Array.isArray(clients) ? clients : [];
      
      // Log the first client for debugging
      if (data.length > 0) {
        console.log('First client:', {
          id: data[0]._id,
          name: data[0].name,
          status: data[0].status
        });
      }
      
      return data;
    } catch (error) {
      console.error('Treasury API Error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers
      });
      throw error.response?.data || error;
    }
  },

  // Change client status
  changeClientStatus: async (clientId, newStatus) => {
    try {
      console.log('Treasury API Request: POST /api/client/treasury-officer/change-status');
      const response = await treasuryApi.post('/api/client/treasury-officer/change-status', {
        clientId,
        newStatus
      });
      console.log('Treasury API Response:', {
        status: response.status,
        data: response.data,
        headers: response.headers
      });
      return response.data;
    } catch (error) {
      console.error('Treasury API Error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers
      });
      throw error.response?.data || error;
    }
  },

  // Forward client to BEAC, Treasury OPS, or Trade Desk
  forwardClient: async (clientId, target, comment) => {
    console.log('Forwarding client:', {
      clientId,
      target,
      comment: comment.substring(0, 50) + (comment.length > 50 ? '...' : '') // Log first 50 chars of comment
    });
    try {
      console.log('Treasury API Request: POST /api/client/treasury-officer/forward');
      const response = await treasuryApi.post('/api/client/treasury-officer/forward', {
        clientId,
        target,
        comment
      });
      console.log('Treasury API Response:', {
        status: response.status,
        data: response.data,
        headers: response.headers
      });
      return response.data;
    } catch (error) {
      console.error('Treasury API Error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers
      });
      throw error.response?.data || error;
    }
  }
};
