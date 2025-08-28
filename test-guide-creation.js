const fetch = require('node-fetch');

async function testGuideCreation() {
  console.log('Testing guide creation directly...');
  
  const testGuide = {
    title: "Test Guide Direct",
    description: "Testing guide creation directly",
    content: "<p>This is a test guide created directly via API</p>",
    categoryId: 1,
    author: "Test Author",
    coverImage: null,
    difficulty: "Beginner",
    timeToRead: "5 min",
    featured: false,
    status: "draft",
    slug: "test-guide-direct"
  };
  
  try {
    // First, we need to get the session cookie
    const loginResponse = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'lorenzodiego@hotmail.com',
        password: 'ciao123'
      })
    });
    
    const cookies = loginResponse.headers.get('set-cookie');
    console.log('Login response:', loginResponse.status);
    
    // Now create the guide
    const response = await fetch('http://localhost:5000/api/admin/guides', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies
      },
      body: JSON.stringify(testGuide)
    });
    
    const responseText = await response.text();
    console.log('Response status:', response.status);
    console.log('Response body:', responseText);
    
    if (response.ok) {
      console.log('✅ Guide created successfully!');
      const guide = JSON.parse(responseText);
      console.log('Created guide:', guide);
    } else {
      console.log('❌ Failed to create guide');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testGuideCreation();