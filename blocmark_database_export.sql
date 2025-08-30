-- Blocmark Database Schema Export
-- Generated from Replit PostgreSQL Database
-- Date: 2025-08-28
-- 
-- This script contains the complete database schema for migration to Neon
-- Total Tables: 42
-- 
-- IMPORTANT: Run these commands in order as foreign key constraints depend on referenced tables existing first

-- Create sequences for auto-increment fields
CREATE SEQUENCE IF NOT EXISTS addons_id_seq;
CREATE SEQUENCE IF NOT EXISTS admin_logs_id_seq;
CREATE SEQUENCE IF NOT EXISTS booking_addons_id_seq;
CREATE SEQUENCE IF NOT EXISTS booking_edit_history_id_seq;
CREATE SEQUENCE IF NOT EXISTS bookings_id_seq;
CREATE SEQUENCE IF NOT EXISTS challenge_entries_id_seq;
CREATE SEQUENCE IF NOT EXISTS concierge_requests_id_seq;
CREATE SEQUENCE IF NOT EXISTS content_moderation_alerts_id_seq;
CREATE SEQUENCE IF NOT EXISTS email_campaigns_id_seq;
CREATE SEQUENCE IF NOT EXISTS email_events_id_seq;
CREATE SEQUENCE IF NOT EXISTS email_suppression_list_id_seq;
CREATE SEQUENCE IF NOT EXISTS email_templates_id_seq;
CREATE SEQUENCE IF NOT EXISTS email_verification_tokens_id_seq;
CREATE SEQUENCE IF NOT EXISTS forum_categories_id_seq;
CREATE SEQUENCE IF NOT EXISTS forum_comments_id_seq;
CREATE SEQUENCE IF NOT EXISTS forum_likes_id_seq;
CREATE SEQUENCE IF NOT EXISTS forum_posts_id_seq;
CREATE SEQUENCE IF NOT EXISTS guide_categories_id_seq;
CREATE SEQUENCE IF NOT EXISTS guides_id_seq;
CREATE SEQUENCE IF NOT EXISTS location_calendar_integrations_id_seq;
CREATE SEQUENCE IF NOT EXISTS location_edit_history_id_seq;
CREATE SEQUENCE IF NOT EXISTS location_folders_id_seq;
CREATE SEQUENCE IF NOT EXISTS locations_id_seq;
CREATE SEQUENCE IF NOT EXISTS marketing_subscriptions_id_seq;
CREATE SEQUENCE IF NOT EXISTS message_conversations_id_seq;
CREATE SEQUENCE IF NOT EXISTS messages_id_seq;
CREATE SEQUENCE IF NOT EXISTS migrations_id_seq;
CREATE SEQUENCE IF NOT EXISTS notifications_id_seq;
CREATE SEQUENCE IF NOT EXISTS password_reset_tokens_id_seq;
CREATE SEQUENCE IF NOT EXISTS review_requirements_id_seq;
CREATE SEQUENCE IF NOT EXISTS reviews_id_seq;
CREATE SEQUENCE IF NOT EXISTS saved_locations_id_seq;
CREATE SEQUENCE IF NOT EXISTS secret_corners_applications_id_seq;
CREATE SEQUENCE IF NOT EXISTS secret_locations_id_seq;
CREATE SEQUENCE IF NOT EXISTS site_settings_id_seq;
CREATE SEQUENCE IF NOT EXISTS spotlight_locations_id_seq;
CREATE SEQUENCE IF NOT EXISTS support_emails_id_seq;
CREATE SEQUENCE IF NOT EXISTS user_email_preferences_id_seq;
CREATE SEQUENCE IF NOT EXISTS user_reports_id_seq;
CREATE SEQUENCE IF NOT EXISTS users_id_seq;
CREATE SEQUENCE IF NOT EXISTS weekly_challenges_id_seq;

-- Table: users (Referenced by many tables, create first)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER NOT NULL DEFAULT nextval('users_id_seq'::regclass),
    username TEXT NOT NULL,
    email TEXT NOT NULL,
    password TEXT,
    name TEXT,
    avatar TEXT,
    bio TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
    status TEXT DEFAULT 'active',
    stripe_customer_id TEXT,
    stripe_account_id TEXT,
    stripe_onboarding_complete BOOLEAN DEFAULT false,
    stripe_default_payment_method TEXT,
    completed_onboarding BOOLEAN DEFAULT false,
    is_photographer BOOLEAN DEFAULT false,
    is_host BOOLEAN DEFAULT false,
    verification_badge BOOLEAN DEFAULT false,
    facebook_id VARCHAR(255),
    google_id VARCHAR(255),
    apple_id VARCHAR(255),
    email_verified BOOLEAN DEFAULT false,
    auth_provider TEXT DEFAULT 'local',
    website TEXT,
    instagram TEXT,
    linkedin TEXT,
    phone TEXT,
    company TEXT,
    tax_info JSONB,
    w9_uploaded BOOLEAN DEFAULT false,
    w9_file_url TEXT,
    stripe_payment_method_id TEXT,
    registration_source TEXT DEFAULT 'organic',
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    utm_term TEXT,
    utm_content TEXT,
    referrer TEXT,
    landing_page TEXT,
    device_type TEXT,
    browser TEXT,
    os TEXT,
    ip_address TEXT,
    geolocation TEXT,
    user_agent TEXT,
    first_interaction_date TIMESTAMP WITHOUT TIME ZONE,
    last_login TIMESTAMP WITHOUT TIME ZONE,
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT users_username_unique UNIQUE (username),
    CONSTRAINT users_google_id_key UNIQUE (google_id),
    CONSTRAINT users_facebook_id_key UNIQUE (facebook_id),
    CONSTRAINT users_apple_id_key UNIQUE (apple_id)
);

-- Table: locations
CREATE TABLE IF NOT EXISTS locations (
    id INTEGER NOT NULL DEFAULT nextval('locations_id_seq'::regclass),
    owner_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price INTEGER NOT NULL,
    images TEXT[] NOT NULL DEFAULT ARRAY[]::text[],
    address TEXT NOT NULL,
    amenities TEXT[] NOT NULL,
    availability JSONB NOT NULL,
    property_type TEXT NOT NULL,
    size INTEGER NOT NULL,
    max_capacity INTEGER NOT NULL,
    incremental_rate INTEGER NOT NULL,
    cancellation_policy TEXT NOT NULL,
    latitude TEXT,
    longitude TEXT,
    instant_booking BOOLEAN NOT NULL DEFAULT false,
    min_hours INTEGER NOT NULL DEFAULT 1,
    category TEXT NOT NULL DEFAULT 'photo-studio',
    image_tags JSONB[] DEFAULT '{}'::jsonb[],
    metadata TEXT,
    status TEXT DEFAULT 'pending',
    status_reason TEXT,
    status_updated_at TIMESTAMP WITHOUT TIME ZONE,
    verification_photos TEXT[] DEFAULT '{}'::text[],
    stripe_product_id TEXT,
    stripe_price_id TEXT,
    property_rules TEXT,
    parking_info TEXT,
    check_in_instructions TEXT,
    wifi_info TEXT,
    safety_equipment TEXT,
    accessibility_features TEXT,
    last_updated TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
    price_weekend INTEGER,
    price_event INTEGER,
    price_commercial INTEGER,
    price_multi_day INTEGER,
    allow_smoke_machine BOOLEAN DEFAULT false,
    allow_amplified_music BOOLEAN DEFAULT false,
    has_truck_access BOOLEAN DEFAULT false,
    has_motorhome_parking BOOLEAN DEFAULT false,
    parking_spaces INTEGER DEFAULT 0,
    parking_type TEXT DEFAULT 'none',
    ceiling_height INTEGER,
    featured_amenity TEXT,
    neighborhood_info TEXT,
    transportation_info TEXT,
    house_rules TEXT,
    location_highlights TEXT,
    booking_requirements TEXT,
    min_advance_hours INTEGER DEFAULT 24,
    max_advance_days INTEGER DEFAULT 365,
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    property_features JSONB DEFAULT '[]'::jsonb,
    house_style_subcategory TEXT,
    location_subcategory TEXT,
    ai_description TEXT,
    ai_check_in_instructions TEXT,
    description_language TEXT DEFAULT 'en',
    check_in_language TEXT DEFAULT 'en',
    CONSTRAINT locations_pkey PRIMARY KEY (id)
);

-- Table: weekly_challenges  
CREATE TABLE IF NOT EXISTS weekly_challenges (
    id INTEGER NOT NULL DEFAULT nextval('weekly_challenges_id_seq'::regclass),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    start_date TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    end_date TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    winner_location_id INTEGER,
    winner_announced_at TIMESTAMP WITHOUT TIME ZONE,
    active BOOLEAN DEFAULT true,
    CONSTRAINT weekly_challenges_pkey PRIMARY KEY (id)
);

-- Table: forum_categories
CREATE TABLE IF NOT EXISTS forum_categories (
    id INTEGER NOT NULL DEFAULT nextval('forum_categories_id_seq'::regclass),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    slug TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT forum_categories_pkey PRIMARY KEY (id),
    CONSTRAINT forum_categories_slug_key UNIQUE (slug)
);

-- Table: forum_posts
CREATE TABLE IF NOT EXISTS forum_posts (
    id INTEGER NOT NULL DEFAULT nextval('forum_posts_id_seq'::regclass),
    user_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT false,
    is_locked BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT forum_posts_pkey PRIMARY KEY (id),
    CONSTRAINT forum_posts_category_id_fkey FOREIGN KEY (category_id) REFERENCES forum_categories(id),
    CONSTRAINT forum_posts_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Table: forum_comments
CREATE TABLE IF NOT EXISTS forum_comments (
    id INTEGER NOT NULL DEFAULT nextval('forum_comments_id_seq'::regclass),
    user_id INTEGER NOT NULL,
    post_id INTEGER NOT NULL,
    parent_id INTEGER,
    content TEXT NOT NULL,
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT forum_comments_pkey PRIMARY KEY (id),
    CONSTRAINT forum_comments_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES forum_comments(id),
    CONSTRAINT forum_comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES forum_posts(id),
    CONSTRAINT forum_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Table: guide_categories
CREATE TABLE IF NOT EXISTS guide_categories (
    id INTEGER NOT NULL DEFAULT nextval('guide_categories_id_seq'::regclass),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    image TEXT,
    CONSTRAINT guide_categories_pkey PRIMARY KEY (id),
    CONSTRAINT guide_categories_slug_key UNIQUE (slug)
);

-- Table: guides
CREATE TABLE IF NOT EXISTS guides (
    id INTEGER NOT NULL DEFAULT nextval('guides_id_seq'::regclass),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT NOT NULL,
    cover_image VARCHAR(500),
    category_id INTEGER,
    author VARCHAR(255),
    status VARCHAR(50) DEFAULT 'draft',
    featured BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    difficulty VARCHAR(20) DEFAULT 'Beginner',
    time_to_read INTEGER DEFAULT 5,
    CONSTRAINT guides_pkey PRIMARY KEY (id),
    CONSTRAINT guides_slug_key UNIQUE (slug),
    CONSTRAINT guides_category_id_fkey FOREIGN KEY (category_id) REFERENCES guide_categories(id)
);

-- Table: location_folders
CREATE TABLE IF NOT EXISTS location_folders (
    id INTEGER NOT NULL DEFAULT nextval('location_folders_id_seq'::regclass),
    user_id INTEGER NOT NULL,
    name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT location_folders_pkey PRIMARY KEY (id),
    CONSTRAINT location_folders_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Table: bookings
CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER NOT NULL DEFAULT nextval('bookings_id_seq'::regclass),
    location_id INTEGER NOT NULL,
    client_id INTEGER NOT NULL,
    start_date TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    end_date TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    total_price INTEGER NOT NULL,
    status TEXT NOT NULL,
    activity_type TEXT,
    project_name TEXT,
    renter_company TEXT,
    project_description TEXT,
    guest_count INTEGER,
    payment_id TEXT,
    refund_amount INTEGER,
    refund_reason TEXT,
    refund_requested_by INTEGER,
    refund_requested_at TIMESTAMP WITHOUT TIME ZONE,
    refund_processed_by INTEGER,
    refund_processed_at TIMESTAMP WITHOUT TIME ZONE,
    last_edited_by INTEGER,
    last_edited_at TIMESTAMP WITHOUT TIME ZONE,
    activity TEXT,
    cast_and_crew TEXT,
    CONSTRAINT bookings_pkey PRIMARY KEY (id)
);

-- Table: addons
CREATE TABLE IF NOT EXISTS addons (
    id INTEGER NOT NULL DEFAULT nextval('addons_id_seq'::regclass),
    location_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price INTEGER NOT NULL,
    price_unit TEXT NOT NULL DEFAULT 'hour',
    active BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT addons_pkey PRIMARY KEY (id)
);

-- Table: admin_logs
CREATE TABLE IF NOT EXISTS admin_logs (
    id INTEGER NOT NULL DEFAULT nextval('admin_logs_id_seq'::regclass),
    admin_id INTEGER NOT NULL,
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id INTEGER NOT NULL,
    details JSONB NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT admin_logs_pkey PRIMARY KEY (id)
);

-- Table: booking_addons
CREATE TABLE IF NOT EXISTS booking_addons (
    id INTEGER NOT NULL DEFAULT nextval('booking_addons_id_seq'::regclass),
    booking_id INTEGER NOT NULL,
    addon_id INTEGER NOT NULL,
    CONSTRAINT booking_addons_pkey PRIMARY KEY (id)
);

-- Table: booking_edit_history
CREATE TABLE IF NOT EXISTS booking_edit_history (
    id INTEGER NOT NULL DEFAULT nextval('booking_edit_history_id_seq'::regclass),
    booking_id INTEGER NOT NULL,
    editor_id INTEGER NOT NULL,
    edited_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    previous_data JSONB NOT NULL,
    new_data JSONB NOT NULL,
    reason TEXT,
    notified_client BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT booking_edit_history_pkey PRIMARY KEY (id)
);

-- Table: challenge_entries
CREATE TABLE IF NOT EXISTS challenge_entries (
    id INTEGER NOT NULL DEFAULT nextval('challenge_entries_id_seq'::regclass),
    challenge_id INTEGER NOT NULL,
    location_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    description TEXT,
    is_winner BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT challenge_entries_pkey PRIMARY KEY (id),
    CONSTRAINT challenge_entries_challenge_id_fkey FOREIGN KEY (challenge_id) REFERENCES weekly_challenges(id)
);

-- Table: concierge_requests
CREATE TABLE IF NOT EXISTS concierge_requests (
    id INTEGER NOT NULL DEFAULT nextval('concierge_requests_id_seq'::regclass),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    location_type TEXT NOT NULL,
    event_type TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    admin_notes TEXT,
    assigned_to INTEGER,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    responded_at TIMESTAMP WITHOUT TIME ZONE,
    budget INTEGER,
    date_needed TEXT,
    preferred_contact_method TEXT DEFAULT 'email',
    CONSTRAINT concierge_requests_pkey PRIMARY KEY (id)
);

-- Table: content_moderation_alerts
CREATE TABLE IF NOT EXISTS content_moderation_alerts (
    id INTEGER NOT NULL DEFAULT nextval('content_moderation_alerts_id_seq'::regclass),
    message_id INTEGER NOT NULL,
    sender_id INTEGER NOT NULL,
    receiver_id INTEGER NOT NULL,
    location_id INTEGER NOT NULL,
    violation_type TEXT NOT NULL,
    detected_patterns TEXT[] NOT NULL,
    confidence INTEGER NOT NULL,
    original_content_hash TEXT,
    resolved BOOLEAN NOT NULL DEFAULT false,
    resolved_by INTEGER,
    resolved_at TIMESTAMP WITHOUT TIME ZONE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT content_moderation_alerts_pkey PRIMARY KEY (id)
);

-- Email Management Tables
CREATE TABLE IF NOT EXISTS email_templates (
    id INTEGER NOT NULL DEFAULT nextval('email_templates_id_seq'::regclass),
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    html_content TEXT,
    text_content TEXT,
    variables JSONB DEFAULT '[]'::jsonb,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    type TEXT,
    recipient_role TEXT,
    CONSTRAINT email_templates_pkey PRIMARY KEY (id),
    CONSTRAINT email_templates_name_key UNIQUE (name)
);

CREATE TABLE IF NOT EXISTS email_events (
    id INTEGER NOT NULL DEFAULT nextval('email_events_id_seq'::regclass),
    message_id TEXT NOT NULL,
    user_id INTEGER,
    recipient_email TEXT NOT NULL,
    template_name TEXT,
    subject TEXT,
    status TEXT NOT NULL DEFAULT 'queued',
    metadata JSONB,
    error_message TEXT,
    sent_at TIMESTAMP WITHOUT TIME ZONE,
    delivered_at TIMESTAMP WITHOUT TIME ZONE,
    opened_at TIMESTAMP WITHOUT TIME ZONE,
    clicked_at TIMESTAMP WITHOUT TIME ZONE,
    bounced_at TIMESTAMP WITHOUT TIME ZONE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT email_events_pkey PRIMARY KEY (id),
    CONSTRAINT email_events_message_id_key UNIQUE (message_id)
);

CREATE TABLE IF NOT EXISTS email_campaigns (
    id INTEGER NOT NULL DEFAULT nextval('email_campaigns_id_seq'::regclass),
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    template_id INTEGER,
    segment_criteria JSONB,
    status TEXT NOT NULL DEFAULT 'draft',
    scheduled_for TIMESTAMP WITHOUT TIME ZONE,
    sent_at TIMESTAMP WITHOUT TIME ZONE,
    recipient_count INTEGER DEFAULT 0,
    open_count INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0,
    bounce_count INTEGER DEFAULT 0,
    created_by INTEGER NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT email_campaigns_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS email_suppression_list (
    id INTEGER NOT NULL DEFAULT nextval('email_suppression_list_id_seq'::regclass),
    email TEXT NOT NULL,
    reason TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT email_suppression_list_pkey PRIMARY KEY (id),
    CONSTRAINT email_suppression_list_email_key UNIQUE (email)
);

CREATE TABLE IF NOT EXISTS email_verification_tokens (
    id INTEGER NOT NULL DEFAULT nextval('email_verification_tokens_id_seq'::regclass),
    user_id INTEGER NOT NULL,
    email TEXT NOT NULL,
    token TEXT NOT NULL,
    expires_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    verified_at TIMESTAMP WITHOUT TIME ZONE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT email_verification_tokens_pkey PRIMARY KEY (id),
    CONSTRAINT email_verification_tokens_token_key UNIQUE (token)
);

-- Forum Tables
CREATE TABLE IF NOT EXISTS forum_likes (
    id INTEGER NOT NULL DEFAULT nextval('forum_likes_id_seq'::regclass),
    user_id INTEGER NOT NULL,
    target_type VARCHAR(20) NOT NULL,
    target_id INTEGER NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT forum_likes_pkey PRIMARY KEY (id),
    CONSTRAINT forum_likes_user_id_target_type_target_id_key UNIQUE (user_id, target_type, target_id),
    CONSTRAINT forum_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Location Management Tables
CREATE TABLE IF NOT EXISTS location_calendar_integrations (
    id INTEGER NOT NULL DEFAULT nextval('location_calendar_integrations_id_seq'::regclass),
    location_id INTEGER NOT NULL,
    google_calendar_id VARCHAR(255),
    google_refresh_token TEXT,
    sync_enabled BOOLEAN DEFAULT true,
    last_synced_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    owner_id INTEGER,
    CONSTRAINT location_calendar_integrations_pkey PRIMARY KEY (id),
    CONSTRAINT location_calendar_integrations_location_id_key UNIQUE (location_id),
    CONSTRAINT location_calendar_integrations_location_id_fkey FOREIGN KEY (location_id) REFERENCES locations(id)
);

CREATE TABLE IF NOT EXISTS location_edit_history (
    id INTEGER NOT NULL DEFAULT nextval('location_edit_history_id_seq'::regclass),
    location_id INTEGER NOT NULL,
    editor_id INTEGER NOT NULL,
    edited_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    changed_fields TEXT[] NOT NULL,
    previous_data JSONB NOT NULL,
    new_data JSONB NOT NULL,
    edit_type TEXT NOT NULL,
    reason TEXT,
    ip_address TEXT,
    CONSTRAINT location_edit_history_pkey PRIMARY KEY (id)
);

-- Marketing Tables
CREATE TABLE IF NOT EXISTS marketing_subscriptions (
    id INTEGER NOT NULL DEFAULT nextval('marketing_subscriptions_id_seq'::regclass),
    email TEXT NOT NULL,
    user_id INTEGER,
    status TEXT NOT NULL DEFAULT 'active',
    subscribed_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    unsubscribed_at TIMESTAMP WITHOUT TIME ZONE,
    source TEXT,
    preferences JSONB DEFAULT '{}'::jsonb,
    CONSTRAINT marketing_subscriptions_pkey PRIMARY KEY (id),
    CONSTRAINT marketing_subscriptions_email_key UNIQUE (email)
);

-- Messaging Tables
CREATE TABLE IF NOT EXISTS message_conversations (
    id INTEGER NOT NULL DEFAULT nextval('message_conversations_id_seq'::regclass),
    participant1_id INTEGER NOT NULL,
    participant2_id INTEGER NOT NULL,
    location_id INTEGER NOT NULL,
    last_message_at TIMESTAMP WITHOUT TIME ZONE,
    participant1_unread INTEGER NOT NULL DEFAULT 0,
    participant2_unread INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT message_conversations_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS messages (
    id INTEGER NOT NULL DEFAULT nextval('messages_id_seq'::regclass),
    conversation_id INTEGER NOT NULL,
    sender_id INTEGER NOT NULL,
    receiver_id INTEGER NOT NULL,
    location_id INTEGER NOT NULL,
    message TEXT NOT NULL,
    attachment TEXT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    sent_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    custom_offer JSONB,
    quick_reply_type TEXT,
    moderation_status TEXT DEFAULT 'pending',
    moderated_at TIMESTAMP WITHOUT TIME ZONE,
    original_message TEXT,
    violation_count INTEGER DEFAULT 0,
    sanitized_message TEXT,
    CONSTRAINT messages_pkey PRIMARY KEY (id)
);

-- Migrations Table
CREATE TABLE IF NOT EXISTS migrations (
    id INTEGER NOT NULL DEFAULT nextval('migrations_id_seq'::regclass),
    name VARCHAR(255) NOT NULL,
    executed_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT migrations_pkey PRIMARY KEY (id),
    CONSTRAINT migrations_name_key UNIQUE (name)
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER NOT NULL DEFAULT nextval('notifications_id_seq'::regclass),
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN NOT NULL DEFAULT false,
    link TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT notifications_pkey PRIMARY KEY (id)
);

-- Password Reset Tables
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id INTEGER NOT NULL DEFAULT nextval('password_reset_tokens_id_seq'::regclass),
    user_id INTEGER NOT NULL,
    token TEXT NOT NULL,
    expires_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (id),
    CONSTRAINT password_reset_tokens_token_key UNIQUE (token)
);

-- Reviews Tables
CREATE TABLE IF NOT EXISTS review_requirements (
    id INTEGER NOT NULL DEFAULT nextval('review_requirements_id_seq'::regclass),
    booking_id INTEGER NOT NULL,
    client_can_review BOOLEAN NOT NULL DEFAULT false,
    host_can_review BOOLEAN NOT NULL DEFAULT false,
    client_reviewed BOOLEAN NOT NULL DEFAULT false,
    host_reviewed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    booking_end_date TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    CONSTRAINT review_requirements_pkey PRIMARY KEY (id),
    CONSTRAINT review_requirements_booking_id_key UNIQUE (booking_id)
);

CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER NOT NULL DEFAULT nextval('reviews_id_seq'::regclass),
    location_id INTEGER NOT NULL,
    booking_id INTEGER NOT NULL,
    reviewer_id INTEGER NOT NULL,
    reviewed_user_id INTEGER NOT NULL,
    rating INTEGER NOT NULL,
    comment TEXT,
    reviewer_type TEXT NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT reviews_pkey PRIMARY KEY (id)
);

-- Saved Locations Tables
CREATE TABLE IF NOT EXISTS saved_locations (
    id INTEGER NOT NULL DEFAULT nextval('saved_locations_id_seq'::regclass),
    user_id INTEGER NOT NULL,
    location_id INTEGER NOT NULL,
    folder_id INTEGER,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT saved_locations_pkey PRIMARY KEY (id),
    CONSTRAINT saved_locations_folder_id_fkey FOREIGN KEY (folder_id) REFERENCES location_folders(id)
);

-- Secret Corners Tables
CREATE TABLE IF NOT EXISTS secret_corners_applications (
    id INTEGER NOT NULL DEFAULT nextval('secret_corners_applications_id_seq'::regclass),
    user_id INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    instagram_handle TEXT,
    portfolio_url TEXT,
    bio TEXT,
    reason TEXT,
    photography_style TEXT,
    years_experience INTEGER,
    equipment TEXT,
    sample_images TEXT[],
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    reviewed_at TIMESTAMP WITHOUT TIME ZONE,
    reviewed_by INTEGER,
    review_notes TEXT,
    CONSTRAINT secret_corners_applications_pkey PRIMARY KEY (id),
    CONSTRAINT secret_corners_applications_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS secret_locations (
    id INTEGER NOT NULL DEFAULT nextval('secret_locations_id_seq'::regclass),
    name TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    best_time TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    equipment_needed TEXT[],
    images TEXT[] NOT NULL,
    tags TEXT[] NOT NULL,
    submitted_by INTEGER NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    is_featured BOOLEAN NOT NULL DEFAULT false,
    tips TEXT[],
    access_info TEXT,
    parking_info TEXT,
    safety_notes TEXT,
    CONSTRAINT secret_locations_pkey PRIMARY KEY (id)
);

-- Session Table
CREATE TABLE IF NOT EXISTS session (
    sid VARCHAR NOT NULL,
    sess JSON NOT NULL,
    expire TIMESTAMP(6) NOT NULL,
    CONSTRAINT session_pkey PRIMARY KEY (sid)
);

-- Site Settings Table
CREATE TABLE IF NOT EXISTS site_settings (
    id INTEGER NOT NULL DEFAULT nextval('site_settings_id_seq'::regclass),
    key TEXT NOT NULL,
    value TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'string',
    description TEXT,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    updated_by INTEGER,
    CONSTRAINT site_settings_pkey PRIMARY KEY (id),
    CONSTRAINT site_settings_key_key UNIQUE (key)
);

-- Spotlight Locations Table
CREATE TABLE IF NOT EXISTS spotlight_locations (
    id INTEGER NOT NULL DEFAULT nextval('spotlight_locations_id_seq'::regclass),
    location_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL,
    featured_image TEXT NOT NULL,
    start_date TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    end_date TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    click_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    cta_text TEXT DEFAULT 'View Location',
    badge_text TEXT,
    badge_color TEXT,
    CONSTRAINT spotlight_locations_pkey PRIMARY KEY (id)
);

-- Support Emails Table
CREATE TABLE IF NOT EXISTS support_emails (
    id INTEGER NOT NULL DEFAULT nextval('support_emails_id_seq'::regclass),
    user_id INTEGER,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    category TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open',
    priority TEXT DEFAULT 'normal',
    reference_id VARCHAR(10) NOT NULL,
    admin_notes TEXT,
    assigned_to INTEGER,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    resolved_at TIMESTAMP WITHOUT TIME ZONE,
    first_response_at TIMESTAMP WITHOUT TIME ZONE,
    resolution_summary TEXT,
    user_satisfaction INTEGER,
    CONSTRAINT support_emails_pkey PRIMARY KEY (id),
    CONSTRAINT support_emails_reference_id_key UNIQUE (reference_id)
);

-- User Email Preferences Table
CREATE TABLE IF NOT EXISTS user_email_preferences (
    id INTEGER NOT NULL DEFAULT nextval('user_email_preferences_id_seq'::regclass),
    user_id INTEGER NOT NULL,
    booking_confirmations BOOLEAN NOT NULL DEFAULT true,
    booking_reminders BOOLEAN NOT NULL DEFAULT true,
    messages BOOLEAN NOT NULL DEFAULT true,
    reviews BOOLEAN NOT NULL DEFAULT true,
    marketing BOOLEAN NOT NULL DEFAULT true,
    newsletter BOOLEAN NOT NULL DEFAULT true,
    security_alerts BOOLEAN NOT NULL DEFAULT true,
    feature_updates BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT user_email_preferences_pkey PRIMARY KEY (id),
    CONSTRAINT user_email_preferences_user_id_key UNIQUE (user_id)
);

-- User Reports Table
CREATE TABLE IF NOT EXISTS user_reports (
    id INTEGER NOT NULL DEFAULT nextval('user_reports_id_seq'::regclass),
    reporter_id INTEGER NOT NULL,
    reported_user_id INTEGER NOT NULL,
    reason TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    resolved_at TIMESTAMP WITHOUT TIME ZONE,
    resolved_by INTEGER,
    admin_notes TEXT,
    CONSTRAINT user_reports_pkey PRIMARY KEY (id)
);

-- Create Indexes
CREATE INDEX idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX idx_email_events_status ON email_events(status);
CREATE INDEX idx_email_events_user_id ON email_events(user_id);
CREATE INDEX idx_email_events_created_at ON email_events(created_at);
CREATE INDEX idx_email_verification_tokens_token ON email_verification_tokens(token);
CREATE INDEX idx_email_verification_tokens_expires_at ON email_verification_tokens(expires_at);
CREATE INDEX idx_forum_comments_post_id ON forum_comments(post_id);
CREATE INDEX idx_forum_comments_user_id ON forum_comments(user_id);
CREATE INDEX idx_forum_likes_user_target ON forum_likes(user_id, target_type, target_id);
CREATE INDEX idx_forum_posts_category_id ON forum_posts(category_id);
CREATE INDEX idx_forum_posts_user_id ON forum_posts(user_id);
CREATE INDEX idx_guide_categories_slug ON guide_categories(slug);
CREATE INDEX idx_guides_category_id ON guides(category_id);
CREATE INDEX idx_guides_featured ON guides(featured);
CREATE INDEX idx_guides_slug ON guides(slug);
CREATE INDEX idx_guides_status ON guides(status);
CREATE INDEX idx_marketing_subscriptions_email ON marketing_subscriptions(email);
CREATE INDEX idx_marketing_subscriptions_status ON marketing_subscriptions(status);
CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);
CREATE INDEX "IDX_session_expire" ON session(expire);

-- Grant permissions (adjust as needed for your Neon database user)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_neon_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_neon_user;