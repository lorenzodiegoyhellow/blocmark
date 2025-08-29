-- COMPREHENSIVE FIX FOR ALL MISSING COLUMNS
-- This script will add all the missing columns that are causing dashboard errors

-- 1. Fix locations table - add missing created_at column
ALTER TABLE locations ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();

-- 2. Fix messages table - add missing read column (this should be isRead but schema expects read)
ALTER TABLE messages ADD COLUMN IF NOT EXISTS read BOOLEAN DEFAULT FALSE;

-- 3. Fix notifications table - add missing is_read column
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE;

-- 4. Add status_updated_by column to locations table
ALTER TABLE locations ADD COLUMN IF NOT EXISTS status_updated_by INTEGER;

-- 5. Add foreign key constraint for status_updated_by
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'locations_status_updated_by_fkey'
    ) THEN
        ALTER TABLE locations 
        ADD CONSTRAINT locations_status_updated_by_fkey 
        FOREIGN KEY (status_updated_by) REFERENCES users(id);
    END IF;
END $$;

-- 6. Update existing records to have default values
UPDATE locations SET created_at = NOW() WHERE created_at IS NULL;
UPDATE messages SET read = false WHERE read IS NULL;
UPDATE notifications SET is_read = false WHERE is_read IS NULL;

-- 7. Verify all columns were added
SELECT 
    'locations' as table_name,
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'locations' 
AND column_name IN ('created_at', 'status_updated_by')
ORDER BY column_name;

SELECT 
    'messages' as table_name,
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'messages' 
AND column_name = 'read'
ORDER BY column_name;

SELECT 
    'notifications' as table_name,
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'notifications' 
AND column_name = 'is_read'
ORDER BY column_name;
