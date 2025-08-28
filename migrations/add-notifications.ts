import { db } from "../server/db";
import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  relatedId: integer("related_id"),
  relatedType: text("related_type"),
  actionUrl: text("action_url"),
});

async function createNotificationsTable() {
  try {
    console.log("Creating notifications table...");
    
    // Check if table exists first and drop it so we can recreate with the correct schema
    const tableExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'notifications'
      );
    `);
    
    if (tableExists.rows[0].exists) {
      console.log("Notifications table already exists, dropping and recreating it");
      await db.execute(sql`DROP TABLE IF EXISTS notifications;`);
    }
    
    // Create the notifications table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        read BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        related_id INTEGER,
        related_type TEXT,
        action_url TEXT
      );
    `);
    
    console.log("Notifications table created successfully!");
  } catch (error) {
    console.error("Error creating notifications table:", error);
    throw error;
  }
}

async function runMigration() {
  try {
    await createNotificationsTable();
    console.log("Migration completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    process.exit(0);
  }
}

runMigration();