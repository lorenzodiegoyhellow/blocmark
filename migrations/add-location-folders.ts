import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { sql } from "drizzle-orm";

async function createLocationFoldersTable() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);

  console.log("Creating location_folders table...");
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS location_folders (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(50) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
    )
  `);

  console.log("Adding folder_id column to saved_locations table...");
  await db.execute(sql`
    ALTER TABLE saved_locations
    ADD COLUMN IF NOT EXISTS folder_id INTEGER NULL REFERENCES location_folders(id) ON DELETE SET NULL
  `);

  await pool.end();
  console.log("Migration completed successfully.");
}

async function runMigration() {
  try {
    await createLocationFoldersTable();
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

runMigration();