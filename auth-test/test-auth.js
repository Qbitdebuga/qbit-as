// Simple Node.js script to test the auth service
import fetch from 'node-fetch';

async function testAuth() {
  console.log('Testing auth service at http://localhost:3002');
  
  try {
    // Test login
    console.log('\n--- Testing Login ---');
    const loginResponse = await fetch('http://localhost:3002/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@qbit.com',
        password: 'admin123'
      })
    });
    
    const loginStatus = loginResponse.status;
    console.log(`Status code: ${loginStatus}`);
    
    const loginData = await loginResponse.text();
    console.log('Response body:');
    console.log(loginData);
    
    if (loginStatus === 200) {
      const { accessToken, refreshToken, user } = JSON.parse(loginData);
      console.log('\nLogin successful!');
      console.log(`User: ${user.name} (${user.email})`);
      console.log(`Roles: ${user.roles.join(', ')}`);
      console.log(`Access Token: ${accessToken.substring(0, 20)}...`);
      
      // Test profile endpoint
      console.log('\n--- Testing Profile ---');
      const profileResponse = await fetch('http://localhost:3002/auth/profile', {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      
      console.log(`Status code: ${profileResponse.status}`);
      const profileData = await profileResponse.text();
      console.log('Response body:');
      console.log(profileData);
    }
  } catch (error) {
    console.error('Error during test:');
    console.error(error);
  }
}

// Run the test
testAuth().catch(console.error); 