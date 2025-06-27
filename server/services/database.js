const { Pool } = require('pg');

class DatabaseService {
  constructor() {
    this.pool = null;
    this.initializePool();
  }

  initializePool() {
    const config = this.getDatabaseConfig();
    
    this.pool = new Pool(config);
    
    this.pool.on('error', (err) => {
      console.error('Unexpected error on idle database client', err);
      process.exit(-1);
    });

    this.pool.on('connect', () => {
      console.log('New database client connected');
    });

    this.testConnection();
  }

  getDatabaseConfig() {
    if (process.env.DATABASE_URL) {
      return {
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        max: parseInt(process.env.DB_POOL_SIZE) || 20,
        idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT) || 30000,
        connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT) || 2000,
      };
    }

    return {
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT) || 5432,
      database: process.env.POSTGRES_DB || 'postgres',
      user: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'postgres',
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: parseInt(process.env.DB_POOL_SIZE) || 20,
      idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT) || 30000,
      connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT) || 2000,
    };
  }

  async testConnection() {
    try {
      const client = await this.pool.connect();
      const result = await client.query('SELECT NOW()');
      console.log('Database connected successfully at:', result.rows[0].now);
      client.release();
    } catch (error) {
      console.error('Database connection failed:', error.message);
      throw error;
    }
  }

  async query(text, params) {
    const start = Date.now();
    try {
      const result = await this.pool.query(text, params);
      const duration = Date.now() - start;
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Executed query', { text, duration, rows: result.rowCount });
      }
      
      return result;
    } catch (error) {
      console.error('Database query error:', error.message);
      throw error;
    }
  }

  async getClient() {
    return await this.pool.connect();
  }

  async close() {
    if (this.pool) {
      await this.pool.end();
      console.log('Database pool closed');
    }
  }

  async healthCheck() {
    try {
      const result = await this.query('SELECT 1 as health_check');
      return { status: 'healthy', timestamp: new Date().toISOString() };
    } catch (error) {
      return { status: 'unhealthy', error: error.message, timestamp: new Date().toISOString() };
    }
  }
}

module.exports = new DatabaseService();
