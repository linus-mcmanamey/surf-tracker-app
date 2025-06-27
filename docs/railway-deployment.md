# Railway Deployment Guide

## Railway Platform Setup

### Prerequisites
- Railway account (railway.app)
- GitHub repository with backend implementation
- PostgreSQL database provisioned on Railway

### Database Configuration

#### 1. Create PostgreSQL Service
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Create new project
railway new

# Add PostgreSQL service
railway add postgresql
```

#### 2. Database Migration
```sql
-- Run the database schema from docs/database-schema.sql
-- Connect to Railway PostgreSQL and execute all tables and triggers
```

#### 3. Environment Variables Setup
```bash
# Set via Railway Dashboard or CLI
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=your-super-secret-jwt-key
railway variables set CLAUDE_API_KEY=your-claude-api-key
railway variables set WEATHER_API_KEY=your-weather-api-key
railway variables set TIDE_API_KEY=your-tide-api-key
railway variables set FRONTEND_URL=https://your-frontend-domain.com
```

### Backend Deployment

#### 1. Repository Setup
```bash
# Initialize git repository
git init
git add .
git commit -m "Initial backend implementation"

# Connect to GitHub
git remote add origin https://github.com/username/surf-tracker-backend.git
git push -u origin main
```

#### 2. Railway Deployment Configuration
```toml
# railway.toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "npm start"
healthcheckPath = "/health"
healthcheckTimeout = 100
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10

[[services]]
name = "surf-tracker-api"

[services.env]
NODE_ENV = "production"
PORT = "3000"
```

#### 3. Package.json Configuration
```json
{
  "name": "surf-tracker-backend",
  "version": "1.0.0",
  "scripts": {
    "start": "node dist/app.js",
    "build": "tsc",
    "dev": "nodemon src/app.ts",
    "migrate": "node scripts/migrate.js",
    "postinstall": "npm run build"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=8.0.0"
  }
}
```

### Database Migration Script
```javascript
// scripts/migrate.js
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  const client = new Client({
    connectionString: process.env.RAILWAY_DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL database');

    // Read and execute schema file
    const schemaPath = path.join(__dirname, '../docs/database-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    await client.query(schema);
    console.log('Database migration completed successfully');

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
```

### Continuous Deployment

#### 1. GitHub Actions Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy to Railway

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build application
      run: npm run build
    
    - name: Run tests
      run: npm test
    
    - name: Deploy to Railway
      uses: railway/railway-action@v1
      with:
        railway-token: ${{ secrets.RAILWAY_TOKEN }}
        service: surf-tracker-api
```

#### 2. Environment Secrets
Configure in GitHub repository settings:
- `RAILWAY_TOKEN`: Railway deployment token
- `RAILWAY_DATABASE_URL`: PostgreSQL connection string

### Production Optimizations

#### 1. Database Connection Pooling
```typescript
// src/config/database.ts
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.RAILWAY_DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 20, // Maximum number of connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  statement_timeout: 10000,
  query_timeout: 10000,
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await pool.end();
  process.exit(0);
});

export default pool;
```

#### 2. Error Monitoring
```typescript
// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';

export const errorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(error.status || 500).json({
    success: false,
    error: {
      code: error.code || 'INTERNAL_ERROR',
      message: isDevelopment ? error.message : 'Internal server error',
      ...(isDevelopment && { stack: error.stack })
    }
  });
};
```

#### 3. Health Check Implementation
```typescript
// src/routes/health.ts
import { Router } from 'express';
import { query } from '../services/database';

const router = Router();

router.get('/', async (req, res) => {
  try {
    // Test database connection
    await query('SELECT 1');
    
    res.json({
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: 'connected',
        version: process.env.npm_package_version || '1.0.0',
        uptime: process.uptime(),
        memory: process.memoryUsage()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: error.message
      }
    });
  }
});

export default router;
```

### Monitoring and Logging

#### 1. Request Logging
```typescript
// src/middleware/logging.ts
import morgan from 'morgan';

// Custom log format
const logFormat = ':method :url :status :res[content-length] - :response-time ms :user-agent';

export const requestLogger = morgan(logFormat, {
  skip: (req, res) => req.url === '/health'
});
```

#### 2. Performance Monitoring
```typescript
// src/middleware/performance.ts
import { Request, Response, NextFunction } from 'express';

export const performanceMonitor = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    // Log slow requests
    if (duration > 1000) {
      console.warn('Slow request:', {
        method: req.method,
        url: req.url,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      });
    }
  });
  
  next();
};
```

### Security Configuration

#### 1. Rate Limiting
```typescript
// src/middleware/rateLimiting.ts
import rateLimit from 'express-rate-limit';

export const generalLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000, // 1000 requests per hour
  message: {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many requests'
    }
  }
});

export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 login attempts per hour
  skipSuccessfulRequests: true
});

export const predictionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // 100 predictions per hour
  message: {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Prediction limit exceeded'
    }
  }
});
```

#### 2. Input Validation
```typescript
// src/middleware/validation.ts
import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const validateRegistration = [
  body('username').isLength({ min: 3, max: 50 }).trim(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('skillLevel').optional().isIn(['beginner', 'intermediate', 'advanced', 'expert']),
  handleValidationErrors
];

export const validateSurfSpot = [
  body('name').isLength({ min: 1, max: 100 }).trim(),
  body('latitude').isFloat({ min: -90, max: 90 }),
  body('longitude').isFloat({ min: -180, max: 180 }),
  body('breakType').isIn(['beach', 'point', 'reef', 'river_mouth', 'jetty', 'shore', 'sandbar']),
  handleValidationErrors
];

function handleValidationErrors(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input data',
        details: errors.array()
      }
    });
  }
  next();
}
```

This deployment guide ensures your surf tracker backend runs reliably on Railway with proper monitoring, security, and performance optimizations.
