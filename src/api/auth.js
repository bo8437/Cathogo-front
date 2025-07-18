import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const authApi = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 5000
});

// Add error handling
authApi.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('Auth Response Error:', error.response.data);
        } else if (error.request) {
            // The request was made but no response was received
            console.error('Auth Network Error:', error.message);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Auth Error:', error.message);
        }
        return Promise.reject(error);
    }
);

export default authApi;
