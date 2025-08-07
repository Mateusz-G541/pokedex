#!/bin/bash

# Pokedex Deployment Script for Mikrus VPS
# Usage: ./deploy.sh [production|staging]

set -e

ENVIRONMENT=${1:-production}
PROJECT_DIR="/var/www/pokedex"
BACKUP_DIR="/var/backups/pokedex"
LOG_FILE="/var/log/pokedex-deploy.log"

echo "🚀 Starting Pokedex deployment for $ENVIRONMENT environment..."

# Create log file
mkdir -p $(dirname $LOG_FILE)
exec > >(tee -a $LOG_FILE)
exec 2>&1

# Function to log with timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Function to handle errors
handle_error() {
    log "❌ Error occurred during deployment. Rolling back..."
    if [ -d "$BACKUP_DIR/latest" ]; then
        log "🔄 Restoring from backup..."
        cp -r $BACKUP_DIR/latest/* $PROJECT_DIR/
        docker-compose -f docker-compose.prod.yml up -d
    fi
    exit 1
}

trap handle_error ERR

log "📋 Pre-deployment checks..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    log "❌ Docker is not running. Starting Docker..."
    systemctl start docker
fi

# Check if required files exist
if [ ! -f ".env.production" ]; then
    log "❌ .env.production file not found. Please create it first."
    exit 1
fi

log "💾 Creating backup..."
mkdir -p $BACKUP_DIR
if [ -d "$PROJECT_DIR" ]; then
    cp -r $PROJECT_DIR $BACKUP_DIR/$(date +%Y%m%d_%H%M%S)
    cp -r $PROJECT_DIR $BACKUP_DIR/latest
fi

log "📥 Pulling latest changes..."
cd $PROJECT_DIR
git pull origin main

log "🔧 Installing dependencies..."
npm ci --only=production
cd frontend && npm ci && cd ..

log "🏗️ Building applications..."
npm run build
cd frontend && npm run build && cd ..

log "🐳 Building Docker images..."
docker-compose -f docker-compose.prod.yml build --no-cache

log "🛑 Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down

log "🚀 Starting new containers..."
docker-compose -f docker-compose.prod.yml up -d

log "⏳ Waiting for services to be ready..."
sleep 30

# Health checks
log "🏥 Performing health checks..."
for i in {1..10}; do
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        log "✅ Backend health check passed"
        break
    fi
    if [ $i -eq 10 ]; then
        log "❌ Backend health check failed"
        handle_error
    fi
    sleep 5
done

for i in {1..10}; do
    if curl -f http://localhost:3001/health > /dev/null 2>&1; then
        log "✅ Frontend health check passed"
        break
    fi
    if [ $i -eq 10 ]; then
        log "❌ Frontend health check failed"
        handle_error
    fi
    sleep 5
done

log "🧹 Cleaning up old Docker images..."
docker image prune -f

log "📊 Deployment summary:"
docker-compose -f docker-compose.prod.yml ps

log "✅ Deployment completed successfully!"
log "🌐 Application is available at: http://$(hostname -I | awk '{print $1}')"
log "📱 Frontend: http://$(hostname -I | awk '{print $1}'):3001"
log "🔧 Backend API: http://$(hostname -I | awk '{print $1}'):3000"

# Send notification (optional)
if command -v mail &> /dev/null; then
    echo "Pokedex deployment completed successfully on $(date)" | mail -s "Deployment Success" admin@yourdomain.com
fi
