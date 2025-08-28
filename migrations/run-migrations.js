import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  console.log('Starting database migrations...');
  
  const sql_url = process.env.DATABASE_URL;
  if (!sql_url) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  console.log('Connecting to database...');
  const pool = new Pool({
    connectionString: sql_url,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    // Check if migrations table exists
    console.log('Checking for migrations table...');
    const checkTableResult = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'migrations'
      );
    `);
    
    const tableExists = checkTableResult.rows[0].exists;
    
    if (!tableExists) {
      console.log('Creating migrations table...');
      await pool.query(`
        CREATE TABLE migrations (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL UNIQUE,
          executed_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
      `);
    }
    
    // Read all SQL migration files
    const files = fs.readdirSync(__dirname)
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    console.log(`Found ${files.length} migration files`);
    
    // Check which ones have been executed
    const migrationsResult = await pool.query(`
      SELECT name FROM migrations;
    `);
    
    const executedMigrations = migrationsResult.rows.map(row => row.name);
    console.log(`${executedMigrations.length} migrations have already been executed`);
    
    // Execute pending migrations
    for (const file of files) {
      if (executedMigrations.includes(file)) {
        console.log(`Skipping migration ${file} - already executed`);
        continue;
      }
      
      console.log(`Executing migration ${file}...`);
      const sql = fs.readFileSync(path.join(__dirname, file), 'utf8');
      
      // Start a transaction for each migration
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        
        // Execute the migration
        await client.query(sql);
        
        // Record the migration
        await client.query(`
          INSERT INTO migrations (name) VALUES ($1);
        `, [file]);
        
        await client.query('COMMIT');
        console.log(`Migration ${file} executed successfully`);
      } catch (error) {
        await client.query('ROLLBACK');
        console.error(`Error executing migration ${file}:`, error);
        throw error;
      } finally {
        client.release();
      }
    }
    
    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
  
  process.exit(0);
}

runMigrations();