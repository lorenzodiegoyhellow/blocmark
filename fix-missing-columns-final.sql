-- Fix missing columns that are causing current errors
-- Run this in the Neon SQL editor

-- Add missing columns to locations table
ALTER TABLE locations ADD COLUMN IF NOT EXISTS prohibited_items TEXT[];
ALTER TABLE locations ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE;

-- Add missing columns to messages table  
ALTER TABLE messages ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE;

-- Add missing columns to notifications table
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE;

-- Verify the columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'locations' 
AND column_name IN ('prohibited_items', 'archived')
ORDER BY column_name;

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'messages' 
AND column_name = 'archived'
ORDER BY column_name;

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'notifications' 
AND column_name = 'is_read'
ORDER BY column_name;
