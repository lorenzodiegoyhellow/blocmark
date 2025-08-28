import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function createSpotlightLocationsTable() {
  console.log("Creating spotlight_locations table...");
  
  try {
    // Create the spotlight_locations table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS spotlight_locations (
        id SERIAL PRIMARY KEY,
        location_id INTEGER NOT NULL,
        start_date TIMESTAMP NOT NULL DEFAULT NOW(),
        end_date TIMESTAMP NOT NULL,
        spotlight_order INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        created_by INTEGER NOT NULL
      );
    `);
    
    console.log("Successfully created spotlight_locations table");
  } catch (error) {
    console.error("Error creating spotlight_locations table:", error);
    throw error;
  }
}

async function runMigration() {
  try {
    console.log("Starting migration: Add Spotlight Locations");
    await createSpotlightLocationsTable();
    console.log("Migration completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

runMigration();