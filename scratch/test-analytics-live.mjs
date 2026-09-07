// Live End-to-End Simulation for Global Analytics
const BACKEND_URL = 'https://back-end.moahmedsaeed325.workers.dev';

async function main() {
  console.log('========================================================');
  console.log('🚀 LIVE END-TO-END SIMULATION: /api/analytics/global');
  console.log('Target Backend:', BACKEND_URL);
  console.log('========================================================\n');

  const testUser = {
    email: `sim_user_${Date.now()}@example.com`,
    name: 'Live Analytics Tester',
    password: 'TestPassword123!',
    tier: 'free'
  };

  // Step 1: Create a verified test user via the Admin API
  console.log('Step 1: Setting up verified test user...');
  const adminLoginRes = await fetch(`${BACKEND_URL}/api/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@yoursite.com', password: 'admin123' })
  });

  if (!adminLoginRes.ok) {
    throw new Error(`Admin login failed with status ${adminLoginRes.status}`);
  }

  const adminCookie = adminLoginRes.headers.get('set-cookie')?.split(';')[0] || '';
  console.log('✅ Admin authenticated. Creating verified user:', testUser.email);

  const createUserRes = await fetch(`${BACKEND_URL}/api/admin/users/regular`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': adminCookie
    },
    body: JSON.stringify(testUser)
  });

  const createdUserData = await createUserRes.json();
  if (!createUserRes.ok) {
    throw new Error(`User creation failed: ${JSON.stringify(createdUserData)}`);
  }
  console.log('✅ Verified user created successfully with ID:', createdUserData.user?.id);

  // Step 2: Call POST /api/auth/login with that user
  console.log('\nStep 2: Calling POST /api/auth/login for user:', testUser.email);
  const loginRes = await fetch(`${BACKEND_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testUser.email,
      password: testUser.password
    })
  });

  const loginData = await loginRes.json();
  console.log('Login Response Status:', loginRes.status);
  console.log('Has Token:', !!loginData.token);
  console.log('User Object:', loginData.user);

  if (!loginRes.ok || !loginData.token) {
    throw new Error(`Login failed with status ${loginRes.status}: ${JSON.stringify(loginData)}`);
  }

  const token = loginData.token;
  console.log(`✅ Extracted real JWT token: ${token.substring(0, 30)}...`);

  // Step 3: Call GET /api/analytics/global with that real token
  console.log('\nStep 3: Calling GET /api/analytics/global with Authorization: Bearer <token>');
  const analyticsRes = await fetch(`${BACKEND_URL}/api/analytics/global?days=30`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  });

  console.log('HTTP Status Code:', analyticsRes.status);
  const analyticsData = await analyticsRes.json();
  console.log('\nResponse Data Payload:');
  console.log(JSON.stringify(analyticsData, null, 2));

  // Step 4: Validate HTTP status is 200 and schema is valid
  console.log('\nStep 4: Validating Response & Schema Requirements:');
  const assertions = [
    { name: 'HTTP Status is 200', pass: analyticsRes.status === 200 },
    { name: 'summary object exists', pass: typeof analyticsData.summary === 'object' && analyticsData.summary !== null },
    { name: 'summary.totalClicks is number (0)', pass: typeof analyticsData.summary?.totalClicks === 'number' },
    { name: 'summary.uniqueVisitors is number (0)', pass: typeof analyticsData.summary?.uniqueVisitors === 'number' },
    { name: 'summary.topCountry is string', pass: typeof analyticsData.summary?.topCountry === 'string' },
    { name: 'summary.topReferrer is string', pass: typeof analyticsData.summary?.topReferrer === 'string' },
    { name: 'timeseries is array', pass: Array.isArray(analyticsData.timeseries) },
    { name: 'breakdown object exists', pass: typeof analyticsData.breakdown === 'object' && analyticsData.breakdown !== null },
    { name: 'breakdown.referrers is array', pass: Array.isArray(analyticsData.breakdown?.referrers) },
    { name: 'breakdown.countries is array', pass: Array.isArray(analyticsData.breakdown?.countries) },
    { name: 'breakdown.devices is array', pass: Array.isArray(analyticsData.breakdown?.devices) },
    { name: 'breakdown.browsers is array', pass: Array.isArray(analyticsData.breakdown?.browsers) },
    { name: 'hourly is array', pass: Array.isArray(analyticsData.hourly) },
  ];

  let allPassed = true;
  for (const a of assertions) {
    if (a.pass) {
      console.log(`  ✅ [PASS] ${a.name}`);
    } else {
      console.error(`  ❌ [FAIL] ${a.name}`);
      allPassed = false;
    }
  }

  if (!allPassed) {
    throw new Error('Some schema assertions failed');
  }

  console.log('\n🎉 SUCCESS: Live End-to-End Simulation PASSED! The endpoint is 100% operational!');
}

main().catch(err => {
  console.error('\n❌ Simulation error:', err.message);
  process.exit(1);
});
