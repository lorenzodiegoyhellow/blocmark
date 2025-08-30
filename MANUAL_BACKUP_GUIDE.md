# 💾 Manual Neon Database Backup Guide

## Why Backup First?
Before deleting your current Neon database, it's crucial to create a backup. This ensures you can restore your current data if something goes wrong during the Replit import process.

## Method 1: Using pg_dump (Recommended)

### Prerequisites
- Make sure you have PostgreSQL client tools installed
- Your current Neon DATABASE_URL ready

### Step 1: Set Your Current DATABASE_URL
```bash
# Set to your CURRENT Neon database (not Replit)
export DATABASE_URL="postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require"
```

### Step 2: Create Backup Directory
```bash
mkdir neon_backup_$(date +%Y%m%d_%H%M%S)
cd neon_backup_*
```

### Step 3: Run Backup Commands
```bash
# Backup schema only
pg_dump "$DATABASE_URL" --schema-only > schema_backup.sql

# Backup data only  
pg_dump "$DATABASE_URL" --data-only > data_backup.sql

# Full backup
pg_dump "$DATABASE_URL" > full_backup.sql
```

## Method 2: Using Neon Web Console

### Step 1: Go to Neon Console
1. Visit [console.neon.tech](https://console.neon.tech/)
2. Navigate to your Blocmark project

### Step 2: Use SQL Editor
1. Go to **SQL Editor** tab
2. Run this query to see your tables:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

### Step 3: Export Data (Limited)
- Neon console has limited export capabilities
- For full backup, use pg_dump method above

## Method 3: Using the Backup Script

```bash
# Make sure DATABASE_URL is set to your current Neon database
export DATABASE_URL="your_current_neon_url"

# Run the backup script
./backup-current-neon.sh
```

## What Gets Backed Up

### Schema Backup (`schema_backup.sql`)
- Table structures
- Indexes
- Constraints
- Functions
- Triggers

### Data Backup (`data_backup.sql`)
- All data in tables
- No table structures

### Full Backup (`full_backup.sql`)
- Complete database
- Schema + Data
- Most comprehensive

## After Backup

### Verify Backup Files
```bash
ls -la neon_backup_*
# Should show:
# - schema_backup.sql
# - data_backup.sql  
# - full_backup.sql
# - BACKUP_INFO.txt
```

### Test Backup (Optional)
```bash
# Create a test database to verify backup works
# (Only if you have access to create test databases)
```

## ⚠️ Important Notes

1. **Verify DATABASE_URL**: Make sure you're backing up the RIGHT database
2. **Check file sizes**: Backup files should be reasonable size (not 0 bytes)
3. **Store safely**: Keep backup files in a secure location
4. **Test restore**: If possible, test restoring to a test database

## Next Steps After Backup

1. ✅ **Backup completed** (you are here)
2. 🗑️ **Delete current Neon database** (in Neon console)
3. 🆕 **Create new database** (Neon will recreate automatically)
4. 🔗 **Get new connection string**
5. 📥 **Import Replit data** using `./import-replit-data.sh`

## Need Help?

- Check if `pg_dump` is installed: `which pg_dump`
- Verify DATABASE_URL format
- Check Neon console for connection details
- Review backup file contents to ensure they're not empty
