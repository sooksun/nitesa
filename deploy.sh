#!/bin/bash

# Deploy script for Nitesa Application
# Usage: ./deploy.sh

set -e

echo "🚀 Starting deployment..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create .env file from .env.example"
    exit 1
fi

# Create uploads directories
echo "📁 Creating uploads directories..."
mkdir -p uploads public/uploads
chmod -R 755 uploads public/uploads

# Build Docker images
echo "🔨 Building Docker images..."
docker compose build --no-cache

# Start containers
echo "🐳 Starting containers..."
docker compose up -d

# Wait for MySQL to be ready
echo "⏳ Waiting for MySQL to be ready..."
sleep 10

# Run migrations
echo "📊 Running database migrations..."
docker compose exec -T app npx prisma generate
docker compose exec -T app npx prisma migrate deploy

# Check status
echo "✅ Checking container status..."
docker compose ps

echo "🎉 Deployment completed!"
echo "📝 Check logs with: docker compose logs -f app"
echo "🌐 Application should be available at: http://203.172.184.47:3000"
