import { storage } from './server/storage.js';

async function testSpotlightCreation() {
  try {
    console.log('Testing spotlight creation with ISO date strings...');
    
    const testData = {
      locationId: 14,
      startDate: '2025-03-06T00:00:00.000Z',
      endDate: '2025-04-06T00:00:00.000Z',
      spotlightOrder: 1,
      createdBy: 1
    };
    
    console.log('Input data:', testData);
    
    const result = await storage.createSpotlightLocation(testData);
    console.log('Created spotlight successfully:', result);
    
    return result;
  } catch (error) {
    console.error('Error creating spotlight:', error);
    throw error;
  }
}

testSpotlightCreation()
  .then(result => {
    console.log('Test completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
  });