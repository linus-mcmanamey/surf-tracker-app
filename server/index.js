const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Get database URL from Railway environment
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error acquiring client', err.stack);
  } else {
    console.log('Connected to PostgreSQL database');
    release();
  }
});

// API Routes

// Get all surf spots
app.get('/api/surf-spots', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, latitude, longitude, break_type, skill_requirement, 
             notes, total_sessions, average_rating, created_at
      FROM surf_spots 
      WHERE is_active = true 
      ORDER BY id
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching surf spots:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new surf spot
app.post('/api/surf-spots', async (req, res) => {
  try {
    const { name, latitude, longitude, breakType, skillRequirement, description } = req.body;
    
    const result = await pool.query(`
      INSERT INTO surf_spots (user_id, name, latitude, longitude, break_type, skill_requirement, notes)
      VALUES (1, $1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [name, latitude, longitude, breakType, skillRequirement, description]);
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating surf spot:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all surf sessions
app.get('/api/surf-sessions', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.*, sp.name as spot_name
      FROM surf_sessions s
      LEFT JOIN surf_spots sp ON s.surf_spot_id = sp.id
      ORDER BY s.session_date DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching surf sessions:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new surf session
app.post('/api/surf-sessions', async (req, res) => {
  try {
    const { 
      surfSpot, date, duration, waveCount, rating, conditionsRating, notes 
    } = req.body;
    
    // Find surf spot ID by name
    const spotResult = await pool.query('SELECT id FROM surf_spots WHERE name = $1', [surfSpot]);
    const surfSpotId = spotResult.rows[0]?.id;
    
    const result = await pool.query(`
      INSERT INTO surf_sessions (
        user_id, surf_spot_id, session_date, duration_minutes, 
        waves_caught, performance_rating, wave_quality_rating, session_notes
      )
      VALUES (1, $1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [surfSpotId, date, duration, waveCount, rating, conditionsRating, notes]);
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating surf session:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get dashboard statistics
app.get('/api/dashboard', async (req, res) => {
  try {
    const statsQuery = await pool.query(`
      SELECT 
        COUNT(*) as total_sessions,
        AVG(performance_rating) as avg_rating,
        (SELECT name FROM surf_spots sp 
         JOIN surf_sessions ss ON sp.id = ss.surf_spot_id 
         GROUP BY sp.name 
         ORDER BY COUNT(*) DESC 
         LIMIT 1) as favorite_spot
      FROM surf_sessions
      WHERE user_id = 1
    `);
    
    const recentSessionsQuery = await pool.query(`
      SELECT ss.*, sp.name as spot_name
      FROM surf_sessions ss
      LEFT JOIN surf_spots sp ON ss.surf_spot_id = sp.id
      WHERE ss.user_id = 1
      ORDER BY ss.session_date DESC
      LIMIT 3
    `);
    
    const stats = statsQuery.rows[0];
    const recentSessions = recentSessionsQuery.rows;
    
    res.json({
      totalSessions: parseInt(stats.total_sessions) || 0,
      avgRating: parseFloat(stats.avg_rating) || 0,
      favoriteSpot: stats.favorite_spot || 'No sessions yet',
      recentSessions: recentSessions.map(session => ({
        id: session.id,
        spot: session.spot_name,
        date: session.session_date,
        rating: session.performance_rating
      }))
    });
  } catch (err) {
    console.error('Error fetching dashboard data:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
