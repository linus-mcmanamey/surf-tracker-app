-- Database initialization script for Railway PostgreSQL
-- This script creates the necessary tables for the Surf Tracker application

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create surf_spots table
CREATE TABLE IF NOT EXISTS surf_spots (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users (id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    break_type VARCHAR(50),
    skill_requirement VARCHAR(50),
    notes TEXT,
    total_sessions INTEGER DEFAULT 0,
    average_rating DECIMAL(3, 2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create surf_sessions table
CREATE TABLE IF NOT EXISTS surf_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users (id) ON DELETE CASCADE,
    surf_spot_id INTEGER REFERENCES surf_spots (id) ON DELETE CASCADE,
    session_date DATE NOT NULL,
    start_time TIME,
    duration_minutes INTEGER,
    waves_caught INTEGER,
    performance_rating INTEGER CHECK (
        performance_rating >= 1
        AND performance_rating <= 5
    ),
    wave_quality_rating INTEGER CHECK (
        wave_quality_rating >= 1
        AND wave_quality_rating <= 5
    ),
    wind_direction VARCHAR(10),
    wind_speed INTEGER,
    wave_height DECIMAL(4, 2),
    session_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create weather_conditions table
CREATE TABLE IF NOT EXISTS weather_conditions (
    id SERIAL PRIMARY KEY,
    surf_spot_id INTEGER REFERENCES surf_spots (id) ON DELETE CASCADE,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    temperature DECIMAL(5, 2),
    wind_speed INTEGER,
    wind_direction VARCHAR(10),
    wave_height DECIMAL(4, 2),
    wave_period INTEGER,
    tide_level VARCHAR(20),
    conditions_summary VARCHAR(255)
);

-- Insert default user for development/testing
INSERT INTO
    users (
        id,
        email,
        password_hash,
        first_name,
        last_name
    )
VALUES (
        1,
        'test@example.com',
        'hashed_password',
        'Test',
        'User'
    ) ON CONFLICT (id) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_surf_spots_user_id ON surf_spots (user_id);

CREATE INDEX IF NOT EXISTS idx_surf_spots_location ON surf_spots (latitude, longitude);

CREATE INDEX IF NOT EXISTS idx_surf_sessions_user_id ON surf_sessions (user_id);

CREATE INDEX IF NOT EXISTS idx_surf_sessions_spot_id ON surf_sessions (surf_spot_id);

CREATE INDEX IF NOT EXISTS idx_surf_sessions_date ON surf_sessions (session_date);

CREATE INDEX IF NOT EXISTS idx_weather_conditions_spot_id ON weather_conditions (surf_spot_id);

CREATE INDEX IF NOT EXISTS idx_weather_conditions_recorded_at ON weather_conditions (recorded_at);

-- Create triggers to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_surf_spots_updated_at BEFORE UPDATE ON surf_spots
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_surf_sessions_updated_at BEFORE UPDATE ON surf_sessions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data for testing (optional)
INSERT INTO
    surf_spots (
        user_id,
        name,
        latitude,
        longitude,
        break_type,
        skill_requirement,
        notes
    )
VALUES (
        1,
        'Malibu Point',
        34.0259,
        -118.7798,
        'Point Break',
        'Intermediate',
        'Classic California point break with consistent waves'
    ),
    (
        1,
        'Huntington Pier',
        33.6553,
        -117.9998,
        'Beach Break',
        'Beginner',
        'Great beach break for beginners and longboarders'
    ),
    (
        1,
        'Trestles',
        33.3894,
        -117.5547,
        'Point Break',
        'Advanced',
        'World-class waves, can get crowded'
    ) ON CONFLICT DO NOTHING;