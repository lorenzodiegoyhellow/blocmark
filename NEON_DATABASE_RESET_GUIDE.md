# 🚀 Neon Database Reset Guide

## Overview
This guide will help you reset your Neon database and copy data from your Replit project to start fresh.

## Prerequisites
- Neon CLI installed (`npm install -g neon`)
- Access to your Replit project
- Neon project ID and API key

## Step 1: Get Your Replit Database URL
1. Go to your Replit project
2. Click on the "Secrets" tab (lock icon)
3. Copy the `DATABASE_URL` value

## Step 2: Get Your Neon Project Info
1. Go to [Neon Console](https://console.neon.tech/)
2. Find your project
3. Copy the Project ID
4. Get your API key from Account Settings

## Step 3: Reset Neon Database
```bash
# Login to Neon (if not already logged in)
neon auth login

# Reset your database (⚠️ THIS WILL DELETE ALL DATA)
neon projects reset --project-id YOUR_PROJECT_ID --force
```

## Step 4: Get New Connection String
```bash
# Get the new connection string
neon projects connection-string --project-id YOUR_PROJECT_ID --pooler
```

## Step 5: Create .env File
Create a `.env` file in your project root with:
```env
DATABASE_URL="your_new_neon_connection_string"
GOOGLE_PLACES_API_KEY="your_key"
GOOGLE_MAPS_API_KEY="your_key"
STRIPE_PUBLISHABLE_KEY="your_key"
STRIPE_SECRET_KEY="your_key"
STRIPE_WEBHOOK_SECRET="your_key"
NODE_ENV="development"
SESSION_SECRET="your_secret"
```

## Step 6: Run Migrations
```bash
npm run migrate
```

## Step 7: Copy Data from Replit
This is the manual part that requires careful attention:

### Option A: Using pg_dump/pg_restore
```bash
# Export from Replit (temporarily set DATABASE_URL to Replit URL)
export DATABASE_URL="your_replit_database_url"
pg_dump $DATABASE_URL > replit_backup.sql

# Import to new Neon database
export DATABASE_URL="your_new_neon_url"
psql $DATABASE_URL < replit_backup.sql
```

### Option B: Using Neon's Data Import
1. In Neon Console, go to your project
2. Use the "Import" feature to upload a SQL dump
3. Export your Replit data as SQL first

## Step 8: Test Your Application
```bash
# Start your server
npm run dev

# Test the /listings page
curl http://localhost:3000/listings
```

## Troubleshooting

### Common Issues:
1. **Connection refused**: Check if DATABASE_URL is correct
2. **Schema errors**: Run migrations again
3. **Permission denied**: Check Neon project permissions

### If Migrations Fail:
```bash
# Check migration status
npm run migrate:status

# Force run specific migration
npm run migrate:up
```

## ⚠️ Important Notes
- **Backup first**: Always backup your current data before resetting
- **API keys**: Make sure to update all API keys in the new .env file
- **Test thoroughly**: Test all major functionality after the reset
- **Environment variables**: Don't commit .env files to git

## Need Help?
- Check Neon documentation: https://neon.tech/docs
- Review your migration files in the `migrations/` folder
- Check server logs for specific error messages
