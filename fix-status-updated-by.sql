-- Add missing status_updated_by column to locations table
ALTER TABLE locations ADD COLUMN IF NOT EXISTS status_updated_by INTEGER;

-- Add foreign key constraint if it doesn't exist
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

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'locations' AND column_name = 'status_updated_by';
