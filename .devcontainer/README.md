# Development Container Setup

This project includes a complete development container configuration with PostgreSQL database support, matching your Railway cloud deployment.

## Features

- **Node.js 18** - Latest LTS version for React development
- **PostgreSQL 15** - Database server matching Railway setup
- **VS Code Extensions** - Pre-configured with React, TypeScript, and database tools
- **Port Forwarding** - React app (3000) and PostgreSQL (5432)
- **Database Tools** - PostgreSQL client and management tools

## Quick Start

1. **Open in Dev Container**
   - Install VS Code Dev Containers extension
   - Open project in VS Code
   - Click "Reopen in Container" notification
   - Or use Command Palette: `Dev Containers: Reopen in Container`

2. **Database Setup**
   ```bash
   # Initialize database with sample tables
   npm run db:init
   
   # Connect to database
   npm run db:connect
   ```

3. **Start Development Server**
   ```bash
   npm start
   ```

## Database Connection

### Development Environment
- **Host**: localhost
- **Port**: 5432
- **Username**: postgres
- **Password**: postgres
- **Database**: postgres

### Environment Variables
Development environment variables are loaded from `.env.development`:
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres
```

### Railway Production
Your Railway environment will use different connection details provided by Railway's PostgreSQL service.

## Available Scripts

- `npm start` - Start React development server
- `npm run build` - Build for production
- `npm run test` - Run tests
- `npm run db:init` - Initialize database with sample tables
- `npm run db:connect` - Connect to PostgreSQL database

## VS Code Extensions Included

- TypeScript support
- PostgreSQL management
- Docker support
- Git tools
- Prettier formatting
- ESLint
- Path IntelliSense
- Auto Rename Tag

## Database Schema

The development database includes sample tables:
- `users` - Sample user table with id, username, email, created_at

Customize the database schema by editing `.devcontainer/init-db.sh`.

## Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
pg_isready -h localhost -p 5432 -U postgres

# Restart database service
docker-compose -f .devcontainer/docker-compose.yml restart db
```

### Port Conflicts
If ports 3000 or 5432 are in use, update the port mappings in `.devcontainer/devcontainer.json`.

## Migration from Railway

When deploying to Railway, your application will automatically use Railway's PostgreSQL service. The connection string will be provided via the `DATABASE_URL` environment variable.
