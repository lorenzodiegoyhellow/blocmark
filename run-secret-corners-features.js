// Script to run the Secret Corners features migration
import { exec } from 'child_process';

console.log('Running Secret Corners features migration...');

// Run the migration using tsx for TypeScript support
exec('npx tsx migrations/secret-corners-features.ts', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  
  if (stderr) {
    console.error(`Error: ${stderr}`);
    return;
  }
  
  console.log(stdout);
  console.log('Migration completed successfully!');
});