import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Surf Spots API
export const surfSpotService = {
  getAll: async () => {
    const response = await api.get('/surf-spots');
    return response.data;
  },
  
  create: async (spotData) => {
    const response = await api.post('/surf-spots', spotData);
    return response.data;
  }
};

// Surf Sessions API
export const surfSessionService = {
  getAll: async () => {
    const response = await api.get('/surf-sessions');
    return response.data;
  },
  
  create: async (sessionData) => {
    const response = await api.post('/surf-sessions', sessionData);
    return response.data;
  }
};

// Dashboard API
export const dashboardService = {
  getStats: async () => {
    const response = await api.get('/dashboard');
    return response.data;
  }
};

export default api;
