const { Pool } = require('pg');

async function main() {
  try {
    console.log('Starting Secret Corners migration...');
    
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
    
    console.log('Adding Secret Corners columns to users table...');
    
    // Check if secret_corners_access column exists
    try {
      const result = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'secret_corners_access'
      `);
      
      if (result.rows.length === 0) {
        console.log('Adding secret_corners_access column...');
        await pool.query(`
          ALTER TABLE users ADD COLUMN secret_corners_access TEXT 
          NOT NULL DEFAULT 'not_applied' 
          CHECK (secret_corners_access IN ('not_applied', 'pending', 'approved', 'rejected'))
        `);
      } else {
        console.log('Column secret_corners_access already exists, skipping...');
      }

      // Check/add secret_corners_application column
      const applicationResult = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'secret_corners_application'
      `);
      
      if (result.rows.length === 0) {
        console.log('Adding secret_corners_application column...');
        await pool.query(`
          ALTER TABLE users ADD COLUMN secret_corners_application TEXT
        `);
      } else {
        console.log('Column secret_corners_application already exists, skipping...');
      }

      // Check/add secret_corners_applied_at column
      result = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'secret_corners_applied_at'
      `);
      
      if (result.rows.length === 0) {
        console.log('Adding secret_corners_applied_at column...');
        await pool.query(`
          ALTER TABLE users ADD COLUMN secret_corners_applied_at TIMESTAMP
        `);
      } else {
        console.log('Column secret_corners_applied_at already exists, skipping...');
      }

      // Check/add secret_corners_approved_at column
      result = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'secret_corners_approved_at'
      `);
      
      if (result.rows.length === 0) {
        console.log('Adding secret_corners_approved_at column...');
        await pool.query(`
          ALTER TABLE users ADD COLUMN secret_corners_approved_at TIMESTAMP
        `);
      } else {
        console.log('Column secret_corners_approved_at already exists, skipping...');
      }

      // Check/add secret_corners_approved_by column
      result = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'secret_corners_approved_by'
      `);
      
      if (result.rows.length === 0) {
        console.log('Adding secret_corners_approved_by column...');
        await pool.query(`
          ALTER TABLE users ADD COLUMN secret_corners_approved_by INTEGER
        `);
      } else {
        console.log('Column secret_corners_approved_by already exists, skipping...');
      }

      // Check/add secret_corners_rejection_reason column
      result = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'secret_corners_rejection_reason'
      `);
      
      if (result.rows.length === 0) {
        console.log('Adding secret_corners_rejection_reason column...');
        await pool.query(`
          ALTER TABLE users ADD COLUMN secret_corners_rejection_reason TEXT
        `);
      } else {
        console.log('Column secret_corners_rejection_reason already exists, skipping...');
      }

      console.log('Migration completed successfully');
      await pool.end();
      process.exit(0);
      
    } catch (error) {
      console.error('Migration failed:', error);
      process.exit(1);
    }
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

main();