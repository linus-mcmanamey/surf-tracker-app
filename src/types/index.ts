// Core data types for the Surf Tracker application

export interface User {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SurfSpot {
  id: number;
  userId: number;
  name: string;
  latitude: number;
  longitude: number;
  breakType?: string;
  skillRequirement?: string;
  notes?: string;
  totalSessions: number;
  averageRating: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SurfSession {
  id: number;
  userId: number;
  surfSpotId: number;
  sessionDate: string;
  startTime?: string;
  durationMinutes?: number;
  wavesCaught?: number;
  performanceRating?: number;
  waveQualityRating?: number;
  windDirection?: string;
  windSpeed?: number;
  waveHeight?: number;
  sessionNotes?: string;
  createdAt: string;
  updatedAt: string;
  spotName?: string; // Added when joining with surf_spots table
}

export interface WeatherCondition {
  id: number;
  surfSpotId: number;
  recordedAt: string;
  temperature?: number;
  windSpeed?: number;
  windDirection?: string;
  waveHeight?: number;
  wavePeriod?: number;
  tideLevel?: string;
  conditionsSummary?: string;
}

export interface DashboardStats {
  totalSessions: number;
  avgRating: number;
  favoriteSpot: string;
  recentSessions: RecentSession[];
}

export interface RecentSession {
  id: number;
  spot: string;
  date: string;
  rating: number;
}

// Form data types
export interface CreateSurfSpotData {
  name: string;
  latitude: number;
  longitude: number;
  breakType?: string;
  skillRequirement?: string;
  description?: string;
}

export interface CreateSurfSessionData {
  surfSpot: string;
  date: string;
  duration?: number;
  waveCount?: number;
  rating?: number;
  conditionsRating?: number;
  notes?: string;
}

// API response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Navigation types
export type TabType = 'dashboard' | 'spots' | 'sessions' | 'weather';

export interface NavigationProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

// Health check response
export interface HealthCheckResponse {
  status: string;
  timestamp: string;
  environment: string;
  database: {
    status: string;
    timestamp?: string;
    error?: string;
  };
}
