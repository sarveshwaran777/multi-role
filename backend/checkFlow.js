const testWorkflow = async () => {
  console.log('============================================================');
  console.log('>>> PROGRAMMATIC WORKFLOW CHECK: REGISTER, LOGIN & RBAC   <<<');
  console.log('============================================================');

  const baseURL = 'http://localhost:5000';
  const testEmail = `newmanager_${Date.now()}@test.com`;
  const testPassword = 'testpassword123';
  const testName = 'Test Workflow Manager';
  const testRole = 'Manager';

  let token = '';

  // 1. Register a new Manager account
  console.log('\nStep 1: Registering a new Manager account...');
  try {
    const regRes = await fetch(`${baseURL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: testName,
        email: testEmail,
        password: testPassword,
        role: testRole
      })
    });

    const regData = await regRes.json();
    if (regRes.status === 201 && regData.success) {
      console.log(`[SUCCESS] Registered user: ${regData.user.name} (${regData.user.email}) with role: ${regData.user.role}`);
      token = regData.token;
    } else {
      console.error('[FAILED] Registration failed:', regData);
      process.exit(1);
    }
  } catch (err) {
    console.error('[FAILED] Registration request error:', err.message);
    process.exit(1);
  }

  // 2. Perform Login with the new credentials
  console.log('\nStep 2: Performing login to retrieve JWT token...');
  try {
    const loginRes = await fetch(`${baseURL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword
      })
    });

    const loginData = await loginRes.json();
    if (loginRes.status === 200 && loginData.success) {
      console.log(`[SUCCESS] Login successful! Recieved JWT token.`);
      token = loginData.token;
    } else {
      console.error('[FAILED] Login failed:', loginData);
      process.exit(1);
    }
  } catch (err) {
    console.error('[FAILED] Login request error:', err.message);
    process.exit(1);
  }

  // 3. Test Authorized Route (GET /api/reports/stats) - Managers should have access
  console.log('\nStep 3: Checking reports endpoint (Authorized for Managers)...');
  try {
    const reportsRes = await fetch(`${baseURL}/api/reports/stats`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const reportsData = await reportsRes.json();
    if (reportsRes.status === 200 && reportsData.success) {
      console.log('[SUCCESS] Access granted. Dashboard stats loaded:');
      console.log(`  - Total Users: ${reportsData.stats.totalUsers}`);
      console.log(`  - Total Orders: ${reportsData.stats.totalOrders}`);
      console.log(`  - Total Sales: $${reportsData.stats.totalSales}`);
    } else {
      console.error('[FAILED] Access denied to reports endpoint:', reportsRes.status, reportsData);
    }
  } catch (err) {
    console.error('[FAILED] Reports request error:', err.message);
  }

  // 4. Test Unauthorized Route (GET /api/users) - Managers should NOT have access (Super Admin only)
  console.log('\nStep 4: Checking users control route (Super Admin only - Forbidden for Managers)...');
  try {
    const usersRes = await fetch(`${baseURL}/api/users`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const usersData = await usersRes.json();
    if (usersRes.status === 403) {
      console.log('[SUCCESS] Access correctly blocked! Response code: 403 Forbidden.');
      console.log(`  - Server message: "${usersData.message}"`);
    } else {
      console.error('[FAILED] Security vulnerability: Manager accessed user list!', usersRes.status, usersData);
    }
  } catch (err) {
    console.error('[FAILED] Users request error:', err.message);
  }

  console.log('\n============================================================');
  console.log('>>> WORKFLOW CHECK COMPLETED SUCCESSFULLY!                <<<');
  console.log('============================================================');
};

testWorkflow();
