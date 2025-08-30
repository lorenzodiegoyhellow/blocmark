#!/bin/bash

echo "📥 Blocmark Replit Data Import Script"
echo "====================================="
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL environment variable is not set"
    echo ""
    echo "Please set it first:"
    echo "export DATABASE_URL='your_neon_connection_string'"
    echo ""
    echo "Or create a .env file with:"
    echo "DATABASE_URL='your_neon_connection_string'"
    exit 1
fi

echo "✅ DATABASE_URL is set"
echo ""

# Check if export files exist
if [ ! -f "blocmark_database_export.sql" ]; then
    echo "❌ blocmark_database_export.sql not found"
    echo "Please make sure you have the export files from Replit"
    exit 1
fi

echo "📁 Found export files:"
ls -la *.sql
echo ""

echo "⚠️  WARNING: This will import data into your current database"
echo "Make sure you're connected to the correct Neon database!"
echo ""

read -p "Continue with import? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "❌ Import cancelled"
    exit 0
fi

echo ""
echo "🔄 Starting import process..."

# Import the main export file
echo "📥 Importing blocmark_database_export.sql..."
psql "$DATABASE_URL" < blocmark_database_export.sql

if [ $? -eq 0 ]; then
    echo "✅ Main export imported successfully"
else
    echo "❌ Import failed"
    exit 1
fi

# If there are other export files, import them too
if [ -f "export_database_data.sql" ]; then
    echo "📥 Importing export_database_data.sql..."
    psql "$DATABASE_URL" < export_database_data.sql
    
    if [ $? -eq 0 ]; then
        echo "✅ Additional data imported successfully"
    else
        echo "⚠️  Additional data import had issues (this might be normal)"
    fi
fi

echo ""
echo "🎉 Import completed!"
echo ""
echo "Next steps:"
echo "1. Test your application"
echo "2. Check if /listings page works"
echo "3. Verify other functionality"
echo ""
echo "To test, run: npm run dev"
