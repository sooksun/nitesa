#!/bin/bash

# Database backup script
# Usage: ./backup-db.sh

set -e

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/nitesa_backup_$TIMESTAMP.sql"

# Create backup directory
mkdir -p $BACKUP_DIR

echo "📦 Creating database backup..."

# Backup database
docker compose exec -T mysql mysqldump -u root -p${MYSQL_ROOT_PASSWORD:-nitesa_root_password} nitesa > $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE

echo "✅ Backup created: ${BACKUP_FILE}.gz"

# Keep only last 7 backups
echo "🧹 Cleaning old backups (keeping last 7)..."
ls -t $BACKUP_DIR/*.sql.gz | tail -n +8 | xargs -r rm

echo "✅ Backup completed!"
