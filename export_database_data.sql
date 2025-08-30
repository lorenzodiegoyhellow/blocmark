-- Blocmark Database Data Export
-- Generated: 2025-08-28
-- 
-- This script exports all existing data from your Replit database
-- Run this to backup any data you want to preserve before migration
-- 
-- To use:
-- 1. Connect to your Replit database
-- 2. Run: pg_dump $DATABASE_URL --data-only --no-owner --no-privileges > blocmark_data_backup.sql
-- 
-- Or run these individual queries to export specific tables:

-- Export Users (if any exist)
COPY (SELECT * FROM users) TO '/tmp/users_export.csv' WITH CSV HEADER;

-- Export Locations (if any exist)
COPY (SELECT * FROM locations) TO '/tmp/locations_export.csv' WITH CSV HEADER;

-- Export Bookings (if any exist)
COPY (SELECT * FROM bookings) TO '/tmp/bookings_export.csv' WITH CSV HEADER;

-- Export Reviews (if any exist)
COPY (SELECT * FROM reviews) TO '/tmp/reviews_export.csv' WITH CSV HEADER;

-- Export Messages (if any exist)
COPY (SELECT * FROM messages) TO '/tmp/messages_export.csv' WITH CSV HEADER;

-- Export Site Settings (important to preserve)
COPY (SELECT * FROM site_settings) TO '/tmp/site_settings_export.csv' WITH CSV HEADER;

-- Export Email Templates (important to preserve)
COPY (SELECT * FROM email_templates) TO '/tmp/email_templates_export.csv' WITH CSV HEADER;

-- Export Guides (if any exist)
COPY (SELECT * FROM guides) TO '/tmp/guides_export.csv' WITH CSV HEADER;

-- Export Guide Categories (if any exist)
COPY (SELECT * FROM guide_categories) TO '/tmp/guide_categories_export.csv' WITH CSV HEADER;

-- Alternative: Export as INSERT statements
-- This creates INSERT statements that can be run directly in the new database

-- Get INSERT statements for critical configuration tables
-- Run these queries in psql or database client to generate INSERT statements:

-- Site Settings INSERT statements
SELECT 'INSERT INTO site_settings (key, value, type, description, updated_at) VALUES (' ||
       quote_literal(key) || ', ' ||
       quote_literal(value) || ', ' ||
       quote_literal(type) || ', ' ||
       COALESCE(quote_literal(description), 'NULL') || ', ' ||
       quote_literal(updated_at::text) || ');'
FROM site_settings;

-- Email Templates INSERT statements
SELECT 'INSERT INTO email_templates (name, subject, html_content, text_content, variables, active, type, recipient_role) VALUES (' ||
       quote_literal(name) || ', ' ||
       quote_literal(subject) || ', ' ||
       COALESCE(quote_literal(html_content), 'NULL') || ', ' ||
       COALESCE(quote_literal(text_content), 'NULL') || ', ' ||
       quote_literal(variables::text) || ', ' ||
       active || ', ' ||
       COALESCE(quote_literal(type), 'NULL') || ', ' ||
       COALESCE(quote_literal(recipient_role), 'NULL') || ');'
FROM email_templates;

-- Quick backup command for entire database (structure + data):
-- pg_dump $DATABASE_URL > blocmark_full_backup_$(date +%Y%m%d_%H%M%S).sql

-- Quick backup command for data only:
-- pg_dump $DATABASE_URL --data-only --no-owner --no-privileges > blocmark_data_$(date +%Y%m%d_%H%M%S).sql

-- To restore data in Neon after schema creation:
-- psql "postgres://[user]:[password]@[host].neon.tech:[port]/[database]?sslmode=require" < blocmark_data_backup.sql