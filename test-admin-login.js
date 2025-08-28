// Test admin login and maintenance toggle
const fetch = require('node-fetch');
const BASE_URL = 'http://localhost:5000';

async function testAdminLogin() {
  console.log('=== Testing Admin Login and Maintenance Toggle ===\n');

  // Step 1: Login as admin
  console.log('1. Logging in as admin user (lorenzodiego)...');
  try {
    const loginRes = await fetch(`${BASE_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'lorenzodiego',
        password: 'diego'
      })
    });

    const loginData = await loginRes.json();
    console.log('Login response:', loginData);

    if (!loginRes.ok) {
      console.error('Login failed:', loginData);
      return;
    }

    // Extract session cookie
    const cookies = loginRes.headers.raw()['set-cookie'];
    if (!cookies || cookies.length === 0) {
      console.error('No session cookie received');
      return;
    }

    const sessionCookie = cookies[0].split(';')[0];
    console.log('Session cookie:', sessionCookie);

    // Step 2: Check admin status
    console.log('\n2. Checking admin status...');
    const checkRes = await fetch(`${BASE_URL}/api/admin/check-admin`, {
      headers: { 'Cookie': sessionCookie }
    });

    const checkData = await checkRes.json();
    console.log('Admin check response:', checkData);

    // Step 3: Get current maintenance status
    console.log('\n3. Getting maintenance status...');
    const statusRes = await fetch(`${BASE_URL}/api/admin/maintenance`, {
      headers: { 'Cookie': sessionCookie }
    });

    const statusData = await statusRes.json();
    console.log('Maintenance status response:', statusData);

    // Step 4: Toggle maintenance mode
    console.log('\n4. Toggling maintenance mode...');
    const toggleRes = await fetch(`${BASE_URL}/api/admin/maintenance`, {
      method: 'PUT',
      headers: { 
        'Cookie': sessionCookie,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ enabled: true })
    });

    const toggleData = await toggleRes.json();
    console.log('Toggle response:', toggleData);

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testAdminLogin();