# Production Deployment on Railway

## Overview

This guide covers deploying your Express.js backend API to Railway for production use with your iOS/React Native mobile applications.

## Railway Project Setup

### 1. Connect GitHub Repository

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Connect your repository
5. Railway will automatically detect the Node.js project

### 2. Configure Environment Variables

In the Railway dashboard, add these environment variables:

```env
NODE_ENV=production
PORT=8080
DATABASE_URL=postgresql://postgres:KfKJihNvAyFSfxAXTehfNXAJDRaWKUOX@crossover.proxy.rlwy.net:43578/railway
```

### 3. Update Backend for Production

#### server/index.js Updates

```javascript
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 8080;

// Enhanced CORS configuration for production
const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? ["https://yourdomain.com", "https://www.yourdomain.com"]
      : ["http://localhost:3000", "http://localhost:19006"], // Include Expo dev server
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// API versioning
app.use("/api/v1", require("./routes/api"));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Something went wrong!",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
});
```

#### Create API Routes Module

**server/routes/api.js**

```javascript
const express = require("express");
const { Pool } = require("pg");
const router = express.Router();

// Database connection with connection pooling
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Middleware for database connection testing
router.use(async (req, res, next) => {
  try {
    await pool.query("SELECT 1");
    next();
  } catch (error) {
    console.error("Database connection error:", error);
    res.status(503).json({ error: "Database unavailable" });
  }
});

// Surf Spots endpoints
router.get("/surf-spots", async (req, res) => {
  try {
    const { limit = 50, offset = 0, search } = req.query;

    let query = `
      SELECT id, name, latitude, longitude, break_type, skill_requirement, 
             notes, total_sessions, average_rating, created_at
      FROM surf_spots 
      WHERE is_active = true
    `;

    const params = [];

    if (search) {
      query += ` AND (name ILIKE $1 OR notes ILIKE $1)`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY id LIMIT $${params.length + 1} OFFSET $${
      params.length + 2
    }`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json({
      data: result.rows,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: result.rowCount,
      },
    });
  } catch (err) {
    console.error("Error fetching surf spots:", err);
    res.status(500).json({ error: "Failed to fetch surf spots" });
  }
});

router.post("/surf-spots", async (req, res) => {
  try {
    const {
      name,
      latitude,
      longitude,
      breakType,
      skillRequirement,
      description,
    } = req.body;

    // Validation
    if (!name || !latitude || !longitude) {
      return res
        .status(400)
        .json({ error: "Name, latitude, and longitude are required" });
    }

    if (
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return res.status(400).json({ error: "Invalid coordinates" });
    }

    const result = await pool.query(
      `INSERT INTO surf_spots (name, latitude, longitude, break_type, skill_requirement, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, latitude, longitude, breakType, skillRequirement, description]
    );

    res.status(201).json({ data: result.rows[0] });
  } catch (err) {
    console.error("Error creating surf spot:", err);
    res.status(500).json({ error: "Failed to create surf spot" });
  }
});

// Sessions endpoints
router.get("/sessions", async (req, res) => {
  try {
    const { limit = 50, offset = 0, spot_id } = req.query;

    let query = `
      SELECT s.*, ss.name as spot_name 
      FROM surf_sessions s
      JOIN surf_spots ss ON s.surf_spot_id = ss.id
      WHERE 1=1
    `;

    const params = [];

    if (spot_id) {
      query += ` AND s.surf_spot_id = $1`;
      params.push(spot_id);
    }

    query += ` ORDER BY s.session_date DESC LIMIT $${
      params.length + 1
    } OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    res.json({ data: result.rows });
  } catch (err) {
    console.error("Error fetching sessions:", err);
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
});

router.post("/sessions", async (req, res) => {
  try {
    const {
      surf_spot_id,
      session_date,
      duration_minutes,
      wave_height,
      wave_quality,
      notes,
    } = req.body;

    if (!surf_spot_id || !session_date) {
      return res
        .status(400)
        .json({ error: "Surf spot ID and session date are required" });
    }

    const result = await pool.query(
      `INSERT INTO surf_sessions (surf_spot_id, session_date, duration_minutes, wave_height, wave_quality, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        surf_spot_id,
        session_date,
        duration_minutes,
        wave_height,
        wave_quality,
        notes,
      ]
    );

    res.status(201).json({ data: result.rows[0] });
  } catch (err) {
    console.error("Error creating session:", err);
    res.status(500).json({ error: "Failed to create session" });
  }
});

// Dashboard stats
router.get("/dashboard/stats", async (req, res) => {
  try {
    const stats = await Promise.all([
      pool.query(
        "SELECT COUNT(*) as total_spots FROM surf_spots WHERE is_active = true"
      ),
      pool.query("SELECT COUNT(*) as total_sessions FROM surf_sessions"),
      pool.query(
        "SELECT AVG(duration_minutes) as avg_session_duration FROM surf_sessions WHERE duration_minutes IS NOT NULL"
      ),
      pool.query(`
        SELECT ss.name, COUNT(s.id) as session_count 
        FROM surf_spots ss 
        LEFT JOIN surf_sessions s ON ss.id = s.surf_spot_id 
        WHERE ss.is_active = true 
        GROUP BY ss.id, ss.name 
        ORDER BY session_count DESC 
        LIMIT 5
      `),
    ]);

    res.json({
      totalSpots: parseInt(stats[0].rows[0].total_spots),
      totalSessions: parseInt(stats[1].rows[0].total_sessions),
      avgSessionDuration: stats[2].rows[0].avg_session_duration
        ? Math.round(parseFloat(stats[2].rows[0].avg_session_duration))
        : 0,
      topSpots: stats[3].rows,
    });
  } catch (err) {
    console.error("Error fetching dashboard stats:", err);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
});

module.exports = router;
```

#### Update package.json for Production

```json
{
  "name": "surf-tracker-api",
  "version": "1.0.0",
  "description": "Surf Tracker API Backend",
  "main": "server/index.js",
  "scripts": {
    "start": "node server/index.js",
    "dev": "nodemon server/index.js",
    "test": "jest",
    "lint": "eslint server/",
    "build": "echo 'No build step required'"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=8.0.0"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "pg": "^8.11.3",
    "helmet": "^7.0.0",
    "express-rate-limit": "^6.8.1",
    "compression": "^1.7.4"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "jest": "^29.6.2",
    "eslint": "^8.45.0"
  }
}
```

### 4. Add Security and Performance Middleware

```javascript
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const compression = require("compression");

// Security middleware
app.use(helmet());

// Compression middleware
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});

app.use("/api/", limiter);

// Strict rate limiting for POST requests
const strictLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // limit each IP to 20 POST requests per 5 minutes
  skip: (req) => req.method !== "POST",
});

app.use("/api/", strictLimiter);
```

## Railway Configuration Files

### railway.toml

```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "npm start"
healthcheckPath = "/health"
healthcheckTimeout = 300
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 3

[env]
NODE_ENV = "production"
PORT = "8080"
```

### nixpacks.toml

```toml
[phases.setup]
nixPkgs = ["nodejs-18_x", "npm-9_x"]

[phases.install]
cmds = ["npm ci --only=production"]

[phases.build]
cmds = ["npm run build"]

[start]
cmd = "npm start"
```

## Database Migration Strategy

### Create Migration Scripts

**migrations/001_initial_schema.sql**

```sql
-- This file contains your database schema
-- Run with: psql $DATABASE_URL -f migrations/001_initial_schema.sql

CREATE TABLE IF NOT EXISTS surf_spots (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    break_type VARCHAR(50),
    skill_requirement VARCHAR(50),
    notes TEXT,
    total_sessions INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS surf_sessions (
    id SERIAL PRIMARY KEY,
    surf_spot_id INTEGER REFERENCES surf_spots(id),
    session_date TIMESTAMP NOT NULL,
    duration_minutes INTEGER,
    wave_height DECIMAL(4,2),
    wave_quality INTEGER CHECK (wave_quality >= 1 AND wave_quality <= 10),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_surf_spots_location ON surf_spots(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_surf_sessions_spot_date ON surf_sessions(surf_spot_id, session_date);
CREATE INDEX IF NOT EXISTS idx_surf_spots_active ON surf_spots(is_active) WHERE is_active = true;
```

### Update Makefile for Production

```makefile
# Add to your existing Makefile

# Production database commands
.PHONY: db-migrate-prod
db-migrate-prod:
	@echo "Running production database migrations..."
	psql $(DATABASE_URL) -f migrations/001_initial_schema.sql

.PHONY: db-backup-prod
db-backup-prod:
	@echo "Creating production database backup..."
	pg_dump $(DATABASE_URL) > backups/prod_backup_$(shell date +%Y%m%d_%H%M%S).sql

.PHONY: db-restore-prod
db-restore-prod:
	@echo "Restoring production database from backup..."
	@read -p "Enter backup file path: " backup_file; \
	psql $(DATABASE_URL) -f $$backup_file

# Production deployment
.PHONY: deploy-check
deploy-check:
	@echo "Running pre-deployment checks..."
	npm run lint
	npm test
	@echo "✅ All checks passed"

.PHONY: deploy-prod
deploy-prod: deploy-check
	@echo "Deploying to Railway..."
	railway up
```

## Monitoring and Logging

### Add Structured Logging

**server/utils/logger.js**

```javascript
const logger = {
  info: (message, meta = {}) => {
    console.log(
      JSON.stringify({
        level: "info",
        message,
        timestamp: new Date().toISOString(),
        ...meta,
      })
    );
  },

  error: (message, error = null, meta = {}) => {
    console.error(
      JSON.stringify({
        level: "error",
        message,
        error: error ? error.message : null,
        stack: error ? error.stack : null,
        timestamp: new Date().toISOString(),
        ...meta,
      })
    );
  },

  warn: (message, meta = {}) => {
    console.warn(
      JSON.stringify({
        level: "warn",
        message,
        timestamp: new Date().toISOString(),
        ...meta,
      })
    );
  },
};

module.exports = logger;
```

### Request Logging Middleware

```javascript
const logger = require("./utils/logger");

app.use((req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info("HTTP Request", {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get("User-Agent"),
      ip: req.ip,
    });
  });

  next();
});
```

## Performance Optimization

### Database Connection Pooling

```javascript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
  max: 20, // Maximum number of connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  statement_timeout: 30000,
  query_timeout: 30000,
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down gracefully...");
  await pool.end();
  process.exit(0);
});
```

### Caching Headers

```javascript
// Add caching headers for static data
app.get("/api/v1/surf-spots", (req, res, next) => {
  res.set("Cache-Control", "public, max-age=300"); // 5 minutes
  next();
});
```

## API Documentation

### Add Swagger/OpenAPI Documentation

**server/docs/swagger.js**

```javascript
const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Surf Tracker API",
      version: "1.0.0",
      description: "API for surf tracking application",
    },
    servers: [
      {
        url:
          process.env.NODE_ENV === "production"
            ? "https://your-app.railway.app/api/v1"
            : "http://localhost:8080/api/v1",
      },
    ],
  },
  apis: ["./server/routes/*.js"], // paths to files containing OpenAPI definitions
};

module.exports = swaggerJsdoc(options);
```

## Deployment Checklist

### Pre-deployment

- [ ] Environment variables configured in Railway
- [ ] Database migrations tested
- [ ] SSL certificates working
- [ ] Rate limiting configured
- [ ] Logging implemented
- [ ] Error handling in place
- [ ] API documentation updated

### Post-deployment

- [ ] Health check endpoint responding
- [ ] All API endpoints working
- [ ] Database connections stable
- [ ] Mobile app connecting successfully
- [ ] Monitoring alerts configured
- [ ] Backup strategy implemented

## Production URL

Once deployed, your API will be available at:
`https://your-app-name.up.railway.app`

Update your mobile app configuration to use this production URL:

```javascript
// In your mobile app config
const API_BASE_URL = __DEV__
  ? "http://localhost:8080"
  : "https://your-app-name.up.railway.app";
```

This production deployment setup ensures your surf tracking API is scalable, secure, and ready for mobile app integration with proper monitoring and error handling.
