import axios from 'axios';
import { toast } from 'react-toastify';

const tradeDeskApi = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000,
  withCredentials: true
});

// Add JWT token to requests
tradeDeskApi.interceptors.request.use((config) => {
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
  
  console.log('Trade Desk API Request Headers:', {
    Authorization: authHeader.substring(0, 30) + '...', // Log first 30 chars
    'Content-Type': config.headers['Content-Type'],
    'X-Requested-With': config.headers['X-Requested-With']
  });
  
  return config;
}, (error) => {
  console.error('Trade Desk API Request error:', {
    message: error.message,
    config: error.config,
    response: error.response
  });
  return Promise.reject(error);
});

// Add response interceptor for better error handling
tradeDeskApi.interceptors.response.use(
  (response) => {
    console.log('Trade Desk API Response:', {
      status: response.status,
      data: response.data,
      headers: response.headers
    });
    return response;
  },
  (error) => {
    console.error('Trade Desk API Network error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

export const tradeDeskService = {
  // Get completed clients
  getCompletedClients: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Trade Desk API Request: GET /api/client/trade-desk/completed');
      
      const response = await tradeDeskApi.get('/api/client/trade-desk/completed', {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Access-Control-Allow-Origin': '*'
        }
      });

      console.log('Trade Desk API Response (Completed Clients):', {
        status: response.status,
        data: response.data,
        headers: response.headers
      });

      const clients = response.data?.clients || [];
      return Array.isArray(clients) ? clients : [];
    } catch (error) {
      console.error('Trade Desk API Error (Completed Clients):', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error.response?.data || error;
    }
  },

  // Get assigned clients
  getAssignedClients: async (includeCompleted = true) => {
    try {
      // Check token before making request
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log(`Trade Desk API Request: GET /api/client/trade-desk/assigned?includeCompleted=${includeCompleted}`);
      
      // Use full path with /api prefix and includeCompleted parameter
      const response = await tradeDeskApi.get('/api/client/trade-desk/assigned', {
        params: { includeCompleted },
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Access-Control-Allow-Origin': '*'
        }
      });

      console.log('Trade Desk API Response:', {
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
      console.error('Trade Desk API Error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers
      });
      throw error.response?.data || error;
    }
  },

  // Change client status
  changeClientStatus: async (clientId, comment) => {
    try {
      console.log('Trade Desk API Request: POST /api/client/trade-desk/change-status');
      const response = await tradeDeskApi.post('/api/client/trade-desk/change-status', {
        clientId,
        status: 'completed',
        comment
      });
      console.log('Trade Desk API Response:', {
        status: response.status,
        data: response.data
      });
      return response.data;
    } catch (error) {
      console.error('Trade Desk API Error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  },

  // Delete client
  deleteClient: async (clientId) => {
    try {
      // Check token before making request
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Trade Desk API Request: POST /api/client/trade-desk/delete');
      
      // Use full path with /api prefix
      const response = await tradeDeskApi.post('/api/client/trade-desk/delete', {
        clientId
      }, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Access-Control-Allow-Origin': '*'
        }
      });

      console.log('Trade Desk API Response:', {
        status: response.status,
        data: response.data,
        headers: response.headers
      });

      return response.data;
    } catch (error) {
      console.error('Trade Desk API Error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers
      });
      throw error.response?.data || error;
    }
  },

  // Add note
  addNote: async (clientId, note) => {
    try {
      console.log('Trade Desk API Request: POST /api/client/trade-desk/note');
      const response = await tradeDeskApi.post('/client/trade-desk/note', {
        clientId,
        note
      });
      console.log('Trade Desk API Response:', {
        status: response.status,
        data: response.data
      });
      return response.data;
    } catch (error) {
      console.error('Trade Desk API Error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  },

  // Send to Core Banking
  sendToCoreBanking: async (clientId, comment) => {
    try {
      console.log('Trade Desk API Request: POST /api/client/trade-desk/send-to-core');
      const response = await tradeDeskApi.post('/client/trade-desk/send-to-core', {
        clientId,
        comment
      });
      console.log('Trade Desk API Response:', {
        status: response.status,
        data: response.data
      });
      return response.data;
    } catch (error) {
      console.error('Trade Desk API Error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  }
};
