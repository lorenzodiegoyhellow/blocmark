-- Add the specific missing columns that the application code expects
-- Based on the error logs, we need to add these columns

-- Add facebook_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'facebook_id'
    ) THEN
        ALTER TABLE users ADD COLUMN facebook_id text;
        RAISE NOTICE 'Added facebook_id column';
    ELSE
        RAISE NOTICE 'facebook_id column already exists';
    END IF;
END $$;

-- Add apple_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'apple_id'
    ) THEN
        ALTER TABLE users ADD COLUMN apple_id text;
        RAISE NOTICE 'Added apple_id column';
    ELSE
        RAISE NOTICE 'apple_id column already exists';
    END IF;
END $$;

-- Add twitter_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'twitter_id'
    ) THEN
        ALTER TABLE users ADD COLUMN twitter_id text;
        RAISE NOTICE 'Added twitter_id column';
    ELSE
        RAISE NOTICE 'twitter_id column already exists';
    END IF;
END $$;

-- Add linkedin_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'linkedin_id'
    ) THEN
        ALTER TABLE users ADD COLUMN linkedin_id text;
        RAISE NOTICE 'Added linkedin_id column';
    ELSE
        RAISE NOTICE 'linkedin_id column already exists';
    END IF;
END $$;

-- Add github_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'github_id'
    ) THEN
        ALTER TABLE users ADD COLUMN github_id text;
        RAISE NOTICE 'Added github_id column';
    ELSE
        RAISE NOTICE 'github_id column already exists';
    END IF;
END $$;

-- Add microsoft_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'microsoft_id'
    ) THEN
        ALTER TABLE users ADD COLUMN microsoft_id text;
        RAISE NOTICE 'Added microsoft_id column';
    ELSE
        RAISE NOTICE 'microsoft_id column already exists';
    END IF;
END $$;

-- Add auth_provider column if it doesn't exist
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

-- Add first_name column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'first_name'
    ) THEN
        ALTER TABLE users ADD COLUMN first_name text;
        RAISE NOTICE 'Added first_name column';
    ELSE
        RAISE NOTICE 'first_name column already exists';
    END IF;
END $$;

-- Add last_name column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'last_name'
    ) THEN
        ALTER TABLE users ADD COLUMN last_name text;
        RAISE NOTICE 'Added last_name column';
    ELSE
        RAISE NOTICE 'last_name column already exists';
    END IF;
END $$;

-- Add date_of_birth column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'date_of_birth'
    ) THEN
        ALTER TABLE users ADD COLUMN date_of_birth date;
        RAISE NOTICE 'Added date_of_birth column';
    ELSE
        RAISE NOTICE 'date_of_birth column already exists';
    END IF;
END $$;

-- Add gender column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'gender'
    ) THEN
        ALTER TABLE users ADD COLUMN gender text;
        RAISE NOTICE 'Added gender column';
    ELSE
        RAISE NOTICE 'gender column already exists';
    END IF;
END $$;

-- Add company_name column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'company_name'
    ) THEN
        ALTER TABLE users ADD COLUMN company_name text;
        RAISE NOTICE 'Added company_name column';
    ELSE
        RAISE NOTICE 'company_name column already exists';
    END IF;
END $$;

-- Add job_title column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'job_title'
    ) THEN
        ALTER TABLE users ADD COLUMN job_title text;
        RAISE NOTICE 'Added job_title column';
    ELSE
        RAISE NOTICE 'job_title column already exists';
    END IF;
END $$;

-- Add website column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'website'
    ) THEN
        ALTER TABLE users ADD COLUMN website text;
        RAISE NOTICE 'Added website column';
    ELSE
        RAISE NOTICE 'website column already exists';
    END IF;
END $$;

-- Add social_media column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'social_media'
    ) THEN
        ALTER TABLE users ADD COLUMN social_media jsonb DEFAULT '{}';
        RAISE NOTICE 'Added social_media column';
    ELSE
        RAISE NOTICE 'social_media column already exists';
    END IF;
END $$;

-- Add notification_settings column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'notification_settings'
    ) THEN
        ALTER TABLE users ADD COLUMN notification_settings jsonb DEFAULT '{}';
        RAISE NOTICE 'Added notification_settings column';
    ELSE
        RAISE NOTICE 'notification_settings column already exists';
    END IF;
END $$;

-- Add privacy_settings column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'privacy_settings'
    ) THEN
        ALTER TABLE users ADD COLUMN privacy_settings jsonb DEFAULT '{}';
        RAISE NOTICE 'Added privacy_settings column';
    ELSE
        RAISE NOTICE 'privacy_settings column already exists';
    END IF;
END $$;

-- Add two_factor_enabled column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'two_factor_enabled'
    ) THEN
        ALTER TABLE users ADD COLUMN two_factor_enabled boolean DEFAULT false;
        RAISE NOTICE 'Added two_factor_enabled column';
    ELSE
        RAISE NOTICE 'two_factor_enabled column already exists';
    END IF;
END $$;

-- Add two_factor_secret column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'two_factor_secret'
    ) THEN
        ALTER TABLE users ADD COLUMN two_factor_secret text;
        RAISE NOTICE 'Added two_factor_secret column';
    ELSE
        RAISE NOTICE 'two_factor_secret column already exists';
    END IF;
END $$;

-- Add backup_codes column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'backup_codes'
    ) THEN
        ALTER TABLE users ADD COLUMN backup_codes text[];
        RAISE NOTICE 'Added backup_codes column';
    ELSE
        RAISE NOTICE 'backup_codes column already exists';
    END IF;
END $$;

-- Add login_attempts column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'login_attempts'
    ) THEN
        ALTER TABLE users ADD COLUMN login_attempts integer DEFAULT 0;
        RAISE NOTICE 'Added login_attempts column';
    ELSE
        RAISE NOTICE 'login_attempts column already exists';
    END IF;
END $$;

-- Add locked_until column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'locked_until'
    ) THEN
        ALTER TABLE users ADD COLUMN locked_until timestamp;
        RAISE NOTICE 'Added locked_until column';
    ELSE
        RAISE NOTICE 'locked_until column already exists';
    END IF;
END $$;

-- Add ip_address column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'ip_address'
    ) THEN
        ALTER TABLE users ADD COLUMN ip_address text;
        RAISE NOTICE 'Added ip_address column';
    ELSE
        RAISE NOTICE 'ip_address column already exists';
    END IF;
END $$;

-- Add user_agent column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'user_agent'
    ) THEN
        ALTER TABLE users ADD COLUMN user_agent text;
        RAISE NOTICE 'Added user_agent column';
    ELSE
        RAISE NOTICE 'user_agent column already exists';
    END IF;
END $$;

-- Add timezone column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'timezone'
    ) THEN
        ALTER TABLE users ADD COLUMN timezone text DEFAULT 'UTC';
        RAISE NOTICE 'Added timezone column';
    ELSE
        RAISE NOTICE 'timezone column already exists';
    END IF;
END $$;

-- Add language column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'language'
    ) THEN
        ALTER TABLE users ADD COLUMN language text DEFAULT 'en';
        RAISE NOTICE 'Added language column';
    ELSE
        RAISE NOTICE 'language column already exists';
    END IF;
END $$;

-- Add currency column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'currency'
    ) THEN
        ALTER TABLE users ADD COLUMN currency text DEFAULT 'USD';
        RAISE NOTICE 'Added currency column';
    ELSE
        RAISE NOTICE 'currency column already exists';
    END IF;
END $$;

-- Add referral_code column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'referral_code'
    ) THEN
        ALTER TABLE users ADD COLUMN referral_code text;
        RAISE NOTICE 'Added referral_code column';
    ELSE
        RAISE NOTICE 'referral_code column already exists';
    END IF;
END $$;

-- Add referred_by column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'referred_by'
    ) THEN
        ALTER TABLE users ADD COLUMN referred_by integer;
        RAISE NOTICE 'Added referred_by column';
    ELSE
        RAISE NOTICE 'referred_by column already exists';
    END IF;
END $$;

-- Add referral_count column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'referral_count'
    ) THEN
        ALTER TABLE users ADD COLUMN referral_count integer DEFAULT 0;
        RAISE NOTICE 'Added referral_count column';
    ELSE
        RAISE NOTICE 'referral_count column already exists';
    END IF;
END $$;

-- Add points column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'points'
    ) THEN
        ALTER TABLE users ADD COLUMN points integer DEFAULT 0;
        RAISE NOTICE 'Added points column';
    ELSE
        RAISE NOTICE 'points column already exists';
    END IF;
END $$;

-- Add level column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'level'
    ) THEN
        ALTER TABLE users ADD COLUMN level text DEFAULT 'bronze';
        RAISE NOTICE 'Added level column';
    ELSE
        RAISE NOTICE 'level column already exists';
    END IF;
END $$;

-- Add badges column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'badges'
    ) THEN
        ALTER TABLE users ADD COLUMN badges text[] DEFAULT '{}';
        RAISE NOTICE 'Added badges column';
    ELSE
        RAISE NOTICE 'badges column already exists';
    END IF;
END $$;

-- Add achievements column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'achievements'
    ) THEN
        ALTER TABLE users ADD COLUMN achievements jsonb DEFAULT '[]';
        RAISE NOTICE 'Added achievements column';
    ELSE
        RAISE NOTICE 'achievements column already exists';
    END IF;
END $$;

-- Add last_activity column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'last_activity'
    ) THEN
        ALTER TABLE users ADD COLUMN last_activity timestamp DEFAULT now();
        RAISE NOTICE 'Added last_activity column';
    ELSE
        RAISE NOTICE 'last_activity column already exists';
    END IF;
END $$;

-- Add status column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'status'
    ) THEN
        ALTER TABLE users ADD COLUMN status text DEFAULT 'active';
        RAISE NOTICE 'Added status column';
    ELSE
        RAISE NOTICE 'status column already exists';
    END IF;
END $$;

-- Add notes column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'notes'
    ) THEN
        ALTER TABLE users ADD COLUMN notes text;
        RAISE NOTICE 'Added notes column';
    ELSE
        RAISE NOTICE 'notes column already exists';
    END IF;
END $$;

-- Add tags column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'tags'
    ) THEN
        ALTER TABLE users ADD COLUMN tags text[] DEFAULT '{}';
        RAISE NOTICE 'Added tags column';
    ELSE
        RAISE NOTICE 'tags column already exists';
    END IF;
END $$;

-- Now let's see the final table structure
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
