-- Add Secret Corners columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS secret_corners_access TEXT NOT NULL DEFAULT 'not_applied' CHECK (secret_corners_access IN ('not_applied', 'pending', 'approved', 'rejected'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS secret_corners_application TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS secret_corners_applied_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS secret_corners_approved_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS secret_corners_approved_by INTEGER;
ALTER TABLE users ADD COLUMN IF NOT EXISTS secret_corners_rejection_reason TEXT;