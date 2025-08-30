# 🚀 Quick Start: Reset Neon Database & Copy from Replit

## What You Need
1. **Replit DATABASE_URL** (from Secrets tab)
2. **Neon Project ID** (from console.neon.tech)
3. **Neon API Key** (from Account Settings)

## Quick Commands

### 1. Reset Neon Database
```bash
# Login to Neon
neon auth login

# Reset database (⚠️ DESTROYS ALL DATA)
neon projects reset --project-id YOUR_PROJECT_ID --force
```

### 2. Get New Connection String
```bash
neon projects connection-string --project-id YOUR_PROJECT_ID --pooler
```

### 3. Create .env File
```bash
# Create .env file with new DATABASE_URL
echo 'DATABASE_URL="your_new_neon_url"' > .env
```

### 4. Run Migrations
```bash
npm run migrate
```

### 5. Copy Data from Replit
```bash
# Set DATABASE_URL to Replit URL
export DATABASE_URL="your_replit_url"

# Export data
./copy-replit-data.sh

# Set DATABASE_URL back to Neon
export DATABASE_URL="your_neon_url"

# Import data
./copy-replit-data.sh
```

## ⚠️ Important
- **Backup first** - Always backup your current data
- **Test thoroughly** - Test all functionality after reset
- **Update API keys** - Make sure all keys are in .env file

## Need Help?
- Run `./reset-neon-database.sh` for guided process
- Check `NEON_DATABASE_RESET_GUIDE.md` for detailed steps
- Check server logs for specific errors
