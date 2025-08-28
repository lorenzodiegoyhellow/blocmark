// Tool to create a test Secret Corners application
import { db } from '../db.js';
import { users } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';

async function main() {
  console.log("Checking for existing applications...");
  
  // Get all pending applications
  const pendingApplications = await db
    .select()
    .from(users)
    .where(eq(users.secretCornersAccess, 'pending'));
  
  console.log(`Found ${pendingApplications.length} pending applications`);
  
  if (pendingApplications.length > 0) {
    pendingApplications.forEach(app => {
      console.log(`- User ${app.username} (ID: ${app.id}) applied on ${app.secretCornersAppliedAt}`);
      console.log(`  Application text: ${app.secretCornersApplication}`);
    });
    console.log("No need to create test data");
    return;
  }
  
  // Create a test application
  console.log("Creating a test application...");
  
  // First, find a user who has not applied
  const nonApplicants = await db
    .select()
    .from(users)
    .where(eq(users.secretCornersAccess, 'not_applied'));
  
  if (nonApplicants.length === 0) {
    console.log("No users available to create a test application");
    return;
  }
  
  const testUser = nonApplicants[0];
  console.log(`Using user ${testUser.username} (ID: ${testUser.id}) for test application`);
  
  // Update the user with an application
  const [updatedUser] = await db
    .update(users)
    .set({
      secretCornersAccess: 'pending',
      secretCornersApplication: 'This is a test application for Secret Corners access. I am an experienced photographer and would love to contribute to the platform with my unique perspective and hidden location discoveries.',
      secretCornersAppliedAt: new Date()
    })
    .where(eq(users.id, testUser.id))
    .returning();
  
  console.log("Test application created successfully!");
  console.log(`User ${updatedUser.username} now has a pending application`);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error("Error:", error);
    process.exit(1);
  });