# React Native iOS Implementation Strategy

## Project Structure

```
SurfTracker/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── voice/           # Voice recording components
│   │   ├── maps/            # Map and location components
│   │   ├── forms/           # Form input components
│   │   └── common/          # Shared UI elements
│   ├── screens/             # Screen components
│   │   ├── onboarding/      # User setup screens
│   │   ├── sessions/        # Session management
│   │   ├── spots/           # Spot management
│   │   ├── predictions/     # AI recommendations
│   │   └── profile/         # User profile
│   ├── services/            # API and external services
│   │   ├── database/        # Railway PostgreSQL integration
│   │   ├── weather/         # Weather API client
│   │   ├── voice/           # Speech services
│   │   └── location/        # GPS services
│   ├── stores/              # State management
│   │   ├── session/         # Session state
│   │   ├── spots/           # Spots state
│   │   └── user/            # User state
│   ├── types/               # TypeScript definitions
│   ├── utils/               # Helper functions
│   └── constants/           # App constants
```

## Key Dependencies

```json
{
  "dependencies": {
    "react-native": "^0.72.0",
    "@react-navigation/native": "^6.1.0",
    "@react-navigation/stack": "^6.3.0",
    "@react-navigation/bottom-tabs": "^6.5.0",
    "react-native-maps": "^1.7.0",
    "react-native-geolocation-service": "^5.3.0",
    "@react-native-voice/voice": "^3.2.0",
    "react-native-tts": "^4.1.0",
    "react-native-async-storage/async-storage": "^1.19.0",
    "@tanstack/react-query": "^4.32.0",
    "zustand": "^4.4.0",
    "axios": "^1.5.0",
    "react-native-config": "^1.5.0",
    "react-native-permissions": "^3.8.0",
    "react-native-vector-icons": "^10.0.0",
    "react-native-paper": "^5.10.0",
    "react-native-chart-kit": "^6.12.0",
    "date-fns": "^2.30.0"
  }
}
```

## Core Implementation Components

### 1. Voice Interview System

```typescript
// src/components/voice/GuidedInterview.tsx
interface InterviewQuestion {
  id: string;
  question: string;
  category: 'duration' | 'waves' | 'wind' | 'crowd' | 'performance' | 'equipment' | 'conditions' | 'notes';
  maxDuration: number;
}

const INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  { id: '1', question: 'How long was your surf session today?', category: 'duration', maxDuration: 15000 },
  { id: '2', question: 'How were the waves? Describe the size and quality.', category: 'waves', maxDuration: 15000 },
  { id: '3', question: 'What were the wind conditions like?', category: 'wind', maxDuration: 15000 },
  { id: '4', question: 'How crowded was it? Were there many other surfers?', category: 'crowd', maxDuration: 15000 },
  { id: '5', question: 'How did you feel about your performance today? Any highlights?', category: 'performance', maxDuration: 15000 },
  { id: '6', question: 'What board and wetsuit did you use?', category: 'equipment', maxDuration: 15000 },
  { id: '7', question: 'What was the overall water and weather like?', category: 'conditions', maxDuration: 15000 },
  { id: '8', question: 'Any other notes or memorable moments from this session?', category: 'notes', maxDuration: 15000 }
];
```

### 2. Database Service Layer

```typescript
// src/services/database/SurfSpotService.ts
import axios from 'axios';

interface SurfSpot {
  id?: number;
  userId: number;
  name: string;
  latitude: number;
  longitude: number;
  breakType: 'beach' | 'point' | 'reef' | 'river_mouth' | 'jetty' | 'shore' | 'sandbar';
  skillRequirement: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  tidalPreferences: string[];
  optimalWindDirections: string[];
  optimalSwellDirections: string[];
  minWaveSize: number;
  maxWaveSize: number;
  seasonalPreferences: string[];
  crowdLevel: string;
  notes?: string;
  hazards?: string;
}

class SurfSpotService {
  private baseUrl = process.env.RAILWAY_API_URL;

  async createSpot(spot: Omit<SurfSpot, 'id'>): Promise<SurfSpot> {
    const response = await axios.post(`${this.baseUrl}/surf-spots`, spot);
    return response.data;
  }

  async getSpotsByUser(userId: number): Promise<SurfSpot[]> {
    const response = await axios.get(`${this.baseUrl}/surf-spots/user/${userId}`);
    return response.data;
  }

  async getNearbySpots(lat: number, lng: number, radius: number = 0.1): Promise<SurfSpot[]> {
    const response = await axios.get(`${this.baseUrl}/surf-spots/nearby`, {
      params: { lat, lng, radius }
    });
    return response.data;
  }

  async updateSpot(id: number, updates: Partial<SurfSpot>): Promise<SurfSpot> {
    const response = await axios.put(`${this.baseUrl}/surf-spots/${id}`, updates);
    return response.data;
  }

  async deleteSpot(id: number): Promise<void> {
    await axios.delete(`${this.baseUrl}/surf-spots/${id}`);
  }
}
```

### 3. Session Management

```typescript
// src/services/database/SessionService.ts
interface SurfSession {
  id?: number;
  userId: number;
  surfSpotId?: number;
  sessionDate: string;
  durationMinutes?: number;
  waveHeight?: number;
  waveQualityRating?: number;
  windDirection?: string;
  windSpeed?: number;
  windQuality?: string;
  tideState?: string;
  crowdLevel?: string;
  performanceRating?: number;
  equipmentBoard?: string;
  equipmentWetsuit?: string;
  waterTemperature?: number;
  airTemperature?: number;
  sessionNotes?: string;
  voiceTranscript?: string;
  memorableMoments?: string;
  latitude?: number;
  longitude?: number;
}

class SessionService {
  private baseUrl = process.env.RAILWAY_API_URL;

  async createSession(session: Omit<SurfSession, 'id'>): Promise<SurfSession> {
    const response = await axios.post(`${this.baseUrl}/sessions`, session);
    return response.data;
  }

  async getSessionsByUser(userId: number): Promise<SurfSession[]> {
    const response = await axios.get(`${this.baseUrl}/sessions/user/${userId}`);
    return response.data;
  }

  async getSessionsBySpot(spotId: number): Promise<SurfSession[]> {
    const response = await axios.get(`${this.baseUrl}/sessions/spot/${spotId}`);
    return response.data;
  }
}
```

### 4. AI Prediction Integration

```typescript
// src/services/ai/PredictionService.ts
interface PredictionRequest {
  userId: number;
  spotId: number;
  forecastData: WeatherForecast;
  historicalSessions: SurfSession[];
  spotCharacteristics: SurfSpot;
}

interface PredictionResponse {
  qualityScore: number;
  confidenceLevel: number;
  reasoning: string;
  recommendedActions: string[];
  alternativeSpots: SurfSpot[];
}

class PredictionService {
  async generatePrediction(request: PredictionRequest): Promise<PredictionResponse> {
    // Integration with Claude API for surf condition analysis
    const prompt = this.buildPredictionPrompt(request);
    
    const response = await axios.post('https://api.anthropic.com/v1/messages', {
      model: 'claude-3-sonnet-20241022',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1000
    }, {
      headers: {
        'x-api-key': process.env.CLAUDE_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    return this.parsePredictionResponse(response.data);
  }

  private buildPredictionPrompt(request: PredictionRequest): string {
    return `
      Analyze surf conditions for the following spot and provide recommendations:
      
      Spot: ${request.spotCharacteristics.name}
      Break Type: ${request.spotCharacteristics.breakType}
      Optimal Conditions: 
      - Wind: ${request.spotCharacteristics.optimalWindDirections.join(', ')}
      - Swell: ${request.spotCharacteristics.optimalSwellDirections.join(', ')}
      - Wave Size: ${request.spotCharacteristics.minWaveSize}-${request.spotCharacteristics.maxWaveSize}ft
      
      Current Forecast:
      - Wave Height: ${request.forecastData.waveHeight}ft
      - Wind: ${request.forecastData.windDirection} at ${request.forecastData.windSpeed}mph
      - Swell Direction: ${request.forecastData.swellDirection}
      
      Historical Performance (last 10 sessions):
      ${request.historicalSessions.map(s => 
        `Date: ${s.sessionDate}, Quality: ${s.waveQualityRating}/10, Performance: ${s.performanceRating}/10`
      ).join('\n')}
      
      Please provide:
      1. Quality score (1-10)
      2. Confidence level (0-1)
      3. Detailed reasoning
      4. Specific recommendations
    `;
  }
}
```

## iOS Integration Requirements

### Native Module Configurations

```typescript
// src/services/voice/VoiceService.ts
import Voice from '@react-native-voice/voice';
import Tts from 'react-native-tts';

class VoiceService {
  private isListening = false;
  private currentTranscript = '';

  async initializeVoice(): Promise<void> {
    Voice.onSpeechStart = this.onSpeechStart;
    Voice.onSpeechRecognized = this.onSpeechRecognized;
    Voice.onSpeechEnd = this.onSpeechEnd;
    Voice.onSpeechError = this.onSpeechError;
    Voice.onSpeechResults = this.onSpeechResults;
    
    // Initialize TTS
    Tts.setDefaultLanguage('en-US');
    Tts.setDefaultRate(0.5);
  }

  async speakQuestion(question: string): Promise<void> {
    return new Promise((resolve) => {
      Tts.speak(question);
      Tts.addEventListener('tts-finish', () => resolve());
    });
  }

  async startListening(): Promise<void> {
    if (!this.isListening) {
      this.isListening = true;
      await Voice.start('en-US');
    }
  }

  async stopListening(): Promise<string> {
    if (this.isListening) {
      this.isListening = false;
      await Voice.stop();
      return this.currentTranscript;
    }
    return '';
  }

  private onSpeechResults = (event: any) => {
    this.currentTranscript = event.value[0];
  };
}
```

### Location Service Integration

```typescript
// src/services/location/LocationService.ts
import Geolocation from 'react-native-geolocation-service';
import { PERMISSIONS, request, RESULTS } from 'react-native-permissions';

interface Location {
  latitude: number;
  longitude: number;
  accuracy: number;
}

class LocationService {
  async requestLocationPermission(): Promise<boolean> {
    const result = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
    return result === RESULTS.GRANTED;
  }

  async getCurrentLocation(): Promise<Location> {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => reject(error),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    });
  }

  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  }

  private toRad(value: number): number {
    return value * Math.PI / 180;
  }
}
```

## State Management with Zustand

```typescript
// src/stores/sessionStore.ts
import { create } from 'zustand';

interface SessionState {
  currentSession: Partial<SurfSession> | null;
  isRecording: boolean;
  interviewMode: 'guided' | 'freeform';
  currentQuestionIndex: number;
  responses: Record<string, string>;
  setCurrentSession: (session: Partial<SurfSession>) => void;
  setRecording: (isRecording: boolean) => void;
  setInterviewMode: (mode: 'guided' | 'freeform') => void;
  addResponse: (questionId: string, response: string) => void;
  nextQuestion: () => void;
  resetInterview: () => void;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  currentSession: null,
  isRecording: false,
  interviewMode: 'guided',
  currentQuestionIndex: 0,
  responses: {},
  
  setCurrentSession: (session) => set({ currentSession: session }),
  setRecording: (isRecording) => set({ isRecording }),
  setInterviewMode: (mode) => set({ interviewMode: mode }),
  
  addResponse: (questionId, response) => set((state) => ({
    responses: { ...state.responses, [questionId]: response }
  })),
  
  nextQuestion: () => set((state) => ({
    currentQuestionIndex: state.currentQuestionIndex + 1
  })),
  
  resetInterview: () => set({
    currentQuestionIndex: 0,
    responses: {},
    isRecording: false
  })
}));
```

This implementation strategy provides a solid foundation for building the React Native iOS surf tracking application with seamless Railway PostgreSQL integration.
