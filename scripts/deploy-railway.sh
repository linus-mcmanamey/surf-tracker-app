#!/bin/bash

# Railway PostgreSQL Deployment Script for Surf Tracker
# This script helps set up the application for Railway deployment

set -e

echo "🚀 Starting Railway PostgreSQL deployment setup..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "⚠️  Railway CLI not found. Please install it first:"
    echo "   npm install -g @railway/cli"
    echo "   or visit: https://docs.railway.app/develop/cli"
    exit 1
fi

# Check if user is logged in to Railway
if ! railway whoami &> /dev/null; then
    echo "🔐 Please log in to Railway first:"
    echo "   railway login"
    exit 1
fi

# Create .env.production if it doesn't exist
if [ ! -f ".env.production" ]; then
    echo "📝 Creating .env.production template..."
    cat > .env.production << EOF
# Railway Production Environment Variables
NODE_ENV=production

# Database Configuration (Railway will inject these automatically)
# DATABASE_URL will be provided by Railway PostgreSQL service

# React App Configuration for Production
REACT_APP_API_URL=https://your-app-name.up.railway.app/api

# Additional Railway Configuration
RAILWAY_ENVIRONMENT=production
EOF
    echo "✅ Created .env.production template"
fi

# Initialize Railway project if not already done
if [ ! -f "railway.toml" ] && [ ! -f "railway.json" ]; then
    echo "🚂 Initializing Railway project..."
    railway init
fi

# Add PostgreSQL service
echo "🗄️  Adding PostgreSQL database service..."
railway add --database postgresql

# Set environment variables
echo "⚙️  Setting up environment variables..."
railway variables set NODE_ENV=production

# Deploy the application
echo "🚀 Deploying to Railway..."
railway up

# Get the deployment URL
RAILWAY_URL=$(railway status --json | jq -r '.deployments[0].url // empty')

if [ -n "$RAILWAY_URL" ]; then
    echo "✅ Deployment successful!"
    echo "🌐 Your application is available at: $RAILWAY_URL"
    echo "🩺 Health check: $RAILWAY_URL/health"
    
    # Update .env.production with the actual URL
    sed -i.bak "s|https://your-app-name.up.railway.app|$RAILWAY_URL|g" .env.production
    echo "📝 Updated .env.production with deployment URL"
else
    echo "⚠️  Could not determine deployment URL. Check Railway dashboard."
fi

echo "📋 Next steps:"
echo "1. Visit Railway dashboard to get your PostgreSQL connection details"
echo "2. Run the database initialization script on your PostgreSQL instance"
echo "3. Test your API endpoints at $RAILWAY_URL/health"
echo "4. Update your frontend REACT_APP_API_URL to point to your Railway deployment"

echo "🎉 Railway deployment setup complete!"
