-- Surf Tracker Database Schema Migration
-- This file contains all the necessary tables for the React Native iOS surf tracking application

-- Enable UUID extension for better primary keys
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table with extended surf-specific fields
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    skill_level VARCHAR(20) DEFAULT 'beginner' CHECK (skill_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    preferred_units VARCHAR(10) DEFAULT 'imperial' CHECK (preferred_units IN ('imperial', 'metric')),
    home_location_lat DECIMAL(10, 8),
    home_location_lng DECIMAL(11, 8),
    timezone VARCHAR(50) DEFAULT 'UTC',
    notification_preferences JSONB DEFAULT '{"conditions": true, "spots": true, "social": false}',
    profile_image_url TEXT,
    bio TEXT,
    years_surfing INTEGER,
    favorite_board_type VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Surf spots with comprehensive characteristics
CREATE TABLE IF NOT EXISTS surf_spots (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    
    -- Break characteristics
    break_type VARCHAR(20) NOT NULL CHECK (break_type IN ('beach', 'point', 'reef', 'river_mouth', 'jetty', 'shore', 'sandbar')),
    skill_requirement VARCHAR(20) DEFAULT 'beginner' CHECK (skill_requirement IN ('beginner', 'intermediate', 'advanced', 'expert')),
    
    -- Tidal preferences
    tidal_preferences TEXT[] DEFAULT ARRAY[]::TEXT[],
    
    -- Wind preferences
    optimal_wind_directions TEXT[] DEFAULT ARRAY[]::TEXT[],
    wind_strength_min DECIMAL(4, 2) DEFAULT 0,
    wind_strength_max DECIMAL(4, 2) DEFAULT 25,
    
    -- Swell characteristics
    optimal_swell_directions TEXT[] DEFAULT ARRAY[]::TEXT[],
    swell_period_min DECIMAL(4, 2),
    swell_period_max DECIMAL(4, 2),
    
    -- Wave size ranges
    min_wave_size DECIMAL(4, 2) DEFAULT 1,
    max_wave_size DECIMAL(4, 2) DEFAULT 15,
    optimal_wave_size_min DECIMAL(4, 2),
    optimal_wave_size_max DECIMAL(4, 2),
    
    -- Seasonal and crowd information
    seasonal_preferences TEXT[] DEFAULT ARRAY[]::TEXT[],
    crowd_level VARCHAR(20) DEFAULT 'moderate' CHECK (crowd_level IN ('uncrowded', 'light', 'moderate', 'crowded', 'very_crowded')),
    best_time_of_day VARCHAR(20),
    
    -- Safety and access
    hazards TEXT,
    access_notes TEXT,
    parking_info TEXT,
    facilities TEXT,
    
    -- Additional metadata
    notes TEXT,
    is_public BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    total_sessions INTEGER DEFAULT 0,
    average_rating DECIMAL(3, 2) DEFAULT 0,
    
    -- Location indexing
    geom GEOGRAPHY(POINT, 4326),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create spatial index for efficient location queries
CREATE INDEX IF NOT EXISTS idx_surf_spots_geom ON surf_spots USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_surf_spots_user_id ON surf_spots (user_id);
CREATE INDEX IF NOT EXISTS idx_surf_spots_break_type ON surf_spots (break_type);

-- Surf sessions with detailed tracking
CREATE TABLE IF NOT EXISTS surf_sessions (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    surf_spot_id INTEGER REFERENCES surf_spots(id) ON DELETE SET NULL,
    
    -- Session timing
    session_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    duration_minutes INTEGER,
    
    -- Wave conditions
    wave_height DECIMAL(4, 2),
    wave_height_max DECIMAL(4, 2),
    wave_period DECIMAL(4, 2),
    wave_quality_rating INTEGER CHECK (wave_quality_rating >= 1 AND wave_quality_rating <= 10),
    swell_direction VARCHAR(3),
    swell_size DECIMAL(4, 2),
    
    -- Wind conditions
    wind_direction VARCHAR(3),
    wind_speed DECIMAL(4, 2),
    wind_quality VARCHAR(20) CHECK (wind_quality IN ('offshore', 'onshore', 'cross_shore', 'variable', 'glassy')),
    
    -- Tidal information
    tide_state VARCHAR(20) CHECK (tide_state IN ('low', 'mid', 'high', 'rising', 'falling')),
    tide_height DECIMAL(4, 2),
    
    -- Environmental conditions
    crowd_level VARCHAR(20) CHECK (crowd_level IN ('uncrowded', 'light', 'moderate', 'crowded', 'very_crowded')),
    water_temperature DECIMAL(4, 2),
    air_temperature DECIMAL(4, 2),
    water_clarity VARCHAR(20),
    weather_conditions VARCHAR(50),
    
    -- Performance and equipment
    performance_rating INTEGER CHECK (performance_rating >= 1 AND performance_rating <= 10),
    fitness_level_rating INTEGER CHECK (fitness_level_rating >= 1 AND fitness_level_rating <= 10),
    equipment_board VARCHAR(100),
    equipment_wetsuit VARCHAR(100),
    equipment_other TEXT,
    
    -- Session content
    session_notes TEXT,
    voice_transcript TEXT,
    memorable_moments TEXT,
    skills_practiced TEXT[],
    waves_caught INTEGER,
    best_wave_description TEXT,
    
    -- Technical data
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    session_photos TEXT[], -- URLs to photo storage
    session_videos TEXT[], -- URLs to video storage
    
    -- Metadata
    recording_mode VARCHAR(20) DEFAULT 'guided' CHECK (recording_mode IN ('guided', 'freeform')),
    is_favorite BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for efficient session queries
CREATE INDEX IF NOT EXISTS idx_surf_sessions_user_id ON surf_sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_surf_sessions_spot_id ON surf_sessions (surf_spot_id);
CREATE INDEX IF NOT EXISTS idx_surf_sessions_date ON surf_sessions (session_date);
CREATE INDEX IF NOT EXISTS idx_surf_sessions_performance ON surf_sessions (performance_rating);

-- Weather conditions and forecasts
CREATE TABLE IF NOT EXISTS weather_conditions (
    id SERIAL PRIMARY KEY,
    surf_spot_id INTEGER REFERENCES surf_spots(id) ON DELETE CASCADE,
    
    -- Forecast metadata
    forecast_date DATE NOT NULL,
    forecast_time TIME,
    forecast_source VARCHAR(50), -- 'surfline', 'magicseaweed', 'noaa', etc.
    is_historical BOOLEAN DEFAULT false,
    
    -- Wave data
    wave_height DECIMAL(4, 2),
    wave_height_min DECIMAL(4, 2),
    wave_height_max DECIMAL(4, 2),
    wave_period DECIMAL(4, 2),
    wave_period_primary DECIMAL(4, 2),
    wave_period_secondary DECIMAL(4, 2),
    swell_direction VARCHAR(3),
    swell_direction_primary VARCHAR(3),
    swell_direction_secondary VARCHAR(3),
    
    -- Wind data
    wind_direction VARCHAR(3),
    wind_speed DECIMAL(4, 2),
    wind_gusts DECIMAL(4, 2),
    
    -- Tidal data
    tide_high_time TIME,
    tide_low_time TIME,
    tide_high_height DECIMAL(4, 2),
    tide_low_height DECIMAL(4, 2),
    current_tide_height DECIMAL(4, 2),
    
    -- Environmental data
    air_temperature DECIMAL(4, 2),
    water_temperature DECIMAL(4, 2),
    visibility DECIMAL(4, 2),
    uv_index INTEGER,
    precipitation_chance INTEGER,
    cloud_cover INTEGER,
    
    -- Quality indicators
    surf_quality_score DECIMAL(3, 1),
    confidence_level DECIMAL(3, 2),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for weather data
CREATE INDEX IF NOT EXISTS idx_weather_conditions_spot_date ON weather_conditions (surf_spot_id, forecast_date);
CREATE INDEX IF NOT EXISTS idx_weather_conditions_date ON weather_conditions (forecast_date);

-- AI predictions and recommendations
CREATE TABLE IF NOT EXISTS ai_predictions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    surf_spot_id INTEGER REFERENCES surf_spots(id) ON DELETE CASCADE,
    
    -- Prediction metadata
    prediction_date DATE NOT NULL,
    prediction_time TIME DEFAULT CURRENT_TIME,
    model_version VARCHAR(20) DEFAULT 'v1.0',
    
    -- Prediction results
    predicted_quality_score DECIMAL(4, 2) NOT NULL,
    confidence_level DECIMAL(3, 2) NOT NULL,
    reasoning TEXT,
    
    -- Factors analysis
    weather_factors JSONB,
    historical_patterns JSONB,
    user_preferences JSONB,
    crowd_prediction VARCHAR(20),
    
    -- Recommendations
    recommended_time_windows JSONB, -- Array of optimal time ranges
    equipment_recommendations TEXT,
    skill_level_suitability VARCHAR(20),
    alternative_spots INTEGER[], -- Array of surf_spot_ids
    
    -- Validation
    actual_quality_score DECIMAL(4, 2), -- Filled after session
    prediction_accuracy DECIMAL(3, 2), -- Calculated accuracy
    user_feedback INTEGER CHECK (user_feedback >= 1 AND user_feedback <= 5),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for AI predictions
CREATE INDEX IF NOT EXISTS idx_ai_predictions_user_spot ON ai_predictions (user_id, surf_spot_id);
CREATE INDEX IF NOT EXISTS idx_ai_predictions_date ON ai_predictions (prediction_date);
CREATE INDEX IF NOT EXISTS idx_ai_predictions_quality ON ai_predictions (predicted_quality_score);

-- User preferences and settings
CREATE TABLE IF NOT EXISTS user_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    
    -- Notification settings
    notify_optimal_conditions BOOLEAN DEFAULT true,
    notify_new_spots BOOLEAN DEFAULT true,
    notify_session_reminders BOOLEAN DEFAULT false,
    notification_hours_start TIME DEFAULT '06:00:00',
    notification_hours_end TIME DEFAULT '20:00:00',
    
    -- Condition preferences
    preferred_wave_size_min DECIMAL(4, 2) DEFAULT 2,
    preferred_wave_size_max DECIMAL(4, 2) DEFAULT 8,
    preferred_wind_directions TEXT[] DEFAULT ARRAY['W', 'NW', 'N']::TEXT[],
    preferred_crowd_levels TEXT[] DEFAULT ARRAY['uncrowded', 'light']::TEXT[],
    
    -- Privacy settings
    profile_visibility VARCHAR(20) DEFAULT 'public' CHECK (profile_visibility IN ('public', 'friends', 'private')),
    share_session_data BOOLEAN DEFAULT true,
    share_spot_data BOOLEAN DEFAULT false,
    
    -- App settings
    auto_detect_sessions BOOLEAN DEFAULT true,
    default_recording_mode VARCHAR(20) DEFAULT 'guided',
    measurement_units VARCHAR(10) DEFAULT 'imperial',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Session analytics for performance tracking
CREATE TABLE IF NOT EXISTS session_analytics (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    session_id INTEGER REFERENCES surf_sessions(id) ON DELETE CASCADE,
    
    -- Performance metrics
    progression_score DECIMAL(4, 2),
    consistency_rating INTEGER,
    technical_improvement JSONB,
    
    -- Comparative analysis
    spot_performance_rank INTEGER,
    user_average_comparison DECIMAL(4, 2),
    seasonal_comparison DECIMAL(4, 2),
    
    -- Insights
    strengths TEXT[],
    areas_for_improvement TEXT[],
    recommendations TEXT[],
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Triggers for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_surf_spots_updated_at BEFORE UPDATE ON surf_spots FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_surf_sessions_updated_at BEFORE UPDATE ON surf_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update spot statistics when sessions are added
CREATE OR REPLACE FUNCTION update_spot_statistics()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE surf_spots 
    SET 
        total_sessions = (
            SELECT COUNT(*) FROM surf_sessions 
            WHERE surf_spot_id = NEW.surf_spot_id
        ),
        average_rating = (
            SELECT AVG(wave_quality_rating) FROM surf_sessions 
            WHERE surf_spot_id = NEW.surf_spot_id 
            AND wave_quality_rating IS NOT NULL
        )
    WHERE id = NEW.surf_spot_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update spot statistics
CREATE TRIGGER update_spot_stats_on_session 
    AFTER INSERT OR UPDATE ON surf_sessions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_spot_statistics();

-- Function to automatically set geom column for surf spots
CREATE OR REPLACE FUNCTION set_surf_spot_geom()
RETURNS TRIGGER AS $$
BEGIN
    NEW.geom = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to set geometry
CREATE TRIGGER set_surf_spot_geom_trigger 
    BEFORE INSERT OR UPDATE ON surf_spots 
    FOR EACH ROW 
    EXECUTE FUNCTION set_surf_spot_geom();

-- Sample data for testing
INSERT INTO users (username, email, password_hash, first_name, last_name, skill_level) VALUES
('surf_pro', 'surfer@example.com', 'hashed_password_here', 'John', 'Surfer', 'advanced'),
('wave_rider', 'rider@example.com', 'hashed_password_here', 'Jane', 'Rider', 'intermediate')
ON CONFLICT (username) DO NOTHING;

-- Sample surf spots
INSERT INTO surf_spots (user_id, name, latitude, longitude, break_type, skill_requirement, 
                       optimal_wind_directions, min_wave_size, max_wave_size, notes) VALUES
(1, 'Malibu Point', 34.0259, -118.7798, 'point', 'intermediate', 
 ARRAY['NW', 'W', 'SW'], 2, 8, 'Classic California point break with consistent waves'),
(1, 'Venice Beach', 33.9850, -118.4695, 'beach', 'beginner', 
 ARRAY['W', 'SW'], 1, 6, 'Sandy bottom beach break, good for beginners'),
(1, 'Pipeline', 21.6389, -158.0469, 'reef', 'expert', 
 ARRAY['NE', 'E'], 4, 15, 'World famous reef break, experts only')
ON CONFLICT DO NOTHING;
