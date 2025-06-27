import axios, { AxiosResponse } from 'axios';
import {
  SurfSpot,
  SurfSession,
  DashboardStats,
  CreateSurfSpotData,
  CreateSurfSessionData,
  HealthCheckResponse
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('API Request:', config.method?.toUpperCase(), config.url);
    }
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('API Response:', response.status, response.config.url);
    }
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Surf Spots API
export const surfSpotService = {
  getAll: async (): Promise<SurfSpot[]> => {
    const response: AxiosResponse<SurfSpot[]> = await api.get('/surf-spots');
    return response.data;
  },
  
  create: async (spotData: CreateSurfSpotData): Promise<SurfSpot> => {
    const response: AxiosResponse<SurfSpot> = await api.post('/surf-spots', spotData);
    return response.data;
  },

  getById: async (id: number): Promise<SurfSpot> => {
    const response: AxiosResponse<SurfSpot> = await api.get(`/surf-spots/${id}`);
    return response.data;
  },

  update: async (id: number, spotData: Partial<CreateSurfSpotData>): Promise<SurfSpot> => {
    const response: AxiosResponse<SurfSpot> = await api.put(`/surf-spots/${id}`, spotData);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/surf-spots/${id}`);
  }
};

// Surf Sessions API
export const surfSessionService = {
  getAll: async (): Promise<SurfSession[]> => {
    const response: AxiosResponse<SurfSession[]> = await api.get('/surf-sessions');
    return response.data;
  },
  
  create: async (sessionData: CreateSurfSessionData): Promise<SurfSession> => {
    const response: AxiosResponse<SurfSession> = await api.post('/surf-sessions', sessionData);
    return response.data;
  },

  getById: async (id: number): Promise<SurfSession> => {
    const response: AxiosResponse<SurfSession> = await api.get(`/surf-sessions/${id}`);
    return response.data;
  },

  update: async (id: number, sessionData: Partial<CreateSurfSessionData>): Promise<SurfSession> => {
    const response: AxiosResponse<SurfSession> = await api.put(`/surf-sessions/${id}`, sessionData);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/surf-sessions/${id}`);
  },

  getBySpot: async (spotId: number): Promise<SurfSession[]> => {
    const response: AxiosResponse<SurfSession[]> = await api.get(`/surf-sessions/spot/${spotId}`);
    return response.data;
  }
};

// Dashboard API
export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const response: AxiosResponse<DashboardStats> = await api.get('/dashboard');
    return response.data;
  }
};

// Health Check API
export const healthService = {
  check: async (): Promise<HealthCheckResponse> => {
    const response: AxiosResponse<HealthCheckResponse> = await api.get('/health');
    return response.data;
  }
};

// Error handling utility
export const handleApiError = (error: any): string => {
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

export default api;
