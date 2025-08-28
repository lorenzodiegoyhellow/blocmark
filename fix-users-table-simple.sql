-- Simple script to add all missing columns to users table
-- This script will add every column that the application needs

-- Add status_reason column (this was causing the latest error)
ALTER TABLE users ADD COLUMN IF NOT EXISTS status_reason text;

-- Add auth_provider column (this was causing the first error)
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_provider text DEFAULT 'local';

-- Add all other missing columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS facebook_id text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS apple_id text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS twitter_id text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS linkedin_id text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS github_id text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS microsoft_id text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth date;
ALTER TABLE users ADD COLUMN IF NOT EXISTS gender text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS company_name text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS job_title text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS website text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS social_media jsonb DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS notification_settings jsonb DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS privacy_settings jsonb DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_enabled boolean DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_secret text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS backup_codes text[] DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS login_attempts integer DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_until timestamp;
ALTER TABLE users ADD COLUMN IF NOT EXISTS ip_address text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS user_agent text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS timezone text DEFAULT 'UTC';
ALTER TABLE users ADD COLUMN IF NOT EXISTS language text DEFAULT 'en';
ALTER TABLE users ADD COLUMN IF NOT EXISTS currency text DEFAULT 'USD';
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by integer;
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_count integer DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS points integer DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS level text DEFAULT 'bronze';
ALTER TABLE users ADD COLUMN IF NOT EXISTS badges text[] DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS achievements jsonb DEFAULT '[]';
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_activity timestamp DEFAULT now();
ALTER TABLE users ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';
ALTER TABLE users ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

-- Show the final table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Verify the table has all required columns
SELECT 
    CASE 
        WHEN COUNT(*) >= 60 THEN '✅ Users table is complete'
        ELSE '❌ Users table is missing columns: ' || COUNT(*) || '/60 found'
    END as status
FROM information_schema.columns 
WHERE table_name = 'users';
