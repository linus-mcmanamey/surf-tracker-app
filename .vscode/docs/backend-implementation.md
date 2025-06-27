# Express.js Backend Implementation Guide

## Project Setup

### Initialize Backend Project
```bash
mkdir surf-tracker-backend
cd surf-tracker-backend
npm init -y
```

### Install Dependencies
```bash
npm install express cors helmet morgan dotenv bcryptjs jsonwebtoken
npm install pg @types/node typescript ts-node nodemon
npm install express-rate-limit express-validator
npm install axios date-fns uuid
npm install --save-dev @types/express @types/cors @types/bcryptjs @types/jsonwebtoken
```

### Project Structure
```
surf-tracker-backend/
├── src/
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── userController.ts
│   │   ├── spotController.ts
│   │   ├── sessionController.ts
│   │   ├── weatherController.ts
│   │   └── predictionController.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── validation.ts
│   │   └── errorHandler.ts
│   ├── models/
│   │   ├── User.ts
│   │   ├── SurfSpot.ts
│   │   ├── Session.ts
│   │   └── Prediction.ts
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── users.ts
│   │   ├── spots.ts
│   │   ├── sessions.ts
│   │   ├── weather.ts
│   │   └── predictions.ts
│   ├── services/
│   │   ├── database.ts
│   │   ├── weatherService.ts
│   │   └── aiService.ts
│   ├── utils/
│   │   ├── helpers.ts
│   │   └── constants.ts
│   └── app.ts
├── package.json
├── tsconfig.json
├── .env
└── README.md
```

## Core Implementation Files

### Database Connection Service
```typescript
// src/services/database.ts
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.RAILWAY_DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

export const getClient = async () => {
  const client = await pool.connect();
  return client;
};

export default { query, getClient };
```

### Main Application Setup
```typescript
// src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import spotRoutes from './routes/spots';
import sessionRoutes from './routes/sessions';
import weatherRoutes from './routes/weather';
import predictionRoutes from './routes/predictions';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP'
});
app.use('/api/', limiter);

// Logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      version: process.env.npm_package_version || '1.0.0'
    }
  });
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/surf-spots', spotRoutes);
app.use('/api/v1/sessions', sessionRoutes);
app.use('/api/v1/weather', weatherRoutes);
app.use('/api/v1/predictions', predictionRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found'
    }
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
```

### Authentication Middleware
```typescript
// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { query } from '../services/database';

interface AuthRequest extends Request {
  user?: {
    id: number;
    uuid: string;
    username: string;
    email: string;
  };
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Access token required'
      }
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Verify user still exists
    const result = await query(
      'SELECT id, uuid, username, email, is_active FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0 || !result.rows[0].is_active) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid token'
        }
      });
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid token'
      }
    });
  }
};
```

### User Model
```typescript
// src/models/User.ts
import { query } from '../services/database';
import bcrypt from 'bcryptjs';

export interface User {
  id?: number;
  uuid?: string;
  username: string;
  email: string;
  passwordHash?: string;
  firstName?: string;
  lastName?: string;
  skillLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  preferredUnits?: 'imperial' | 'metric';
  homeLocationLat?: number;
  homeLocationLng?: number;
  timezone?: string;
  profileImageUrl?: string;
  bio?: string;
  yearsSurfing?: number;
  favoriteBoardType?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class UserModel {
  static async create(userData: Omit<User, 'id' | 'uuid' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.passwordHash!, 10);
    
    const result = await query(`
      INSERT INTO users (username, email, password_hash, first_name, last_name, skill_level, preferred_units)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, uuid, username, email, first_name, last_name, skill_level, preferred_units, created_at
    `, [
      userData.username,
      userData.email,
      hashedPassword,
      userData.firstName,
      userData.lastName,
      userData.skillLevel || 'beginner',
      userData.preferredUnits || 'imperial'
    ]);

    return result.rows[0];
  }

  static async findByEmail(email: string): Promise<User | null> {
    const result = await query(
      'SELECT * FROM users WHERE email = $1 AND is_active = true',
      [email]
    );
    return result.rows[0] || null;
  }

  static async findById(id: number): Promise<User | null> {
    const result = await query(
      'SELECT * FROM users WHERE id = $1 AND is_active = true',
      [id]
    );
    return result.rows[0] || null;
  }

  static async update(id: number, updates: Partial<User>): Promise<User> {
    const setClause = Object.keys(updates)
      .map((key, index) => `${this.camelToSnake(key)} = $${index + 2}`)
      .join(', ');
    
    const values = [id, ...Object.values(updates)];
    
    const result = await query(`
      UPDATE users SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, values);

    return result.rows[0];
  }

  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  private static camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }
}
```

### Surf Spot Model
```typescript
// src/models/SurfSpot.ts
import { query } from '../services/database';

export interface SurfSpot {
  id?: number;
  uuid?: string;
  userId: number;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  breakType: 'beach' | 'point' | 'reef' | 'river_mouth' | 'jetty' | 'shore' | 'sandbar';
  skillRequirement?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  tidalPreferences?: string[];
  optimalWindDirections?: string[];
  optimalSwellDirections?: string[];
  minWaveSize?: number;
  maxWaveSize?: number;
  seasonalPreferences?: string[];
  crowdLevel?: string;
  notes?: string;
  hazards?: string;
  totalSessions?: number;
  averageRating?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class SurfSpotModel {
  static async create(spotData: Omit<SurfSpot, 'id' | 'uuid' | 'createdAt' | 'updatedAt'>): Promise<SurfSpot> {
    const result = await query(`
      INSERT INTO surf_spots (
        user_id, name, description, latitude, longitude, break_type,
        skill_requirement, tidal_preferences, optimal_wind_directions,
        optimal_swell_directions, min_wave_size, max_wave_size,
        seasonal_preferences, crowd_level, notes, hazards
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *
    `, [
      spotData.userId,
      spotData.name,
      spotData.description,
      spotData.latitude,
      spotData.longitude,
      spotData.breakType,
      spotData.skillRequirement || 'beginner',
      spotData.tidalPreferences || [],
      spotData.optimalWindDirections || [],
      spotData.optimalSwellDirections || [],
      spotData.minWaveSize || 1,
      spotData.maxWaveSize || 15,
      spotData.seasonalPreferences || [],
      spotData.crowdLevel || 'moderate',
      spotData.notes,
      spotData.hazards
    ]);

    return result.rows[0];
  }

  static async findByUser(userId: number, limit: number = 20, offset: number = 0): Promise<SurfSpot[]> {
    const result = await query(`
      SELECT * FROM surf_spots 
      WHERE user_id = $1 AND is_active = true
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `, [userId, limit, offset]);

    return result.rows;
  }

  static async findNearby(lat: number, lng: number, radius: number = 0.1, limit: number = 10): Promise<SurfSpot[]> {
    const result = await query(`
      SELECT *, 
        ST_Distance(geom, ST_SetSRID(ST_MakePoint($2, $1), 4326)) as distance
      FROM surf_spots 
      WHERE is_active = true
        AND ST_DWithin(geom, ST_SetSRID(ST_MakePoint($2, $1), 4326), $3)
      ORDER BY distance
      LIMIT $4
    `, [lat, lng, radius, limit]);

    return result.rows;
  }

  static async findById(id: number, userId: number): Promise<SurfSpot | null> {
    const result = await query(
      'SELECT * FROM surf_spots WHERE id = $1 AND user_id = $2 AND is_active = true',
      [id, userId]
    );
    return result.rows[0] || null;
  }

  static async update(id: number, userId: number, updates: Partial<SurfSpot>): Promise<SurfSpot> {
    const setClause = Object.keys(updates)
      .map((key, index) => `${this.camelToSnake(key)} = $${index + 3}`)
      .join(', ');
    
    const values = [id, userId, ...Object.values(updates)];
    
    const result = await query(`
      UPDATE surf_spots SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `, values);

    return result.rows[0];
  }

  static async delete(id: number, userId: number): Promise<boolean> {
    const result = await query(
      'UPDATE surf_spots SET is_active = false WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return result.rowCount > 0;
  }

  private static camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }
}
```

### Authentication Controller
```typescript
// src/controllers/authController.ts
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { username, email, password, firstName, lastName, skillLevel } = req.body;

      // Check if user exists
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'CONFLICT',
            message: 'User already exists with this email'
          }
        });
      }

      // Create user
      const user = await UserModel.create({
        username,
        email,
        passwordHash: password,
        firstName,
        lastName,
        skillLevel
      });

      // Generate token
      const token = jwt.sign(
        { userId: user.id, uuid: user.uuid },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      // Remove password from response
      const { passwordHash, ...userResponse } = user;

      res.status(201).json({
        success: true,
        data: {
          user: userResponse,
          token
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Registration failed'
        }
      });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Invalid credentials'
          }
        });
      }

      // Verify password
      const isValidPassword = await UserModel.verifyPassword(password, user.passwordHash!);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Invalid credentials'
          }
        });
      }

      // Generate token
      const token = jwt.sign(
        { userId: user.id, uuid: user.uuid },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      // Remove password from response
      const { passwordHash, ...userResponse } = user;

      res.json({
        success: true,
        data: {
          user: userResponse,
          token
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Login failed'
        }
      });
    }
  }

  static async refresh(req: Request, res: Response) {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];

      if (!token) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Token required'
          }
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      
      // Generate new token
      const newToken = jwt.sign(
        { userId: decoded.userId, uuid: decoded.uuid },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        data: {
          token: newToken
        }
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid token'
        }
      });
    }
  }
}
```

### Environment Configuration
```env
# .env
NODE_ENV=production
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-here
RAILWAY_DATABASE_URL=postgresql://username:password@host:port/database

# External APIs
CLAUDE_API_KEY=your-claude-api-key
WEATHER_API_KEY=your-weather-api-key
TIDE_API_KEY=your-tide-api-key

# Frontend
FRONTEND_URL=http://localhost:3000
```

### TypeScript Configuration
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Package.json Scripts
```json
{
  "scripts": {
    "start": "node dist/app.js",
    "dev": "nodemon src/app.ts",
    "build": "tsc",
    "test": "jest",
    "migrate": "node scripts/migrate.js"
  }
}
```

This implementation provides a robust Express.js backend that integrates seamlessly with your Railway PostgreSQL database and supports all the features outlined in the API specification.
