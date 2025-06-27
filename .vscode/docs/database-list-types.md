# Database List Types - Surf Tracker Application

## Railway Database Configuration

### Primary Database Type

- **Database**: PostgreSQL 15
- **Connection**: Uses `DATABASE_URL` environment variable
- **Extensions**: UUID-OSSP for generating UUIDs

## Database Tables Overview

### 1. Users Table (`users`)

**Purpose**: User authentication and profile management
**Key Fields**:

- `id` (SERIAL PRIMARY KEY)
- `uuid` (UUID, unique identifier)
- `username` (VARCHAR(50), unique)
- `email` (VARCHAR(100), unique)
- `skill_level` (ENUM: 'beginner', 'intermediate', 'advanced', 'expert')
- `preferred_units` (ENUM: 'imperial', 'metric')
- `notification_preferences` (JSONB)

### 2. Surf Spots Table (`surf_spots`)

**Purpose**: Location and characteristics of surf breaks
**Key Fields**:

- `id` (SERIAL PRIMARY KEY)
- `break_type` (ENUM: 'beach', 'point', 'reef', 'river_mouth', 'jetty', 'shore', 'sandbar')
- `skill_requirement` (ENUM: 'beginner', 'intermediate', 'advanced', 'expert')
- `tidal_preferences` (TEXT ARRAY)
- `optimal_wind_directions` (TEXT ARRAY)
- `latitude`/`longitude` (DECIMAL coordinates)

### 3. Surf Sessions Table (`surf_sessions`)

**Purpose**: Individual surf session records
**Key Fields**:

- `id` (SERIAL PRIMARY KEY)
- `user_id` (Foreign Key to users)
- `surf_spot_id` (Foreign Key to surf_spots)
- `session_date` (TIMESTAMP)
- `duration_minutes` (INTEGER)
- `wave_count` (INTEGER)
- `rating` (INTEGER 1-10)
- `conditions_rating` (INTEGER 1-10)

### 4. Weather Conditions Table (`weather_conditions`)

**Purpose**: Weather and surf condition data
**Key Fields**:

- `id` (SERIAL PRIMARY KEY)
- `surf_spot_id` (Foreign Key to surf_spots)
- `wave_height_ft` (DECIMAL)
- `wave_period_sec` (INTEGER)
- `wind_speed_mph` (DECIMAL)
- `wind_direction` (VARCHAR)
- `tide_height_ft` (DECIMAL)
- `water_temp_f` (DECIMAL)

### 5. AI Predictions Table (`ai_predictions`)

**Purpose**: Machine learning predictions for surf conditions
**Key Fields**:

- `id` (SERIAL PRIMARY KEY)
- `surf_spot_id` (Foreign Key to surf_spots)
- `predicted_for` (TIMESTAMP)
- `confidence_score` (DECIMAL 0.0-1.0)
- `predicted_conditions` (JSONB)
- `model_version` (VARCHAR)

### 6. User Preferences Table (`user_preferences`)

**Purpose**: User-specific settings and preferences
**Key Fields**:

- `id` (SERIAL PRIMARY KEY)
- `user_id` (Foreign Key to users)
- `preference_type` (VARCHAR)
- `preference_value` (JSONB)
- `is_active` (BOOLEAN)

### 7. Session Analytics Table (`session_analytics`)

**Purpose**: Performance analytics and statistics
**Key Fields**:

- `id` (SERIAL PRIMARY KEY)
- `user_id` (Foreign Key to users)
- `metric_name` (VARCHAR)
- `metric_value` (DECIMAL)
- `time_period` (VARCHAR)
- `calculated_at` (TIMESTAMP)

## Enum Types Used

### Skill Levels

```sql
CHECK (skill_level IN ('beginner', 'intermediate', 'advanced', 'expert'))
```

### Break Types

```sql
CHECK (break_type IN ('beach', 'point', 'reef', 'river_mouth', 'jetty', 'shore', 'sandbar'))
```

### Unit Preferences

```sql
CHECK (preferred_units IN ('imperial', 'metric'))
```

## Array Types Used

### Wind Directions

```sql
optimal_wind_directions TEXT[] DEFAULT ARRAY[]::TEXT[]
```

### Tidal Preferences

```sql
tidal_preferences TEXT[] DEFAULT ARRAY[]::TEXT[]
```

## JSONB Types Used

### Notification Preferences

```json
{
  "conditions": true,
  "spots": true,
  "social": false
}
```

### Predicted Conditions

```json
{
  "wave_height": 4.5,
  "wave_period": 12,
  "wind_speed": 8,
  "wind_direction": "offshore"
}
```

## Database Relationships

```mermaid
graph TD
    A[users] --> B[surf_sessions]
    A --> C[surf_spots]
    A --> D[user_preferences]
    A --> E[session_analytics]
    C --> B
    C --> F[weather_conditions]
    C --> G[ai_predictions]
```

## Railway Environment Variables

### Production Database

```bash
DATABASE_URL=postgresql://username:password@host:port/database
```

### Development Database

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres
```

## Supported Data Operations

### Connection Types

- **Read Operations**: SELECT queries, analytics, reporting
- **Write Operations**: INSERT, UPDATE, DELETE for all tables
- **Batch Operations**: Bulk inserts for weather data
- **JSON Operations**: JSONB queries for preferences and predictions

### Performance Features

- **Indexing**: Primary keys, foreign keys, UUID fields
- **Constraints**: Check constraints for enums, foreign key constraints
- **Triggers**: Automatic timestamp updates
- **Extensions**: UUID generation capabilities
