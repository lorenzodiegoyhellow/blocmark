#!/usr/bin/env node

import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

async function runMigrations() {
  try {
    console.log('🚀 Starting database migrations...');
    
    // Read and execute SQL migrations in order
    const sqlFiles = [
      '0000_material_prima.sql',
      '20250411-add-secret-corners.sql'
    ];
    
    for (const file of sqlFiles) {
      const filePath = path.join(__dirname, file);
      if (fs.existsSync(filePath)) {
        console.log(`📝 Running ${file}...`);
        const sql = fs.readFileSync(filePath, 'utf8');
        await pool.query(sql);
        console.log(`✅ ${file} completed`);
      }
    }
    
    // Run TypeScript migrations
    const tsFiles = [
      'add-created-at.ts',
      'add-notifications.ts',
      'add-spotlight-locations.ts',
      'add-secret-locations.ts',
      'add-coords-to-secret-locations.ts',
      'add-image-url-to-messages.ts',
      'add-location-folders.ts',
      'secret-corners-features.ts'
    ];
    
    for (const file of tsFiles) {
      const filePath = path.join(__dirname, file);
      if (fs.existsSync(filePath)) {
        console.log(`📝 Running ${file}...`);
        const migration = await import(filePath);
        if (typeof migration.default === 'function') {
          await migration.default(db);
        } else if (typeof migration.up === 'function') {
          await migration.up(db);
        }
        console.log(`✅ ${file} completed`);
      }
    }
    
    console.log('🎉 All migrations completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();
