// Using direct Postgres client instead of drizzle for migration
import { Pool } from 'pg';

// Use DATABASE_URL from environment
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function createSecretLocationsTable() {
  console.log("Creating secret_locations table...");
  const client = await pool.connect();
  
  try {
    // Create the secret_locations table directly with SQL
    await client.query(`
      CREATE TABLE IF NOT EXISTS secret_locations (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        location TEXT NOT NULL,
        category TEXT NOT NULL,
        latitude TEXT NOT NULL,
        longitude TEXT NOT NULL,
        main_image TEXT NOT NULL,
        additional_images TEXT[],
        best_time_of_day TEXT,
        recommended_equipment TEXT,
        composition_tip TEXT,
        comments INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'pending',
        status_reason TEXT,
        status_updated_at TIMESTAMP,
        status_updated_by INTEGER,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    
    console.log("Successfully created secret_locations table");
  } catch (error) {
    console.error("Error creating secret_locations table:", error);
    throw error;
  } finally {
    client.release();
  }
}

async function runMigration() {
  try {
    console.log("Starting migration: Add Secret Locations");
    await createSecretLocationsTable();
    console.log("Migration completed successfully");
    await pool.end(); // Close the pool
  } catch (error) {
    console.error("Migration failed:", error);
    await pool.end(); // Make sure to close the pool on error
    process.exit(1);
  }
}

runMigration().catch(err => {
  console.error("Unhandled error:", err);
  process.exit(1);
});