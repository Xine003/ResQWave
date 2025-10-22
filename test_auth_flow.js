// Test script to verify the unified authentication flow
const fetch = require('node-fetch');

const API_BASE = 'http://localhost:5000';

async function testAuthFlow() {
  console.log('🚀 Testing Unified Authentication Flow...\n');

  try {
    // Step 1: Test unified login (this will fail with invalid credentials, but should show correct endpoint)
    console.log('📧 Step 1: Testing unified login endpoint...');
    
    const loginResponse = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        emailOrNumber: 'test@example.com',
        password: 'testpassword'
      }),
    });

    const loginData = await loginResponse.json();
    console.log('Login Response:', loginData);
    console.log('Status:', loginResponse.status);

    if (loginResponse.status === 404) {
      console.log('❌ Route /login not found - check backend routes');
      return;
    }

    if (loginResponse.status === 401 || loginResponse.status === 400) {
      console.log('✅ Login endpoint is working (expected auth failure with test data)');
    }

    // Step 2: Test verify endpoint (this will also fail but shows endpoint exists)
    console.log('\n🔐 Step 2: Testing verification endpoint...');
    
    const verifyResponse = await fetch(`${API_BASE}/verify-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tempToken: 'invalid-token',
        code: '123456'
      }),
    });

    const verifyData = await verifyResponse.json();
    console.log('Verify Response:', verifyData);
    console.log('Status:', verifyResponse.status);

    if (verifyResponse.status === 404) {
      console.log('❌ Route /verify-login not found - check backend routes');
      return;
    }

    if (verifyResponse.status === 400 || verifyResponse.status === 401) {
      console.log('✅ Verification endpoint is working (expected failure with invalid data)');
    }

    console.log('\n🎉 Both endpoints are accessible! The authentication flow structure is working.');
    
  } catch (error) {
    console.error('❌ Error during testing:', error.message);
  }
}

testAuthFlow();