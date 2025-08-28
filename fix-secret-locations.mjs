import { createClient } from '@neondatabase/serverless';

// Use environment variables directly without dotenv

// This is a simpler version that uses direct SQL for fixing
async function main() {
  // Connect to the database with direct SQL client
  const sql = createClient({ connectionString: process.env.DATABASE_URL });
  
  try {
    await sql.connect();
    console.log("Connected to database");
    
    // Check if any featured locations have NaN coordinates
    const { rows: invalidRows } = await sql.query(`
      SELECT id, coords, name 
      FROM secret_locations 
      WHERE coords[1]::text = 'NaN' OR coords[2]::text = 'NaN'
    `);
    
    console.log(`Found ${invalidRows.length} locations with invalid coords`);
    
    // Fix invalid coordinates
    if (invalidRows.length > 0) {
      for (const row of invalidRows) {
        console.log(`Fixing location ${row.id} (${row.name}) with invalid coords: ${JSON.stringify(row.coords)}`);
        
        await sql.query(`
          UPDATE secret_locations
          SET coords = ARRAY[34.0522, -118.2437], 
              latitude = '34.0522', 
              longitude = '-118.2437'
          WHERE id = $1
        `, [row.id]);
        
        console.log(`Fixed location ${row.id}`);
      }
    }
    
    console.log("Database check complete");
  } catch (error) {
    console.error("Error fixing secret locations:", error);
  } finally {
    await sql.end();
  }
}

main();