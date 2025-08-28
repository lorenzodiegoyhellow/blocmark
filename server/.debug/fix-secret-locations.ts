import { Database } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { secretLocations } from '@shared/schema';
import { eq } from 'drizzle-orm';

// This is a helper script to fix the featured field in secret_locations
async function main() {
  // Connect to the database
  const db = drizzle(new Database(process.env.DATABASE_URL!));
  
  try {
    console.log("Checking for secret locations with invalid coordinates...");
    
    // Find locations with invalid coordinates
    const locations = await db.select().from(secretLocations);
    
    let fixedCount = 0;
    
    for (const location of locations) {
      // Check if coords is an array with valid numbers
      if (!location.coords || !Array.isArray(location.coords)) {
        console.log(`Location ${location.id} has invalid coords format: ${JSON.stringify(location.coords)}`);
        continue;
      }
      
      const [lat, lng] = location.coords;
      
      // Check if either coordinate is NaN
      if (isNaN(lat) || isNaN(lng)) {
        console.log(`Location ${location.id} has NaN coords: [${lat}, ${lng}]`);
        
        // Fix by setting to default coordinates
        await db
          .update(secretLocations)
          .set({ 
            coords: [34.0522, -118.2437], // Default to Los Angeles coordinates
            latitude: "34.0522",
            longitude: "-118.2437"
          })
          .where(eq(secretLocations.id, location.id));
        
        console.log(`Fixed location ${location.id} by setting default coordinates`);
        fixedCount++;
      }
    }
    
    console.log(`Fixed ${fixedCount} locations with invalid coordinates`);
    console.log("Database check complete");
  } catch (error) {
    console.error("Error fixing secret locations:", error);
  }
}

main();