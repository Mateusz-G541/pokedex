#!/bin/bash

# Pokedex Monitoring Script
# Usage: ./monitor.sh [status|logs|restart|update]

COMMAND=${1:-status}
PROJECT_DIR="/var/www/pokedex"
LOG_FILE="/var/log/pokedex-monitor.log"

# Function to log with timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a $LOG_FILE
}

case $COMMAND in
    "status")
        log "📊 Checking Pokedex application status..."
        echo "=== Docker Containers ==="
        docker-compose -f $PROJECT_DIR/docker-compose.prod.yml ps
        
        echo -e "\n=== Health Checks ==="
        echo -n "Backend: "
        if curl -f http://localhost:3000/health > /dev/null 2>&1; then
            echo "✅ Healthy"
        else
            echo "❌ Unhealthy"
        fi
        
        echo -n "Frontend: "
        if curl -f http://localhost:3001/health > /dev/null 2>&1; then
            echo "✅ Healthy"
        else
            echo "❌ Unhealthy"
        fi
        
        echo -n "Pokemon API: "
        if curl -f http://localhost:20275/health > /dev/null 2>&1; then
            echo "✅ Healthy"
        else
            echo "❌ Unhealthy"
        fi
        
        echo -e "\n=== System Resources ==="
        echo "CPU Usage: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | awk -F'%' '{print $1}')%"
        echo "Memory Usage: $(free | grep Mem | awk '{printf("%.1f%%", $3/$2 * 100.0)}')"
        echo "Disk Usage: $(df -h / | awk 'NR==2{printf "%s", $5}')"
        ;;
        
    "logs")
        SERVICE=${2:-all}
        LINES=${3:-50}
        
        log "📋 Showing logs for $SERVICE (last $LINES lines)..."
        
        if [ "$SERVICE" = "all" ]; then
            docker-compose -f $PROJECT_DIR/docker-compose.prod.yml logs --tail=$LINES
        else
            docker-compose -f $PROJECT_DIR/docker-compose.prod.yml logs --tail=$LINES $SERVICE
        fi
        ;;
        
    "restart")
        SERVICE=${2:-all}
        log "🔄 Restarting $SERVICE..."
        
        cd $PROJECT_DIR
        if [ "$SERVICE" = "all" ]; then
            docker-compose -f docker-compose.prod.yml restart
        else
            docker-compose -f docker-compose.prod.yml restart $SERVICE
        fi
        
        log "✅ Restart completed"
        ;;
        
    "update")
        log "🔄 Updating Pokedex application..."
        cd $PROJECT_DIR
        ./deploy.sh production
        ;;
        
    "backup")
        BACKUP_DIR="/var/backups/pokedex/manual"
        mkdir -p $BACKUP_DIR
        BACKUP_NAME="pokedex_backup_$(date +%Y%m%d_%H%M%S).tar.gz"
        
        log "💾 Creating manual backup: $BACKUP_NAME"
        tar -czf $BACKUP_DIR/$BACKUP_NAME -C /var/www pokedex
        
        # Keep only last 5 manual backups
        cd $BACKUP_DIR
        ls -t *.tar.gz | tail -n +6 | xargs -r rm
        
        log "✅ Backup created: $BACKUP_DIR/$BACKUP_NAME"
        ;;
        
    *)
        echo "Usage: $0 [status|logs|restart|update|backup]"
        echo ""
        echo "Commands:"
        echo "  status          - Show application status and health"
        echo "  logs [service]  - Show logs (default: all services)"
        echo "  restart [service] - Restart service (default: all)"
        echo "  update          - Update and redeploy application"
        echo "  backup          - Create manual backup"
        echo ""
        echo "Examples:"
        echo "  $0 status"
        echo "  $0 logs pokedex-backend"
        echo "  $0 restart pokedex-frontend"
        ;;
esac
