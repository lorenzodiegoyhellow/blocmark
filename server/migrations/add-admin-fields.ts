import { db } from "../db";
import { users, locations, bookings, adminLogs } from "../../shared/schema";
import { sql } from "drizzle-orm";

async function runMigration() {
  try {
    console.log("Starting database migration for admin dashboard features...");

    // Add status columns to users table
    console.log("Adding status fields to users table...");
    await db.execute(sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
      ADD COLUMN IF NOT EXISTS status_reason TEXT,
      ADD COLUMN IF NOT EXISTS status_updated_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS status_updated_by INTEGER
    `);

    // Add status columns to locations table
    console.log("Adding status fields to locations table...");
    await db.execute(sql`
      ALTER TABLE locations 
      ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending',
      ADD COLUMN IF NOT EXISTS status_reason TEXT,
      ADD COLUMN IF NOT EXISTS status_updated_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS status_updated_by INTEGER
    `);

    // Add refund columns to bookings table
    console.log("Adding refund fields to bookings table...");
    await db.execute(sql`
      ALTER TABLE bookings 
      ADD COLUMN IF NOT EXISTS refund_amount INTEGER,
      ADD COLUMN IF NOT EXISTS refund_reason TEXT,
      ADD COLUMN IF NOT EXISTS refund_requested_by INTEGER,
      ADD COLUMN IF NOT EXISTS refund_requested_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS refund_processed_by INTEGER,
      ADD COLUMN IF NOT EXISTS refund_processed_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS last_edited_by INTEGER,
      ADD COLUMN IF NOT EXISTS last_edited_at TIMESTAMP
    `);

    // Update enum values for booking status
    console.log("Updating booking status enum to include refund statuses...");
    await db.execute(sql`
      ALTER TABLE bookings
      DROP CONSTRAINT IF EXISTS bookings_status_check;
      
      ALTER TABLE bookings
      ADD CONSTRAINT bookings_status_check 
      CHECK (status IN ('pending', 'confirmed', 'cancelled', 'rejected', 'payment_pending', 'refund_pending', 'refunded'))
    `);

    // Create admin_logs table
    console.log("Creating admin_logs table...");
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS admin_logs (
        id SERIAL PRIMARY KEY,
        admin_id INTEGER NOT NULL,
        action TEXT NOT NULL,
        target_type TEXT NOT NULL,
        target_id INTEGER NOT NULL,
        details JSONB NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
}

// Run the migration
runMigration().then(() => {
  console.log("Migration script finished executing");
  process.exit(0);
}).catch(error => {
  console.error("Migration script failed:", error);
  process.exit(1);
});