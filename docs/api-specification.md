# Surf Tracker Backend API Specification

## Overview

REST API for the Surf Tracker React Native iOS application, providing comprehensive surf session management, spot database, weather integration, and AI-powered predictions. Built with Node.js/Express and PostgreSQL on Railway.

## Base Configuration

### Environment Variables
```
RAILWAY_DATABASE_URL=postgresql://username:password@host:port/database
PORT=3000
NODE_ENV=production
JWT_SECRET=your_jwt_secret_key
CLAUDE_API_KEY=your_claude_api_key
WEATHER_API_KEY=your_weather_service_key
TIDE_API_KEY=your_tide_service_key
```

### Base URL
```
Production: https://your-app.railway.app/api/v1
Development: http://localhost:3000/api/v1
```

## Authentication Endpoints

### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "username": "string (required, 3-50 chars, unique)",
  "email": "string (required, valid email, unique)",
  "password": "string (required, min 8 chars)",
  "firstName": "string (optional, max 50 chars)",
  "lastName": "string (optional, max 50 chars)",
  "skillLevel": "string (optional, enum: beginner|intermediate|advanced|expert)"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "uuid": "uuid-v4-string",
      "username": "surfpro",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Surfer",
      "skillLevel": "intermediate",
      "preferredUnits": "imperial",
      "isActive": true,
      "createdAt": "2025-06-27T10:00:00.000Z"
    },
    "token": "jwt-token-string"
  }
}
```

### POST /auth/login
Authenticate user and get access token.

**Request Body:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "uuid": "uuid-v4-string",
      "username": "surfpro",
      "email": "user@example.com",
      "skillLevel": "intermediate"
    },
    "token": "jwt-token-string"
  }
}
```

### POST /auth/refresh
Refresh JWT token.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "new-jwt-token-string"
  }
}
```

## User Management Endpoints

### GET /users/profile
Get current user profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "uuid": "uuid-v4-string",
    "username": "surfpro",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Surfer",
    "skillLevel": "intermediate",
    "preferredUnits": "imperial",
    "homeLocationLat": 34.0522,
    "homeLocationLng": -118.2437,
    "timezone": "America/Los_Angeles",
    "profileImageUrl": "https://storage.example.com/profile.jpg",
    "bio": "Passionate surfer from California",
    "yearsSurfing": 15,
    "favoriteBoardType": "shortboard",
    "totalSessions": 247,
    "createdAt": "2025-01-15T08:30:00.000Z"
  }
}
```

### PUT /users/profile
Update user profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "firstName": "string (optional)",
  "lastName": "string (optional)",
  "skillLevel": "string (optional, enum)",
  "preferredUnits": "string (optional, enum: imperial|metric)",
  "homeLocationLat": "number (optional)",
  "homeLocationLng": "number (optional)",
  "timezone": "string (optional)",
  "bio": "string (optional)",
  "yearsSurfing": "number (optional)",
  "favoriteBoardType": "string (optional)"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Profile updated successfully"
  }
}
```

## Surf Spots Endpoints

### GET /surf-spots
Get all surf spots for the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
```
?limit=20&offset=0&search=malibu&breakType=point&skillLevel=intermediate
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "spots": [
      {
        "id": 1,
        "uuid": "uuid-v4-string",
        "name": "Malibu Point",
        "description": "Classic California point break",
        "latitude": 34.0259,
        "longitude": -118.7798,
        "breakType": "point",
        "skillRequirement": "intermediate",
        "tidalPreferences": ["mid", "high"],
        "optimalWindDirections": ["NW", "W", "SW"],
        "optimalSwellDirections": ["W", "SW"],
        "minWaveSize": 2.0,
        "maxWaveSize": 8.0,
        "seasonalPreferences": ["fall", "winter"],
        "crowdLevel": "moderate",
        "notes": "Perfect for long rides",
        "hazards": "Rocks at low tide",
        "totalSessions": 45,
        "averageRating": 7.8,
        "lastSurfed": "2025-06-25T14:30:00.000Z",
        "createdAt": "2025-03-10T09:15:00.000Z"
      }
    ],
    "pagination": {
      "total": 15,
      "limit": 20,
      "offset": 0,
      "hasMore": false
    }
  }
}
```

### POST /surf-spots
Create a new surf spot.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "string (required, max 100 chars)",
  "description": "string (optional)",
  "latitude": "number (required, -90 to 90)",
  "longitude": "number (required, -180 to 180)",
  "breakType": "string (required, enum: beach|point|reef|river_mouth|jetty|shore|sandbar)",
  "skillRequirement": "string (optional, enum: beginner|intermediate|advanced|expert)",
  "tidalPreferences": "array of strings (optional)",
  "optimalWindDirections": "array of strings (optional)",
  "optimalSwellDirections": "array of strings (optional)",
  "minWaveSize": "number (optional, min 0)",
  "maxWaveSize": "number (optional, max 50)",
  "seasonalPreferences": "array of strings (optional)",
  "crowdLevel": "string (optional, enum: uncrowded|light|moderate|crowded|very_crowded)",
  "notes": "string (optional)",
  "hazards": "string (optional)"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 15,
    "uuid": "uuid-v4-string",
    "name": "Secret Spot",
    "latitude": 33.9425,
    "longitude": -118.4081,
    "breakType": "beach",
    "createdAt": "2025-06-27T10:30:00.000Z"
  }
}
```

### GET /surf-spots/nearby
Get surf spots near a specific location.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
```
?lat=34.0522&lng=-118.2437&radius=10&limit=10
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "spots": [
      {
        "id": 1,
        "name": "Venice Beach",
        "latitude": 33.9850,
        "longitude": -118.4695,
        "breakType": "beach",
        "distance": 2.3,
        "currentConditions": {
          "waveHeight": 3.5,
          "windSpeed": 8,
          "windDirection": "W"
        }
      }
    ]
  }
}
```

### GET /surf-spots/:id
Get specific surf spot details.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "spot": {
      "id": 1,
      "uuid": "uuid-v4-string",
      "name": "Malibu Point",
      "description": "Classic California point break",
      "latitude": 34.0259,
      "longitude": -118.7798,
      "breakType": "point",
      "skillRequirement": "intermediate",
      "tidalPreferences": ["mid", "high"],
      "optimalWindDirections": ["NW", "W", "SW"],
      "totalSessions": 45,
      "averageRating": 7.8,
      "recentSessions": [
        {
          "id": 123,
          "sessionDate": "2025-06-25",
          "waveQualityRating": 8,
          "performanceRating": 7,
          "durationMinutes": 90
        }
      ]
    }
  }
}
```

### PUT /surf-spots/:id
Update surf spot information.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:** Same as POST /surf-spots (all fields optional)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Surf spot updated successfully"
  }
}
```

### DELETE /surf-spots/:id
Delete a surf spot.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Surf spot deleted successfully"
  }
}
```

## Surf Sessions Endpoints

### GET /sessions
Get surf sessions for the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
```
?limit=20&offset=0&spotId=1&startDate=2025-06-01&endDate=2025-06-30&minRating=6
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": 123,
        "uuid": "uuid-v4-string",
        "surfSpotId": 1,
        "spotName": "Malibu Point",
        "sessionDate": "2025-06-25",
        "startTime": "14:30:00",
        "endTime": "16:00:00",
        "durationMinutes": 90,
        "waveHeight": 4.5,
        "waveQualityRating": 8,
        "windDirection": "W",
        "windSpeed": 12,
        "tideState": "rising",
        "crowdLevel": "moderate",
        "performanceRating": 7,
        "equipmentBoard": "6'2\" Al Byrne",
        "equipmentWetsuit": "4/3 O'Neill",
        "waterTemperature": 68,
        "sessionNotes": "Great session with solid waves",
        "voiceTranscript": "Had an amazing time today...",
        "wavesCaught": 15,
        "latitude": 34.0259,
        "longitude": -118.7798,
        "createdAt": "2025-06-25T16:15:00.000Z"
      }
    ],
    "pagination": {
      "total": 87,
      "limit": 20,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

### POST /sessions
Create a new surf session.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "surfSpotId": "number (optional)",
  "sessionDate": "string (required, YYYY-MM-DD format)",
  "startTime": "string (optional, HH:MM:SS format)",
  "endTime": "string (optional, HH:MM:SS format)",
  "durationMinutes": "number (optional)",
  "waveHeight": "number (optional)",
  "waveQualityRating": "number (optional, 1-10)",
  "windDirection": "string (optional)",
  "windSpeed": "number (optional)",
  "windQuality": "string (optional)",
  "tideState": "string (optional)",
  "crowdLevel": "string (optional)",
  "performanceRating": "number (optional, 1-10)",
  "equipmentBoard": "string (optional)",
  "equipmentWetsuit": "string (optional)",
  "waterTemperature": "number (optional)",
  "airTemperature": "number (optional)",
  "sessionNotes": "string (optional)",
  "voiceTranscript": "string (optional)",
  "memorableMoments": "string (optional)",
  "wavesCaught": "number (optional)",
  "latitude": "number (optional)",
  "longitude": "number (optional)",
  "recordingMode": "string (optional, enum: guided|freeform)"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 124,
    "uuid": "uuid-v4-string",
    "sessionDate": "2025-06-27",
    "createdAt": "2025-06-27T10:45:00.000Z"
  }
}
```

### GET /sessions/:id
Get specific session details.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "session": {
      "id": 123,
      "uuid": "uuid-v4-string",
      "surfSpotId": 1,
      "spot": {
        "id": 1,
        "name": "Malibu Point",
        "breakType": "point"
      },
      "sessionDate": "2025-06-25",
      "durationMinutes": 90,
      "waveHeight": 4.5,
      "waveQualityRating": 8,
      "performanceRating": 7,
      "sessionNotes": "Great session with solid waves",
      "voiceTranscript": "Had an amazing time today...",
      "analytics": {
        "progressionScore": 7.2,
        "consistencyRating": 8,
        "spotPerformanceRank": 3
      }
    }
  }
}
```

### PUT /sessions/:id
Update session information.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:** Same as POST /sessions (all fields optional)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Session updated successfully"
  }
}
```

### DELETE /sessions/:id
Delete a surf session.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Session deleted successfully"
  }
}
```

## Weather & Conditions Endpoints

### GET /weather/forecast/:spotId
Get weather forecast for a specific surf spot.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
```
?days=7&detailed=true
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "spot": {
      "id": 1,
      "name": "Malibu Point"
    },
    "forecasts": [
      {
        "date": "2025-06-27",
        "time": "06:00:00",
        "waveHeight": 3.5,
        "waveHeightMin": 2.8,
        "waveHeightMax": 4.2,
        "wavePeriod": 12,
        "swellDirection": "SW",
        "windDirection": "NW",
        "windSpeed": 8,
        "tideHighTime": "08:45:00",
        "tideLowTime": "14:30:00",
        "tideHighHeight": 5.2,
        "tideLowHeight": 0.8,
        "airTemperature": 72,
        "waterTemperature": 68,
        "surfQualityScore": 7.5,
        "confidenceLevel": 0.85
      }
    ]
  }
}
```

### GET /weather/current/:spotId
Get current conditions for a surf spot.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "spot": {
      "id": 1,
      "name": "Malibu Point"
    },
    "current": {
      "timestamp": "2025-06-27T10:30:00.000Z",
      "waveHeight": 3.2,
      "windDirection": "NW",
      "windSpeed": 10,
      "tideHeight": 3.1,
      "tideState": "rising",
      "airTemperature": 74,
      "waterTemperature": 68,
      "surfQualityScore": 6.8
    }
  }
}
```

## AI Predictions Endpoints

### POST /predictions/generate
Generate AI prediction for surf conditions.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "spotId": "number (required)",
  "targetDate": "string (required, YYYY-MM-DD format)",
  "includeAlternatives": "boolean (optional, default: true)"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "prediction": {
      "id": 45,
      "spotId": 1,
      "predictionDate": "2025-06-28",
      "qualityScore": 8.2,
      "confidenceLevel": 0.78,
      "reasoning": "Optimal offshore winds with solid SW swell. Wave size perfect for this break type.",
      "recommendedTimeWindows": [
        {
          "start": "06:00:00",
          "end": "09:00:00",
          "quality": 8.5,
          "reason": "Dawn patrol with best wind conditions"
        },
        {
          "start": "16:00:00", 
          "end": "18:00:00",
          "quality": 7.8,
          "reason": "Evening session with rising tide"
        }
      ],
      "equipmentRecommendations": "6'0\" - 6'4\" shortboard, 3/2 wetsuit",
      "crowdPrediction": "moderate",
      "alternativeSpots": [
        {
          "spotId": 3,
          "name": "Venice Beach",
          "qualityScore": 6.5,
          "distance": 8.2
        }
      ]
    }
  }
}
```

### GET /predictions/user
Get recent predictions for user.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
```
?limit=10&startDate=2025-06-01
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "predictions": [
      {
        "id": 45,
        "spotName": "Malibu Point",
        "predictionDate": "2025-06-28",
        "qualityScore": 8.2,
        "confidenceLevel": 0.78,
        "actualQualityScore": null,
        "accuracy": null,
        "createdAt": "2025-06-27T10:30:00.000Z"
      }
    ]
  }
}
```

## Analytics Endpoints

### GET /analytics/user-stats
Get user surfing statistics.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
```
?period=month&year=2025&month=6
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "period": {
      "start": "2025-06-01",
      "end": "2025-06-30"
    },
    "stats": {
      "totalSessions": 12,
      "totalHours": 18.5,
      "averageSessionDuration": 92,
      "averageWaveQuality": 6.8,
      "averagePerformance": 7.1,
      "totalWavesCaught": 187,
      "favoriteSpots": [
        {
          "spotId": 1,
          "name": "Malibu Point",
          "sessions": 5,
          "averageRating": 7.8
        }
      ],
      "progressionScore": 7.4,
      "skillImprovement": "+12%",
      "bestSession": {
        "id": 123,
        "date": "2025-06-25",
        "rating": 9,
        "spot": "Malibu Point"
      }
    }
  }
}
```

### GET /analytics/spot-performance/:spotId
Get performance analytics for a specific spot.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "spot": {
      "id": 1,
      "name": "Malibu Point"
    },
    "performance": {
      "totalSessions": 45,
      "averageRating": 7.8,
      "bestSession": 9,
      "worstSession": 4,
      "optimalConditions": {
        "waveSize": "3-6ft",
        "windDirection": "NW",
        "tideState": "mid to high"
      },
      "monthlyTrends": [
        {
          "month": "2025-06",
          "sessions": 5,
          "averageRating": 7.2
        }
      ]
    }
  }
}
```

## Error Responses

### Standard Error Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  }
}
```

### Common Error Codes
- `VALIDATION_ERROR` (400): Invalid request data
- `UNAUTHORIZED` (401): Invalid or missing authentication
- `FORBIDDEN` (403): Insufficient permissions
- `NOT_FOUND` (404): Resource not found
- `CONFLICT` (409): Resource already exists
- `RATE_LIMITED` (429): Too many requests
- `INTERNAL_ERROR` (500): Server error

## Rate Limiting

All endpoints are rate limited based on user authentication:
- Authenticated users: 1000 requests per hour
- Prediction endpoints: 100 requests per hour
- Registration endpoint: 5 requests per hour per IP

## Database Connection

### Connection Configuration
```javascript
const pool = new Pool({
  connectionString: process.env.RAILWAY_DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### Health Check Endpoint

### GET /health
Check API and database health.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2025-06-27T10:30:00.000Z",
    "database": "connected",
    "version": "1.0.0"
  }
}
```

This API specification provides comprehensive endpoints for all surf tracking functionality with proper authentication, validation, and error handling.
