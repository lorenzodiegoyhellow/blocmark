#!/bin/bash

echo "💾 Blocmark Neon Database Backup Script"
echo "======================================="
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL environment variable is not set"
    echo ""
    echo "Please set it first:"
    echo "export DATABASE_URL='your_current_neon_connection_string'"
    echo ""
    echo "Or create a .env file with:"
    echo "DATABASE_URL='your_current_neon_connection_string'"
    exit 1
fi

echo "✅ DATABASE_URL is set"
echo "Current database: $DATABASE_URL"
echo ""

# Create backup directory
BACKUP_DIR="neon_backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "📁 Creating backup in: $BACKUP_DIR"
echo ""

echo "⚠️  IMPORTANT: Make sure this is your CURRENT Neon database, not Replit!"
echo ""

read -p "Continue with backup? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "❌ Backup cancelled"
    exit 0
fi

echo ""
echo "🔄 Starting backup process..."

# Backup schema only
echo "📝 Backing up database schema..."
pg_dump "$DATABASE_URL" --schema-only > "$BACKUP_DIR/schema_backup.sql"

if [ $? -eq 0 ]; then
    echo "✅ Schema backup completed"
else
    echo "❌ Schema backup failed"
    exit 1
fi

# Backup data only
echo "📊 Backing up database data..."
pg_dump "$DATABASE_URL" --data-only > "$BACKUP_DIR/data_backup.sql"

if [ $? -eq 0 ]; then
    echo "✅ Data backup completed"
else
    echo "❌ Data backup failed"
    exit 1
fi

# Full backup
echo "💾 Creating full backup..."
pg_dump "$DATABASE_URL" > "$BACKUP_DIR/full_backup.sql"

if [ $? -eq 0 ]; then
    echo "✅ Full backup completed"
else
    echo "❌ Full backup failed"
    exit 1
fi

# Create a summary file
echo "📋 Creating backup summary..."
cat > "$BACKUP_DIR/BACKUP_INFO.txt" << EOF
Blocmark Neon Database Backup
=============================
Date: $(date)
Database URL: $DATABASE_URL

Backup Files:
- schema_backup.sql: Database structure only
- data_backup.sql: Data only
- full_backup.sql: Complete database backup

To restore this backup:
1. Create a new Neon database
2. Use: psql "new_database_url" < full_backup.sql

⚠️  Keep these files safe!
EOF

echo "✅ Backup summary created"
echo ""

echo "🎉 Backup completed successfully!"
echo ""
echo "📁 Backup files saved in: $BACKUP_DIR"
echo "Contents:"
ls -la "$BACKUP_DIR"
echo ""
echo "🔒 Your current database is now safely backed up"
echo "You can proceed with deletion and import from Replit"
echo ""
echo "Next steps:"
echo "1. Go to Neon Console and DELETE the database"
echo "2. Create a new database or let Neon recreate it"
echo "3. Get the new connection string"
echo "4. Run: ./import-replit-data.sh"
