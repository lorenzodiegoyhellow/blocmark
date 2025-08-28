-- Add ALL possible missing columns for the users table
-- This script will add every column that might be referenced by the application

-- Add status_reason column (this was causing the latest error)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'status_reason'
    ) THEN
        ALTER TABLE users ADD COLUMN status_reason text;
        RAISE NOTICE 'Added status_reason column';
    ELSE
        RAISE NOTICE 'status_reason column already exists';
    END IF;
END $$;

-- Add auth_provider column (this was causing the first error)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'auth_provider'
    ) THEN
        ALTER TABLE users ADD COLUMN auth_provider text DEFAULT 'local';
        RAISE NOTICE 'Added auth_provider column';
    ELSE
        RAISE NOTICE 'auth_provider column already exists';
    END IF;
END $$;

-- Add ALL other possible columns that might be needed
DO $$ 
BEGIN
    -- Add facebook_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'facebook_id') THEN
        ALTER TABLE users ADD COLUMN facebook_id text;
        RAISE NOTICE 'Added facebook_id column';
    END IF;
    
    -- Add apple_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'apple_id') THEN
        ALTER TABLE users ADD COLUMN apple_id text;
        RAISE NOTICE 'Added apple_id column';
    END IF;
    
    -- Add twitter_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'twitter_id') THEN
        ALTER TABLE users ADD COLUMN twitter_id text;
        RAISE NOTICE 'Added twitter_id column';
    END IF;
    
    -- Add linkedin_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'linkedin_id') THEN
        ALTER TABLE users ADD COLUMN linkedin_id text;
        RAISE NOTICE 'Added linkedin_id column';
    END IF;
    
    -- Add github_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'github_id') THEN
        ALTER TABLE users ADD COLUMN github_id text;
        RAISE NOTICE 'Added github_id column';
    END IF;
    
    -- Add microsoft_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'microsoft_id') THEN
        ALTER TABLE users ADD COLUMN microsoft_id text;
        RAISE NOTICE 'Added microsoft_id column';
    END IF;
    
    -- Add first_name
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'first_name') THEN
        ALTER TABLE users ADD COLUMN first_name text;
        RAISE NOTICE 'Added first_name column';
    END IF;
    
    -- Add last_name
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'last_name') THEN
        ALTER TABLE users ADD COLUMN last_name text;
        RAISE NOTICE 'Added last_name column';
    END IF;
    
    -- Add date_of_birth
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'date_of_birth') THEN
        ALTER TABLE users ADD COLUMN date_of_birth date;
        RAISE NOTICE 'Added date_of_birth column';
    END IF;
    
    -- Add gender
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'gender') THEN
        ALTER TABLE users ADD COLUMN gender text;
        RAISE NOTICE 'Added gender column';
    END IF;
    
    -- Add company_name
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'company_name') THEN
        ALTER TABLE users ADD COLUMN company_name text;
        RAISE NOTICE 'Added company_name column';
    END IF;
    
    -- Add job_title
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'job_title') THEN
        ALTER TABLE users ADD COLUMN job_title text;
        RAISE NOTICE 'Added job_title column';
    END IF;
    
    -- Add website
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'website') THEN
        ALTER TABLE users ADD COLUMN website text;
        RAISE NOTICE 'Added website column';
    END IF;
    
    -- Add social_media
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'social_media') THEN
        ALTER TABLE users ADD COLUMN social_media jsonb DEFAULT '{}';
        RAISE NOTICE 'Added social_media column';
    END IF;
    
    -- Add notification_settings
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'notification_settings') THEN
        ALTER TABLE users ADD COLUMN notification_settings jsonb DEFAULT '{}';
        RAISE NOTICE 'Added notification_settings column';
    END IF;
    
    -- Add privacy_settings
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'privacy_settings') THEN
        ALTER TABLE users ADD COLUMN privacy_settings jsonb DEFAULT '{}';
        RAISE NOTICE 'Added privacy_settings column';
    END IF;
    
    -- Add two_factor_enabled
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'two_factor_enabled') THEN
        ALTER TABLE users ADD COLUMN two_factor_enabled boolean DEFAULT false;
        RAISE NOTICE 'Added two_factor_enabled column';
    END IF;
    
    -- Add two_factor_secret
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'two_factor_secret') THEN
        ALTER TABLE users ADD COLUMN two_factor_secret text;
        RAISE NOTICE 'Added two_factor_secret column';
    END IF;
    
    -- Add backup_codes
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'backup_codes') THEN
        ALTER TABLE users ADD COLUMN backup_codes text[] DEFAULT '{}';
        RAISE NOTICE 'Added backup_codes column';
    END IF;
    
    -- Add login_attempts
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'login_attempts') THEN
        ALTER TABLE users ADD COLUMN login_attempts integer DEFAULT 0;
        RAISE NOTICE 'Added login_attempts column';
    END IF;
    
    -- Add locked_until
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'locked_until') THEN
        ALTER TABLE users ADD COLUMN locked_until timestamp;
        RAISE NOTICE 'Added locked_until column';
    END IF;
    
    -- Add ip_address
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'ip_address') THEN
        ALTER TABLE users ADD COLUMN ip_address text;
        RAISE NOTICE 'Added ip_address column';
    END IF;
    
    -- Add user_agent
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'user_agent') THEN
        ALTER TABLE users ADD COLUMN user_agent text;
        RAISE NOTICE 'Added user_agent column';
    END IF;
    
    -- Add timezone
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'timezone') THEN
        ALTER TABLE users ADD COLUMN timezone text DEFAULT 'UTC';
        RAISE NOTICE 'Added timezone column';
    END IF;
    
    -- Add language
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'language') THEN
        ALTER TABLE users ADD COLUMN language text DEFAULT 'en';
        RAISE NOTICE 'Added language column';
    END IF;
    
    -- Add currency
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'currency') THEN
        ALTER TABLE users ADD COLUMN currency text DEFAULT 'USD';
        RAISE NOTICE 'Added currency column';
    END IF;
    
    -- Add referral_code
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'referral_code') THEN
        ALTER TABLE users ADD COLUMN referral_code text;
        RAISE NOTICE 'Added referral_code column';
    END IF;
    
    -- Add referred_by
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'referred_by') THEN
        ALTER TABLE users ADD COLUMN referred_by integer;
        RAISE NOTICE 'Added referred_by column';
    END IF;
    
    -- Add referral_count
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'referral_count') THEN
        ALTER TABLE users ADD COLUMN referral_count integer DEFAULT 0;
        RAISE NOTICE 'Added referral_count column';
    END IF;
    
    -- Add points
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'points') THEN
        ALTER TABLE users ADD COLUMN points integer DEFAULT 0;
        RAISE NOTICE 'Added points column';
    END IF;
    
    -- Add level
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'level') THEN
        ALTER TABLE users ADD COLUMN level text DEFAULT 'bronze';
        RAISE NOTICE 'Added level column';
    END IF;
    
    -- Add badges
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'badges') THEN
        ALTER TABLE users ADD COLUMN badges text[] DEFAULT '{}';
        RAISE NOTICE 'Added badges column';
    END IF;
    
    -- Add achievements
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'achievements') THEN
        ALTER TABLE users ADD COLUMN achievements jsonb DEFAULT '[]';
        RAISE NOTICE 'Added achievements column';
    END IF;
    
    -- Add last_activity
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'last_activity') THEN
        ALTER TABLE users ADD COLUMN last_activity timestamp DEFAULT now();
        RAISE NOTICE 'Added last_activity column';
    END IF;
    
    -- Add status
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'status') THEN
        ALTER TABLE users ADD COLUMN status text DEFAULT 'active';
        RAISE NOTICE 'Added status column';
    END IF;
    
    -- Add notes
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'notes') THEN
        ALTER TABLE users ADD COLUMN notes text;
        RAISE NOTICE 'Added notes column';
    END IF;
    
    -- Add tags
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'tags') THEN
        ALTER TABLE users ADD COLUMN tags text[] DEFAULT '{}';
        RAISE NOTICE 'Added tags column';
    END IF;
    
    RAISE NOTICE 'All columns added successfully!';
END $$;

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
