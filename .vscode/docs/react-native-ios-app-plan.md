# Surf Tracker React Native iOS Application Plan

## Application Overview

A comprehensive surf session tracking application for iOS built with React Native, featuring voice-based session logging, intelligent surf spot database management, and AI-powered surf condition predictions using PostgreSQL database hosted on Railway.

## Core Features

### 1. Voice-Based Session Recording System
- **Guided Interview Mode**: 8 structured questions with voice prompts
- **Free Form Recording**: Open-ended voice notes
- **Text-to-Speech Integration**: iOS native speech synthesis
- **Speech-to-Text Processing**: Real-time transcription
- **Progress Tracking**: Visual indicators for interview completion

### 2. Comprehensive Surf Spot Database
- **Break Classification**: Beach Break, Point Break, Reef Break, River Mouth, Jetty/Pier, Shore Break, Sandbar
- **Tidal Preferences**: Low, Mid, High, Rising, Falling combinations
- **Wind Analysis**: 8 compass directions with optimal conditions
- **Swell Direction Mapping**: Optimal angles for each spot
- **Wave Size Ranges**: Min/max heights for optimal conditions
- **Skill Requirements**: Beginner to Expert classifications
- **Seasonal Patterns**: Spring, Summer, Fall, Winter preferences
- **Crowd Intelligence**: Real-time and historical crowd data

### 3. Smart Location Integration
- **GPS Auto-Detection**: Automatic spot recognition within 100m
- **Session Linking**: Connect sessions to specific surf spots
- **New Spot Discovery**: Prompt creation for unrecognized locations
- **Proximity Alerts**: Notifications when near tracked spots

### 4. AI-Powered Predictions
- **Condition Matching**: Compare forecasts to spot-specific optimal conditions
- **Recommendation Engine**: Suggest best spots for current conditions
- **Pattern Recognition**: Learn user preferences and skill progression
- **Alternative Suggestions**: Backup spots when primary choice unavailable

## Technical Architecture

### Frontend Stack
- **React Native 0.72+**: Latest stable version
- **TypeScript**: Type-safe development
- **React Navigation 6**: Stack and tab navigation
- **React Native Maps**: Map integration and location services
- **React Native Voice**: Speech-to-text functionality
- **React Native TTS**: Text-to-speech capabilities
- **React Native Geolocation**: GPS positioning
- **React Native Async Storage**: Local data persistence
- **React Query**: Server state management
- **Zustand**: Client state management

### Backend Integration
- **Railway PostgreSQL**: Primary database hosted on Railway
- **REST API**: Node.js Express server for database operations
- **Real-time Updates**: WebSocket connections for live data
- **Weather API Integration**: Third-party forecast data
- **Tide API Integration**: Tidal information services

### Database Schema Design

#### Core Tables

```sql
-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    skill_level VARCHAR(20) DEFAULT 'beginner',
    preferred_units VARCHAR(10) DEFAULT 'imperial',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Surf spots table
CREATE TABLE surf_spots (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    name VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    break_type VARCHAR(20) NOT NULL,
    skill_requirement VARCHAR(20) DEFAULT 'beginner',
    tidal_preferences TEXT[], -- ['low', 'mid', 'high', 'rising', 'falling']
    optimal_wind_directions TEXT[], -- ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
    optimal_swell_directions TEXT[],
    min_wave_size DECIMAL(4, 2),
    max_wave_size DECIMAL(4, 2),
    seasonal_preferences TEXT[], -- ['spring', 'summer', 'fall', 'winter']
    crowd_level VARCHAR(20) DEFAULT 'moderate',
    notes TEXT,
    hazards TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Surf sessions table
CREATE TABLE surf_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    surf_spot_id INTEGER REFERENCES surf_spots(id),
    session_date DATE NOT NULL,
    duration_minutes INTEGER,
    wave_height DECIMAL(4, 2),
    wave_quality_rating INTEGER CHECK (wave_quality_rating >= 1 AND wave_quality_rating <= 10),
    wind_direction VARCHAR(3),
    wind_speed DECIMAL(4, 2),
    wind_quality VARCHAR(20),
    tide_state VARCHAR(20),
    crowd_level VARCHAR(20),
    performance_rating INTEGER CHECK (performance_rating >= 1 AND performance_rating <= 10),
    equipment_board VARCHAR(100),
    equipment_wetsuit VARCHAR(100),
    water_temperature DECIMAL(4, 2),
    air_temperature DECIMAL(4, 2),
    session_notes TEXT,
    voice_transcript TEXT,
    memorable_moments TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Weather conditions table
CREATE TABLE weather_conditions (
    id SERIAL PRIMARY KEY,
    surf_spot_id INTEGER REFERENCES surf_spots(id),
    forecast_date DATE NOT NULL,
    wave_height DECIMAL(4, 2),
    wave_period DECIMAL(4, 2),
    swell_direction VARCHAR(3),
    wind_direction VARCHAR(3),
    wind_speed DECIMAL(4, 2),
    tide_high_time TIME,
    tide_low_time TIME,
    tide_high_height DECIMAL(4, 2),
    tide_low_height DECIMAL(4, 2),
    air_temperature DECIMAL(4, 2),
    water_temperature DECIMAL(4, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI predictions table
CREATE TABLE ai_predictions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    surf_spot_id INTEGER REFERENCES surf_spots(id),
    prediction_date DATE NOT NULL,
    predicted_quality_score DECIMAL(4, 2),
    confidence_level DECIMAL(3, 2),
    reasoning TEXT,
    weather_factors JSONB,
    historical_patterns JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Application Flow

### 1. User Onboarding
- Account creation with skill level assessment
- Location permissions setup
- Voice permissions configuration
- Tutorial walkthrough

### 2. Session Logging Workflow
- Location detection and spot suggestion
- Recording mode selection (Guided vs Free Form)
- Voice interview execution with progress tracking
- Session data processing and storage
- Spot association and validation

### 3. Spot Management
- Interactive map view with spot markers
- Spot creation wizard with characteristic selection
- Historical session data visualization
- Condition correlation analysis

### 4. Prediction Engine
- Real-time weather data integration
- Historical pattern analysis
- AI-powered recommendations
- Alternative spot suggestions

## iOS-Specific Considerations

### Native Integrations
- **Core Location**: GPS and location services
- **AVAudioSession**: Audio recording permissions
- **Speech Framework**: Native speech recognition
- **AVSpeechSynthesizer**: Text-to-speech functionality
- **MapKit**: Native map integration
- **Background App Refresh**: Session tracking continuation
- **Push Notifications**: Condition alerts

### Performance Optimizations
- **Image Caching**: Spot photos and weather icons
- **Offline Capability**: Local data storage for poor connectivity
- **Battery Optimization**: Efficient location tracking
- **Memory Management**: Large dataset handling

### User Experience
- **iOS Design Guidelines**: Native look and feel
- **Accessibility**: VoiceOver and dynamic type support
- **Dark Mode**: Automatic theme switching
- **Haptic Feedback**: Touch response enhancement

## Development Phases

### Phase 1: Foundation (Weeks 1-4)
- React Native project setup
- Database schema implementation
- Basic navigation structure
- Location services integration
- Voice recording capabilities

### Phase 2: Session Management (Weeks 5-8)
- Guided interview implementation
- Session storage and retrieval
- Basic spot creation
- Map integration

### Phase 3: Intelligence Layer (Weeks 9-12)
- Weather API integration
- Pattern recognition algorithms
- Prediction engine development
- AI recommendation system

### Phase 4: Polish & Optimization (Weeks 13-16)
- Performance optimization
- UI/UX refinement
- Testing and bug fixes
- App Store preparation

## Integration Requirements

### Railway PostgreSQL Connection
```javascript
// Database connection configuration
const databaseConfig = {
  host: process.env.RAILWAY_HOST,
  port: process.env.RAILWAY_PORT,
  database: process.env.RAILWAY_DATABASE,
  username: process.env.RAILWAY_USERNAME,
  password: process.env.RAILWAY_PASSWORD,
  ssl: true
};
```

### Environment Variables
- `RAILWAY_DATABASE_URL`: Complete connection string
- `WEATHER_API_KEY`: Third-party weather service
- `TIDE_API_KEY`: Tidal information service
- `CLAUDE_API_KEY`: AI prediction engine

This comprehensive plan creates a sophisticated surf tracking application that leverages iOS capabilities while maintaining seamless integration with your Railway PostgreSQL database.
