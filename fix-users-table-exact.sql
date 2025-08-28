-- Drop the existing users table and recreate it with the EXACT schema the application expects
-- This will fix all the column mismatch issues

-- First, drop the existing table (this will delete all data)
DROP TABLE IF EXISTS users CASCADE;

-- Now create the table with the EXACT schema from shared/schema.ts
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT, -- Made nullable for OAuth users
    roles TEXT[] NOT NULL DEFAULT ARRAY['owner', 'client'],
    
    -- OAuth fields
    google_id TEXT UNIQUE,
    facebook_id TEXT UNIQUE,
    apple_id TEXT UNIQUE,
    auth_provider TEXT NOT NULL DEFAULT 'local' CHECK (auth_provider IN ('local', 'google', 'facebook', 'apple')),
    
    -- User status field for admin banning functionality
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'banned', 'suspended')),
    status_reason TEXT, -- Reason for ban/suspension
    status_updated_at TIMESTAMP, -- When the status was last updated
    status_updated_by INTEGER, -- Which admin made the last status change
    
    -- Secret Corners access fields
    secret_corners_access TEXT NOT NULL DEFAULT 'not_applied' CHECK (secret_corners_access IN ('not_applied', 'pending', 'approved', 'rejected')),
    secret_corners_application TEXT, -- Why they want access
    secret_corners_applied_at TIMESTAMP,
    secret_corners_approved_at TIMESTAMP,
    secret_corners_approved_by INTEGER,
    secret_corners_rejection_reason TEXT,
    
    -- Add new profile fields
    profile_image TEXT,
    bio TEXT,
    location TEXT,
    phone_number TEXT,
    email TEXT,
    phone TEXT, -- Alternate field name for client-side consistency
    terms_accepted BOOLEAN DEFAULT false,
    
    -- Track when user joined
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    -- Secret Corners subscription fields
    secret_corners_subscription_tier TEXT NOT NULL DEFAULT 'none' CHECK (secret_corners_subscription_tier IN ('none', 'wanderer', 'explorer', 'architect')),
    secret_corners_subscription_status TEXT NOT NULL DEFAULT 'inactive' CHECK (secret_corners_subscription_status IN ('inactive', 'active', 'cancelled', 'past_due')),
    secret_corners_subscription_started_at TIMESTAMP,
    secret_corners_subscription_ends_at TIMESTAMP,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    stripe_connect_account_id TEXT,
    w9_form_url TEXT,
    w9_uploaded_at TIMESTAMP,
    
    -- Notification preferences
    notification_preferences JSONB DEFAULT '{"email": {"bookingRequests": true, "messages": true, "marketing": false}, "text": {"bookingRequests": true, "messages": true, "marketing": false}}',
    
    -- Response time tracking fields
    total_response_time INTEGER DEFAULT 0, -- Total response time in minutes
    response_count INTEGER DEFAULT 0, -- Number of responses tracked
    average_response_time INTEGER, -- Average response time in minutes
    last_calculated_at TIMESTAMP, -- When metrics were last calculated
    
    -- IP tracking fields
    last_login_ip TEXT,
    last_login_at TIMESTAMP,
    
    -- Identity verification fields (Stripe Identity)
    identity_verification_status TEXT NOT NULL DEFAULT 'not_started' CHECK (identity_verification_status IN ('not_started', 'pending', 'verified', 'failed', 'expired')),
    identity_verification_session_id TEXT,
    identity_verified_at TIMESTAMP,
    identity_verification_method TEXT, -- document, selfie, etc.
    identity_verification_failure_reason TEXT,
    
    -- Editor permissions - controls which admin tabs they can access
    editor_permissions JSONB DEFAULT '{"users": false, "locations": false, "bookings": false, "spotlight": false, "secretCorners": false, "blog": false, "conversations": false, "concierge": false, "logs": false, "analytics": false, "reports": false}'
);

-- Create indexes for better performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_users_facebook_id ON users(facebook_id);
CREATE INDEX idx_users_apple_id ON users(apple_id);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Show the final table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Verify the table has all required columns
SELECT 
    CASE 
        WHEN COUNT(*) >= 50 THEN '✅ Users table is complete with exact schema'
        ELSE '❌ Users table is missing columns: ' || COUNT(*) || '/50 found'
    END as status
FROM information_schema.columns 
WHERE table_name = 'users';
