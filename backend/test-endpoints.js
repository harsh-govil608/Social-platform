import axios from 'axios';

const API_BASE = 'http://localhost:5001/api';
const testEmail = `test${Date.now()}@example.com`;
const testPassword = 'Test123!';
let authCookie = '';

const axiosInstance = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Store cookies manually for testing
axiosInstance.interceptors.response.use(
  response => {
    const cookies = response.headers['set-cookie'];
    if (cookies) {
      authCookie = cookies[0];
      axiosInstance.defaults.headers.Cookie = authCookie;
    }
    return response;
  },
  error => {
    return Promise.reject(error);
  }
);

async function testEndpoints() {
  console.log('🔍 Testing API Endpoints...\n');
  
  const results = {
    passed: [],
    failed: []
  };

  // Test 1: Test endpoint
  try {
    const res = await axiosInstance.get('/test');
    console.log('✅ Test endpoint working');
    results.passed.push('Test endpoint');
  } catch (error) {
    console.error('❌ Test endpoint failed:', error.message);
    results.failed.push('Test endpoint');
  }

  // Test 2: Signup
  try {
    const res = await axiosInstance.post('/auth/signup', {
      fullName: 'Test User',
      email: testEmail,
      password: testPassword
    });
    console.log('✅ Signup working');
    results.passed.push('Signup');
  } catch (error) {
    console.error('❌ Signup failed:', error.response?.data || error.message);
    results.failed.push('Signup');
  }

  // Test 3: Login
  try {
    const res = await axiosInstance.post('/auth/login', {
      email: testEmail,
      password: testPassword
    });
    console.log('✅ Login working');
    results.passed.push('Login');
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    results.failed.push('Login');
  }

  // Test 4: Get auth user
  try {
    const res = await axiosInstance.get('/auth/me');
    console.log('✅ Get auth user working');
    results.passed.push('Get auth user');
  } catch (error) {
    console.error('❌ Get auth user failed:', error.response?.data || error.message);
    results.failed.push('Get auth user');
  }

  // Test 5: Get users
  try {
    const res = await axiosInstance.get('/users');
    console.log('✅ Get users working');
    results.passed.push('Get users');
  } catch (error) {
    console.error('❌ Get users failed:', error.response?.data || error.message);
    results.failed.push('Get users');
  }

  // Test 6: Get posts
  try {
    const res = await axiosInstance.get('/posts');
    console.log('✅ Get posts working');
    results.passed.push('Get posts');
  } catch (error) {
    console.error('❌ Get posts failed:', error.response?.data || error.message);
    results.failed.push('Get posts');
  }

  // Test 7: Get notifications
  try {
    const res = await axiosInstance.get('/notifications');
    console.log('✅ Get notifications working');
    results.passed.push('Get notifications');
  } catch (error) {
    console.error('❌ Get notifications failed:', error.response?.data || error.message);
    results.failed.push('Get notifications');
  }

  // Test 8: Get Stream token
  try {
    const res = await axiosInstance.get('/chat/token');
    console.log('✅ Get Stream token working');
    results.passed.push('Get Stream token');
  } catch (error) {
    console.error('❌ Get Stream token failed:', error.response?.data || error.message);
    results.failed.push('Get Stream token');
  }

  // Test 9: Get learning progress
  try {
    const res = await axiosInstance.get('/language-journey/progress');
    console.log('✅ Get learning progress working');
    results.passed.push('Get learning progress');
  } catch (error) {
    console.error('❌ Get learning progress failed:', error.response?.data || error.message);
    results.failed.push('Get learning progress');
  }

  // Test 10: Logout
  try {
    const res = await axiosInstance.post('/auth/logout');
    console.log('✅ Logout working');
    results.passed.push('Logout');
  } catch (error) {
    console.error('❌ Logout failed:', error.response?.data || error.message);
    results.failed.push('Logout');
  }

  // Summary
  console.log('\n📊 Test Summary:');
  console.log(`✅ Passed: ${results.passed.length} tests`);
  console.log(`❌ Failed: ${results.failed.length} tests`);
  
  if (results.failed.length > 0) {
    console.log('\nFailed tests:', results.failed.join(', '));
  }
  
  process.exit(results.failed.length > 0 ? 1 : 0);
}

// Run tests
testEndpoints().catch(console.error);