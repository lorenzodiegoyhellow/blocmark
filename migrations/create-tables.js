import { Pool } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createTables() {
  console.log('Starting database table creation...');
  
  const sql_url = process.env.DATABASE_URL;
  if (!sql_url) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  console.log('Connecting to database...');
  const pool = new Pool({ connectionString: sql_url });

  try {
    // Read the main schema file
    const schemaPath = path.join(__dirname, '0000_material_prima.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Creating tables...');
    
    // Split the SQL by statement-breakpoint
    const statements = sql.split('--> statement-breakpoint').map(stmt => stmt.trim()).filter(stmt => stmt);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`Executing statement ${i + 1}/${statements.length}...`);
        try {
          await pool.query(statement);
          console.log(`Statement ${i + 1} executed successfully`);
        } catch (error) {
          if (error.message.includes('already exists')) {
            console.log(`Statement ${i + 1} skipped - table already exists`);
          } else {
            console.error(`Error in statement ${i + 1}:`, error.message);
            throw error;
          }
        }
      }
    }
    
    console.log('All tables created successfully!');
    
    // Test if users table exists
    const result = await pool.query('SELECT COUNT(*) as count FROM users');
    console.log(`Users table created with ${result.rows[0].count} rows`);
    
  } catch (error) {
    console.error('Table creation failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

createTables().catch(console.error);
