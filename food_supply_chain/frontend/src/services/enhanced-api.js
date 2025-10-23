import axios from 'axios';
import { API_BASE_URL } from '../config';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth tokens if needed
api.interceptors.request.use(
  (config) => {
    // Add any auth headers here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// User Management API
export const userAPI = {
  // Register a new user
  register: async (userData) => {
    const response = await api.post('/users/register', userData);
    return response.data;
  },

  // Get user profile
  getProfile: async (address) => {
    const response = await api.get(`/users/${address}`);
    return response.data;
  },

  // Update user profile
  updateProfile: async (address, userData) => {
    const response = await api.put(`/users/${address}`, userData);
    return response.data;
  },
};

// File Upload API
export const fileAPI = {
  // Upload file to IPFS
  upload: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// Crop Management API
export const cropAPI = {
  // Register a new crop
  register: async (cropData, farmerAddress) => {
    const formData = new FormData();
    formData.append('farmer_address', farmerAddress);
    
    // Append all crop data fields
    Object.keys(cropData).forEach(key => {
      formData.append(key, cropData[key]);
    });
    
    const response = await api.post('/crops', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get all crops
  getAll: async () => {
    const response = await api.get('/crops');
    return response.data;
  },

  // Get available crops only
  getAvailable: async () => {
    const response = await api.get('/crops/available');
    return response.data;
  },

  // Get specific crop
  getById: async (cropId) => {
    const response = await api.get(`/crops/${cropId}`);
    return response.data;
  },

  // Get crop history
  getHistory: async (cropId) => {
    const response = await api.get(`/crops/${cropId}/history`);
    return response.data;
  },

  // Transfer crop
  transfer: async (cropId, transferData) => {
    const response = await api.post(`/crops/${cropId}/transfer`, transferData);
    return response.data;
  },

  // Buy crop
  buy: async (cropId, buyerAddress, paymentAmount) => {
    const formData = new FormData();
    formData.append('buyer_address', buyerAddress);
    formData.append('payment_amount', paymentAmount.toString());
    
    const response = await api.post(`/crops/${cropId}/buy`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// Analytics API
export const analyticsAPI = {
  // Get platform analytics
  getAnalytics: async () => {
    const response = await api.get('/analytics');
    return response.data;
  },
};

// Utility functions
export const utils = {
  // Format timestamp to readable date
  formatDate: (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  },

  // Format timestamp to readable datetime
  formatDateTime: (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString();
  },

  // Format ETH amount from wei
  formatETH: (weiAmount) => {
    return (weiAmount / 1e18).toFixed(4);
  },

  // Convert ETH to wei
  toWei: (ethAmount) => {
    return Math.floor(ethAmount * 1e18);
  },

  // Validate coordinates format
  validateCoordinates: (coords) => {
    const regex = /^-?\d+\.?\d*,-?\d+\.?\d*$/;
    return regex.test(coords);
  },

  // Get file size in MB
  getFileSizeMB: (bytes) => {
    return (bytes / (1024 * 1024)).toFixed(2);
  },

  // Check if file type is allowed
  isAllowedFileType: (fileType) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    return allowedTypes.includes(fileType);
  },
};

export default api;
