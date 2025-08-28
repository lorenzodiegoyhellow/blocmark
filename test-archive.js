// Simple test script to verify archive functionality
const fetch = require('node-fetch');

async function testArchive() {
  try {
    // Test the archive endpoint directly
    const response = await fetch('http://localhost:8080/api/messages/conversation/4/12/archive', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'connect.sid=your-session-id' // This would need to be replaced with actual session
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    const text = await response.text();
    console.log('Response body:', text);
    
    if (response.ok) {
      console.log('✅ Archive endpoint is working');
    } else {
      console.log('❌ Archive endpoint failed');
    }
  } catch (error) {
    console.error('Error testing archive:', error);
  }
}

testArchive();