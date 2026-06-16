const bcrypt = require('bcryptjs');
const { UserDb, OrderDb, SettingsDb } = require('./utils/dbMock');

const runTests = async () => {
  console.log('============================================================');
  console.log('>>> RUNNING AUTOMATED UNIT & SCHEMATIC VERIFICATION TESTS <<<');
  console.log('============================================================');

  let failedTests = 0;
  let passedTests = 0;

  const assert = (condition, message) => {
    if (condition) {
      console.log(`[PASS] - ${message}`);
      passedTests++;
    } else {
      console.error(`[FAIL] - ${message}`);
      failedTests++;
    }
  };

  // 1. Password Hashing & Bcrypt Hashing Verification
  console.log('\n--- 1. Security & Hashing Tests ---');
  try {
    const rawPass = 'password123';
    const mockUser = await UserDb.findOne({ email: 'superadmin@dashboard.com' });
    
    assert(mockUser !== null, 'Find default seed user superadmin');
    
    const isMatch = await bcrypt.compare(rawPass, mockUser.password);
    assert(isMatch === true, 'Verify password hashing decrypts correctly');

    const incorrectMatch = await bcrypt.compare('wrongpassword', mockUser.password);
    assert(incorrectMatch === false, 'Verify incorrect credentials fails decrypt check');
  } catch (error) {
    console.error('Security tests error:', error.message);
    failedTests++;
  }

  // 2. In-Memory Mock Database Fallback CRUD Tests
  console.log('\n--- 2. Database Fallback (CRUD) Tests ---');
  try {
    // Read count
    const initialUsersCount = (await UserDb.find()).length;
    assert(initialUsersCount === 4, `Mock DB users list seeds exactly 4 users (found ${initialUsersCount})`);

    // Create user
    const newUser = await UserDb.create({
      name: 'Auditor User',
      email: 'auditor@dashboard.com',
      password: 'auditorpassword',
      role: 'Manager',
      status: 'active'
    });
    
    assert(newUser._id !== undefined, 'Create user creates unique identifier');
    
    const doubleSearch = await UserDb.findOne({ email: 'auditor@dashboard.com' });
    assert(doubleSearch !== null && doubleSearch.name === 'Auditor User', 'Find newly created user record');

    // Update user
    const updated = await UserDb.findByIdAndUpdate(newUser._id, { role: 'Super Admin', status: 'inactive' });
    assert(updated !== null && updated.role === 'Super Admin' && updated.status === 'inactive', 'Update user roles and statuses');

    // Delete user
    const deleted = await UserDb.findByIdAndDelete(newUser._id);
    assert(deleted !== null, 'Delete user returns deleted user record');
    
    const searchDeleted = await UserDb.findById(newUser._id);
    assert(searchDeleted === null, 'Deleted user cannot be located in DB');
  } catch (error) {
    console.error('Database tests error:', error.message);
    failedTests++;
  }

  // 3. Order Schema Verification
  console.log('\n--- 3. Order Registry Schema Tests ---');
  try {
    const orders = await OrderDb.find();
    assert(orders.length === 15, `Seeds exactly 15 orders (found ${orders.length})`);
    
    // Create new order
    const newOrder = await OrderDb.create({
      customerName: 'Sarveshwaran Customer',
      productName: 'Ultimate Developer Desk',
      quantity: 1,
      price: 1250.00,
      status: 'Pending'
    });

    assert(newOrder.orderId === 'ORD-1016', `Auto increments orderId correctly (expected ORD-1016, got ${newOrder.orderId})`);

    // Edit status
    const statusUpdate = await OrderDb.findByIdAndUpdate(newOrder._id, { status: 'Completed' });
    assert(statusUpdate.status === 'Completed', 'Edit order status updates record value');

    // Clean up
    await OrderDb.findByIdAndDelete(newOrder._id);
  } catch (error) {
    console.error('Order schema error:', error.message);
    failedTests++;
  }

  // 4. Settings Retrieval Tests
  console.log('\n--- 4. Settings Profiles Tests ---');
  try {
    const sysSettings = await SettingsDb.get();
    assert(sysSettings.profile.systemName === 'AeroDash Multi-Role Systems', 'Fetch default system name parameter');
    assert(sysSettings.roleConfig.managerPermissions.length === 3, 'Confirm manager permissions are initialized');
  } catch (error) {
    console.error('Settings test error:', error.message);
    failedTests++;
  }

  console.log('\n============================================================');
  console.log(`Verification Complete: ${passedTests} passed, ${failedTests} failed.`);
  console.log('============================================================');

  if (failedTests > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
};

runTests();
