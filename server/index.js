const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const db = require('./services/database');

const app = express();
const port = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000,
  message: 'Too many requests from this IP',
});
app.use(limiter);

// Compression middleware
app.use(compression());

// Enhanced CORS configuration for Railway deployment
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [
        process.env.FRONTEND_URL,
        /^https:\/\/.*\.up\.railway\.app$/,
        /^https:\/\/.*\.railway\.app$/
      ]
    : ['http://localhost:3000', 'http://localhost:19006'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
  });
  next();
});

// Health check endpoint with database status
app.get('/health', async (req, res) => {
  try {
    const dbHealth = await db.healthCheck();
    res.status(200).json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: dbHealth
    });
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: { status: 'unhealthy', error: error.message }
    });
  }
});

// API Routes

// Get all surf spots
app.get('/api/surf-spots', async (req, res) => {
  try {
    const result = await db.query(`
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
    
    const result = await db.query(`
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
    const result = await db.query(`
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
    const spotResult = await db.query('SELECT id FROM surf_spots WHERE name = $1', [surfSpot]);
    const surfSpotId = spotResult.rows[0]?.id;
    
    const result = await db.query(`
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
    const statsQuery = await db.query(`
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
    
    const recentSessionsQuery = await db.query(`
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

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🏥 Health check: http://localhost:${port}/health`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await db.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  await db.close();
  process.exit(0);
});
