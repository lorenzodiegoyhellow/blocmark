import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  console.log('Starting Secret Corners database migration...');
  
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
    const migrationFile = 'migrations/20250411-add-secret-corners.sql';
    console.log(`Reading migration file: ${migrationFile}`);
    
    const sql = fs.readFileSync(migrationFile, 'utf8');
    console.log('Migration SQL:');
    console.log(sql);
    
    console.log('Executing migration...');
    await pool.query(sql);
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
  
  process.exit(0);
}

runMigration();