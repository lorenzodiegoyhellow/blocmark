#!/bin/bash

echo "🔄 Blocmark Data Copy Script (Replit → Neon)"
echo "============================================="
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL environment variable is not set"
    echo "Please set it to your Replit database URL first"
    exit 1
fi

echo "📋 Current DATABASE_URL: $DATABASE_URL"
echo ""

# Check if this is Replit or Neon
if [[ "$DATABASE_URL" == *"replit"* ]] || [[ "$DATABASE_URL" == *"db.replit"* ]]; then
    echo "✅ Detected Replit database - proceeding with export"
    
    # Export data from Replit
    echo "📤 Exporting data from Replit..."
    
    # Create backup directory
    mkdir -p replit_backup
    
    # Export schema and data
    pg_dump "$DATABASE_URL" --schema-only > replit_backup/schema.sql
    pg_dump "$DATABASE_URL" --data-only > replit_backup/data.sql
    pg_dump "$DATABASE_URL" > replit_backup/full_backup.sql
    
    echo "✅ Export completed! Files saved in replit_backup/ folder"
    echo ""
    echo "📁 Backup files created:"
    echo "  - schema.sql (database structure)"
    echo "  - data.sql (data only)"
    echo "  - full_backup.sql (complete backup)"
    echo ""
    echo "🎯 Next steps:"
    echo "1. Update DATABASE_URL to your new Neon database"
    echo "2. Run: ./import-to-neon.sh"
    
elif [[ "$DATABASE_URL" == *"neon"* ]]; then
    echo "✅ Detected Neon database - proceeding with import"
    
    # Check if backup files exist
    if [ ! -d "replit_backup" ]; then
        echo "❌ No backup files found. Please export from Replit first."
        exit 1
    fi
    
    echo "📥 Importing data to Neon..."
    
    # Import schema first
    echo "📝 Importing schema..."
    psql "$DATABASE_URL" < replit_backup/schema.sql
    
    # Import data
    echo "📊 Importing data..."
    psql "$DATABASE_URL" < replit_backup/data.sql
    
    echo "✅ Import completed!"
    
else
    echo "❓ Unknown database type. Please check your DATABASE_URL"
    echo "Expected: replit.com or neon.tech"
    exit 1
fi
