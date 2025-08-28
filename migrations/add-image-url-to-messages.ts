import { Pool } from "pg";

/**
 * Migration to add the imageUrl column to the messages table
 */
async function addImageUrlToMessagesTable() {
  console.log("Starting migration: Add imageUrl column to messages table");
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    // Check if the column already exists
    const checkColumnQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'messages' AND column_name = 'image_url';
    `;
    
    const checkResult = await pool.query(checkColumnQuery);
    
    if (checkResult.rows.length === 0) {
      // Column doesn't exist, so add it
      console.log("Adding image_url column to messages table");
      
      const addColumnQuery = `
        ALTER TABLE messages
        ADD COLUMN image_url TEXT;
      `;
      
      await pool.query(addColumnQuery);
      console.log("Successfully added image_url column to messages table");
    } else {
      console.log("image_url column already exists in messages table");
    }
  } catch (error) {
    console.error("Error during migration:", error);
    throw error;
  } finally {
    await pool.end();
  }

  console.log("Migration completed: Add imageUrl column to messages table");
}

async function runMigration() {
  try {
    await addImageUrlToMessagesTable();
    console.log("All migrations completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

runMigration();