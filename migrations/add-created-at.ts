import { db } from "../server/db";
import { sql } from "drizzle-orm";

// Migrate users table to add createdAt column
async function addCreatedAtColumn() {
  try {
    console.log("Adding createdAt column to users table...");
    
    // Check if createdAt column already exists
    const checkResult = await db.execute(sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'users' AND column_name = 'created_at'
    `);
    
    if (checkResult.rows.length === 0) {
      // Add the column
      await db.execute(sql`
        ALTER TABLE users
        ADD COLUMN created_at TIMESTAMP DEFAULT NOW() NOT NULL
      `);
      console.log("Successfully added createdAt column to users table");
    } else {
      console.log("createdAt column already exists in users table");
    }
  } catch (error) {
    console.error("Error adding createdAt column:", error);
  }
}

// Run migrations
async function runMigrations() {
  console.log("Running migrations...");
  
  // Execute migration steps
  await addCreatedAtColumn();
  
  console.log("Migrations completed!");
  process.exit(0);
}

runMigrations().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});