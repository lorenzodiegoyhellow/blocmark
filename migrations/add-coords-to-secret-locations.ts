import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import { secretLocations } from "../shared/schema";
import { jsonb, pgTable } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

/**
 * Migration to add the coords column to the secret_locations table
 * This will add a JSONB field to store [latitude, longitude] pairs for Leaflet map compatibility
 */
async function addCoordsToSecretLocationsTable() {
  console.log("Starting migration: Add coords field to secret_locations table");
  
  // Create DB connection
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });
  
  try {
    await pool.query(`
      ALTER TABLE secret_locations 
      ADD COLUMN IF NOT EXISTS coords JSONB;
    `);
    
    console.log("Successfully added coords field to secret_locations table");
    
    // Now update existing records to populate the coords field from latitude and longitude
    console.log("Updating existing records with coords data...");
    
    await pool.query(`
      UPDATE secret_locations
      SET coords = jsonb_build_array(
        CAST(latitude AS NUMERIC), 
        CAST(longitude AS NUMERIC)
      )
      WHERE coords IS NULL AND latitude IS NOT NULL AND longitude IS NOT NULL;
    `);
    
    console.log("Successfully updated existing records with coords data");
  } catch (error) {
    console.error("Error in migration:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

async function runMigration() {
  try {
    await addCoordsToSecretLocationsTable();
    console.log("Migration completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

// Run the migration if this file is executed directly
if (require.main === module) {
  runMigration();
}