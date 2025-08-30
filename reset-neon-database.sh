#!/bin/bash

echo "🚀 Blocmark Neon Database Reset Script"
echo "======================================"
echo ""

# Check if neon CLI is installed
if ! command -v neon &> /dev/null; then
    echo "❌ Neon CLI not found. Installing..."
    npm install -g neon
fi

echo "📋 Current Environment:"
echo "DATABASE_URL: ${DATABASE_URL:-'Not set'}"
echo ""

echo "🔑 To proceed, you need to:"
echo "1. Get your Replit DATABASE_URL from the Secrets tab"
echo "2. Get your Neon project ID and API key"
echo ""

# Prompt for Replit database URL
read -p "Enter your Replit DATABASE_URL: " REPLIT_DATABASE_URL

if [ -z "$REPLIT_DATABASE_URL" ]; then
    echo "❌ Replit DATABASE_URL is required"
    exit 1
fi

# Prompt for Neon project ID
read -p "Enter your Neon project ID: " NEON_PROJECT_ID

if [ -z "$NEON_PROJECT_ID" ]; then
    echo "❌ Neon project ID is required"
    exit 1
fi

echo ""
echo "⚠️  WARNING: This will DESTROY your current Neon database!"
echo "All data will be lost and replaced with Replit data."
echo ""

read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "❌ Operation cancelled"
    exit 0
fi

echo ""
echo "🔄 Starting database reset process..."

# Step 1: Reset Neon database
echo "📊 Step 1: Resetting Neon database..."
neon projects reset --project-id "$NEON_PROJECT_ID" --force

if [ $? -eq 0 ]; then
    echo "✅ Neon database reset successful"
else
    echo "❌ Failed to reset Neon database"
    exit 1
fi

# Step 2: Get new connection string
echo "🔗 Step 2: Getting new connection string..."
NEW_DATABASE_URL=$(neon projects connection-string --project-id "$NEON_PROJECT_ID" --pooler)

if [ $? -eq 0 ]; then
    echo "✅ New connection string obtained"
    echo "New DATABASE_URL: $NEW_DATABASE_URL"
else
    echo "❌ Failed to get new connection string"
    exit 1
fi

# Step 3: Create .env file with new DATABASE_URL
echo "📝 Step 3: Creating .env file..."
cat > .env << EOF
# Database Configuration
DATABASE_URL="$NEW_DATABASE_URL"

# API Keys (you'll need to fill these in)
GOOGLE_PLACES_API_KEY=""
GOOGLE_MAPS_API_KEY=""
STRIPE_PUBLISHABLE_KEY=""
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""

# Other environment variables
NODE_ENV="development"
SESSION_SECRET=""
EOF

echo "✅ .env file created"

# Step 4: Run migrations to recreate schema
echo "🏗️  Step 4: Running migrations..."
npm run migrate

if [ $? -eq 0 ]; then
    echo "✅ Migrations completed successfully"
else
    echo "❌ Migrations failed"
    exit 1
fi

# Step 5: Copy data from Replit
echo "📋 Step 5: Copying data from Replit..."
echo "This step requires manual intervention:"
echo "1. Set DATABASE_URL to your Replit URL temporarily"
echo "2. Export data from Replit database"
echo "3. Set DATABASE_URL back to new Neon URL"
echo "4. Import data to new Neon database"
echo ""

echo "🎯 Next steps:"
echo "1. Update your .env file with the new DATABASE_URL: $NEW_DATABASE_URL"
echo "2. Fill in your API keys in the .env file"
echo "3. Copy your data from Replit to the new Neon database"
echo "4. Test your application"
echo ""

echo "✅ Database reset script completed!"
echo "Remember to restart your server after updating the .env file"
