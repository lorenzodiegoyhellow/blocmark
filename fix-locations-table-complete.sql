-- Fix locations table - add all missing columns
-- This script adds all the columns that the application expects but might be missing from the database

-- Add missing columns to locations table
ALTER TABLE locations 
ADD COLUMN IF NOT EXISTS videos text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS photos text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS country text DEFAULT 'USA',
ADD COLUMN IF NOT EXISTS state text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS postal_code text,
ADD COLUMN IF NOT EXISTS booking_buffer integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS instant_bookable boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS cancellation_policy text DEFAULT 'Standard',
ADD COLUMN IF NOT EXISTS house_rules text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS check_in_time text DEFAULT '9:00 AM',
ADD COLUMN IF NOT EXISTS check_out_time text DEFAULT '6:00 PM',
ADD COLUMN IF NOT EXISTS max_guests integer DEFAULT 10,
ADD COLUMN IF NOT EXISTS min_stay integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS max_stay integer DEFAULT 24,
ADD COLUMN IF NOT EXISTS status_reason text,
ADD COLUMN IF NOT EXISTS status_updated_at timestamp,
ADD COLUMN IF NOT EXISTS status_updated_by integer,
ADD COLUMN IF NOT EXISTS created_at timestamp DEFAULT now(),
ADD COLUMN IF NOT EXISTS updated_at timestamp DEFAULT now(),
ADD COLUMN IF NOT EXISTS image_tags jsonb[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS metadata text,
ADD COLUMN IF NOT EXISTS prohibited_items text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS location_rules text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS faqs jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS check_in_instructions text,
ADD COLUMN IF NOT EXISTS equipment_rental_available boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS group_size_pricing jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS additional_fees jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS allowed_activities text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS enabled_activities text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS activity_pricing jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS pricing_matrix jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS enabled_group_sizes text[] DEFAULT '["small"]',
ADD COLUMN IF NOT EXISTS house_style text,
ADD COLUMN IF NOT EXISTS property_features jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS accessibility_data jsonb DEFAULT '{}';

-- Add foreign key constraint for status_updated_by if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'locations_status_updated_by_fkey' 
        AND table_name = 'locations'
    ) THEN
        ALTER TABLE locations 
        ADD CONSTRAINT locations_status_updated_by_fkey 
        FOREIGN KEY (status_updated_by) REFERENCES users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Update existing records to have default values for required fields
UPDATE locations SET 
    status = COALESCE(status, 'pending'),
    created_at = COALESCE(created_at, now()),
    updated_at = COALESCE(updated_at, now())
WHERE status IS NULL OR created_at IS NULL OR updated_at IS NULL;

-- Verify the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'locations' 
ORDER BY ordinal_position;

-- Show final table info
SELECT 
    'locations' as table_name,
    COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_name = 'locations';
