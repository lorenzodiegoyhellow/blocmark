import { db } from "../server/db";
import { sql } from "drizzle-orm";

// Migration script to create the tables for Secret Corners new features
async function main() {
  try {
    console.log("Starting Secret Corners features migration...");

    // Create forum categories table
    console.log("Creating forum_categories table...");
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS forum_categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        description TEXT NOT NULL,
        "order" INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    // Create forum posts table
    console.log("Creating forum_posts table...");
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS forum_posts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        category_id INTEGER NOT NULL REFERENCES forum_categories(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        likes INTEGER NOT NULL DEFAULT 0,
        views INTEGER NOT NULL DEFAULT 0,
        is_pinned BOOLEAN NOT NULL DEFAULT false,
        is_locked BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP
      )
    `);

    // Create forum comments table
    console.log("Creating forum_comments table...");
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS forum_comments (
        id SERIAL PRIMARY KEY,
        post_id INTEGER NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL,
        parent_id INTEGER,
        content TEXT NOT NULL,
        likes INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP
      )
    `);

    // Add self-reference to forum_comments table
    console.log("Adding self-reference to forum_comments table...");
    await db.execute(sql`
      ALTER TABLE forum_comments 
      ADD CONSTRAINT fk_forum_comments_parent 
      FOREIGN KEY (parent_id) 
      REFERENCES forum_comments(id) 
      ON DELETE SET NULL
    `);

    // Create forum likes table
    console.log("Creating forum_likes table...");
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS forum_likes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        item_type TEXT NOT NULL CHECK (item_type IN ('post', 'comment')),
        item_id INTEGER NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        UNIQUE(user_id, item_type, item_id)
      )
    `);

    // Create weekly challenges table
    console.log("Creating weekly_challenges table...");
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS weekly_challenges (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        start_date TIMESTAMP NOT NULL,
        end_date TIMESTAMP NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_by INTEGER NOT NULL,
        winning_location_id INTEGER,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    // Create challenge entries table
    console.log("Creating challenge_entries table...");
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS challenge_entries (
        id SERIAL PRIMARY KEY,
        challenge_id INTEGER NOT NULL REFERENCES weekly_challenges(id) ON DELETE CASCADE,
        location_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        description TEXT,
        is_winner BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    // Create secret location tags table
    console.log("Creating secret_location_tags table...");
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS secret_location_tags (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        category TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    // Create secret location tags map table
    console.log("Creating secret_location_tag_map table...");
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS secret_location_tag_map (
        id SERIAL PRIMARY KEY,
        location_id INTEGER NOT NULL,
        tag_id INTEGER NOT NULL REFERENCES secret_location_tags(id) ON DELETE CASCADE,
        UNIQUE(location_id, tag_id)
      )
    `);

    // Add foreign key references to secret_locations
    console.log("Adding foreign key references to challenge_entries and secret_location_tag_map tables...");
    await db.execute(sql`
      ALTER TABLE challenge_entries 
      ADD CONSTRAINT fk_challenge_entries_location 
      FOREIGN KEY (location_id) 
      REFERENCES secret_locations(id) 
      ON DELETE CASCADE
    `);

    await db.execute(sql`
      ALTER TABLE secret_location_tag_map 
      ADD CONSTRAINT fk_secret_location_tag_map_location 
      FOREIGN KEY (location_id) 
      REFERENCES secret_locations(id) 
      ON DELETE CASCADE
    `);

    // Create initial forum categories
    console.log("Creating initial forum categories...");
    await db.execute(sql`
      INSERT INTO forum_categories (name, slug, description, "order")
      VALUES 
        ('Tips & Tricks', 'tips-tricks', 'Share your photography and exploration tips with the community', 1),
        ('Location Requests', 'location-requests', 'Looking for a specific type of location? Ask here!', 2),
        ('Behind the Scenes', 'behind-scenes', 'Share your experiences and stories from your shoots', 3),
        ('Gear Talk', 'gear-talk', 'Discuss photography and videography equipment', 4),
        ('Travel and Access', 'travel-access', 'Information about transportation and accessibility', 5),
        ('Weekly Challenges', 'weekly-challenges', 'Participate in our weekly photography challenges', 6)
      ON CONFLICT (slug) DO NOTHING
    `);

    // Create initial secret location tags
    console.log("Creating initial location tags...");
    await db.execute(sql`
      INSERT INTO secret_location_tags (name, category)
      VALUES 
        ('Sunset', 'Time'),
        ('Sunrise', 'Time'),
        ('Night', 'Time'),
        ('Urban', 'Environment'),
        ('Nature', 'Environment'),
        ('Mountains', 'Environment'),
        ('Beach', 'Environment'),
        ('Desert', 'Environment'),
        ('Forest', 'Environment'),
        ('Lake', 'Environment'),
        ('Waterfall', 'Environment'),
        ('Industrial', 'Style'),
        ('Abandoned', 'Style'),
        ('Historic', 'Style'),
        ('Modern', 'Style'),
        ('Panoramic', 'Feature'),
        ('Hidden Gem', 'Feature'),
        ('Easy Access', 'Access'),
        ('Moderate Hike', 'Access'),
        ('Difficult Terrain', 'Access'),
        ('Permit Required', 'Access')
      ON CONFLICT (name) DO NOTHING
    `);

    console.log("Migration completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => {
    console.log("Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Unhandled error in migration:", error);
    process.exit(1);
  });