// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// API Endpoints
export const API_ENDPOINTS = {
    REGISTER: '/user/register',
    LOGIN: '/user/login',
    LOGOUT: '/user/logout',
    GET_ALL_USERS: '/user/getAllUser'
};

// Helper function to make API calls
export const apiCall = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    };

    const finalOptions = { ...defaultOptions, ...options };

    try {
        const response = await fetch(url, finalOptions);
        const data = await response.json();
        
        return {
            success: response.ok,
            data,
            status: response.status
        };
    } catch (error) {
        console.error('API call failed:', error);
        return {
            success: false,
            data: { message: 'Network error. Please try again.' },
            status: 0
        };
    }
}; 