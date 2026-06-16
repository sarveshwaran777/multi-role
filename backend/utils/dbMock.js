const bcrypt = require('bcryptjs');

// Helper to generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 9);

// Hashed passwords for seed users
// Password for all seed users is 'password123'
const seedPasswordHash = bcrypt.hashSync('password123', 10);

const mockUsers = [
  {
    _id: 'user_1',
    name: 'Super Admin',
    email: 'superadmin@dashboard.com',
    password: seedPasswordHash,
    role: 'Super Admin',
    status: 'active',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
  },
  {
    _id: 'user_2',
    name: 'Jane Manager',
    email: 'manager@dashboard.com',
    password: seedPasswordHash,
    role: 'Manager',
    status: 'active',
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
  },
  {
    _id: 'user_3',
    name: 'John Staff',
    email: 'staff@dashboard.com',
    password: seedPasswordHash,
    role: 'Staff',
    status: 'active',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
  },
  {
    _id: 'user_4',
    name: 'Inactive User',
    email: 'inactive@dashboard.com',
    password: seedPasswordHash,
    role: 'Staff',
    status: 'inactive',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
  }
];

const mockOrders = [
  {
    _id: 'order_1',
    orderId: 'ORD-1001',
    customerName: 'Alice Johnson',
    productName: 'Mechanical Keyboard',
    quantity: 1,
    price: 129.99,
    status: 'Completed',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
  },
  {
    _id: 'order_2',
    orderId: 'ORD-1002',
    customerName: 'Bob Smith',
    productName: 'Wireless Gaming Mouse',
    quantity: 2,
    price: 79.99,
    status: 'Pending',
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
  },
  {
    _id: 'order_3',
    orderId: 'ORD-1003',
    customerName: 'Charlie Brown',
    productName: 'UltraWide Monitor',
    quantity: 1,
    price: 449.99,
    status: 'Processing',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  },
  {
    _id: 'order_4',
    orderId: 'ORD-1004',
    customerName: 'David Lee',
    productName: 'USB-C Docking Station',
    quantity: 1,
    price: 159.99,
    status: 'Completed',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  },
  {
    _id: 'order_5',
    orderId: 'ORD-1005',
    customerName: 'Eva Green',
    productName: 'Noise Cancelling Headphones',
    quantity: 1,
    price: 299.99,
    status: 'Pending',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  },
  {
    _id: 'order_6',
    orderId: 'ORD-1006',
    customerName: 'Frank Miller',
    productName: 'Ergonomic Desk Chair',
    quantity: 1,
    price: 349.99,
    status: 'Processing',
    date: new Date(Date.now() - 12 * 60 * 60 * 1000) // 12 hours ago
  },
  {
    _id: 'order_7',
    orderId: 'ORD-1007',
    customerName: 'Grace Hopper',
    productName: 'Webcam 4K Pro',
    quantity: 3,
    price: 99.99,
    status: 'Completed',
    date: new Date(Date.now() - 8 * 60 * 60 * 1000)
  },
  {
    _id: 'order_8',
    orderId: 'ORD-1008',
    customerName: 'Henry Cavill',
    productName: 'Graphics Card RTX 4070',
    quantity: 1,
    price: 599.99,
    status: 'Pending',
    date: new Date(Date.now() - 4 * 60 * 60 * 1000)
  },
  {
    _id: 'order_9',
    orderId: 'ORD-1009',
    customerName: 'Ivy Carter',
    productName: 'Laptop Stand',
    quantity: 2,
    price: 39.99,
    status: 'Completed',
    date: new Date(Date.now() - 2 * 60 * 60 * 1000)
  },
  {
    _id: 'order_10',
    orderId: 'ORD-1010',
    customerName: 'Jack Reacher',
    productName: 'Mechanical Keyboard',
    quantity: 1,
    price: 129.99,
    status: 'Cancelled',
    date: new Date(Date.now() - 1 * 60 * 60 * 1000)
  },
  {
    _id: 'order_11',
    orderId: 'ORD-1011',
    customerName: 'Karen Gillan',
    productName: 'Smart Desk Lamp',
    quantity: 1,
    price: 59.99,
    status: 'Completed',
    date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
  },
  {
    _id: 'order_12',
    orderId: 'ORD-1012',
    customerName: 'Liam Neeson',
    productName: 'External SSD 2TB',
    quantity: 2,
    price: 149.99,
    status: 'Completed',
    date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
  },
  {
    _id: 'order_13',
    orderId: 'ORD-1013',
    customerName: 'Mary Jane',
    productName: 'Wireless Gaming Mouse',
    quantity: 1,
    price: 79.99,
    status: 'Completed',
    date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000)
  },
  {
    _id: 'order_14',
    orderId: 'ORD-1014',
    customerName: 'Nathan Drake',
    productName: 'Gaming Headset',
    quantity: 1,
    price: 119.99,
    status: 'Completed',
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
  },
  {
    _id: 'order_15',
    orderId: 'ORD-1015',
    customerName: 'Olivia Wilde',
    productName: 'Desk Mat XL',
    quantity: 2,
    price: 29.99,
    status: 'Completed',
    date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)
  }
];

const mockSettings = {
  profile: {
    systemName: 'AeroDash Multi-Role Systems',
    supportEmail: 'support@aerodash.io',
    timezone: 'UTC+05:30'
  },
  security: {
    mfaRequired: false,
    sessionTimeout: 60, // minutes
    passwordMinLength: 8
  },
  roleConfig: {
    superAdminPermissions: ['Dashboard', 'Users', 'Orders', 'Reports', 'Settings'],
    managerPermissions: ['Dashboard', 'Orders', 'Reports'],
    staffPermissions: ['Dashboard', 'Orders']
  },
  system: {
    maintenanceMode: false,
    enableNotifications: true,
    defaultLanguage: 'en'
  }
};

// Mock User database operations
const UserDb = {
  find: async () => {
    return [...mockUsers];
  },
  findOne: async (query) => {
    if (query.email) {
      return mockUsers.find(u => u.email.toLowerCase() === query.email.toLowerCase()) || null;
    }
    return null;
  },
  findById: async (id) => {
    return mockUsers.find(u => u._id === id) || null;
  },
  create: async (userData) => {
    if (mockUsers.some(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
      throw new Error('User already exists');
    }
    const newUser = {
      _id: generateId(),
      name: userData.name,
      email: userData.email,
      password: userData.password.startsWith('$2a$') || userData.password.startsWith('$2b$') 
        ? userData.password 
        : await bcrypt.hash(userData.password, 10),
      role: userData.role || 'Staff',
      status: userData.status || 'active',
      createdAt: new Date()
    };
    mockUsers.push(newUser);
    return newUser;
  },
  findByIdAndUpdate: async (id, updateData) => {
    const idx = mockUsers.findIndex(u => u._id === id);
    if (idx === -1) return null;
    
    // Email uniqueness check
    if (updateData.email && updateData.email.toLowerCase() !== mockUsers[idx].email.toLowerCase()) {
      if (mockUsers.some(u => u.email.toLowerCase() === updateData.email.toLowerCase())) {
        throw new Error('Email already in use');
      }
    }

    if (updateData.password && !updateData.password.startsWith('$2a$') && !updateData.password.startsWith('$2b$')) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    mockUsers[idx] = {
      ...mockUsers[idx],
      ...updateData
    };
    return mockUsers[idx];
  },
  findByIdAndDelete: async (id) => {
    const idx = mockUsers.findIndex(u => u._id === id);
    if (idx === -1) return null;
    const deleted = mockUsers[idx];
    mockUsers.splice(idx, 1);
    return deleted;
  }
};

// Mock Order database operations
const OrderDb = {
  find: async () => {
    return [...mockOrders];
  },
  findById: async (id) => {
    return mockOrders.find(o => o._id === id) || null;
  },
  create: async (orderData) => {
    const lastOrderNum = mockOrders.length > 0 
      ? parseInt(mockOrders[mockOrders.length - 1].orderId.split('-')[1]) 
      : 1000;
    
    const newOrder = {
      _id: generateId(),
      orderId: `ORD-${lastOrderNum + 1}`,
      customerName: orderData.customerName,
      productName: orderData.productName,
      quantity: parseInt(orderData.quantity),
      price: parseFloat(orderData.price),
      status: orderData.status || 'Pending',
      date: orderData.date ? new Date(orderData.date) : new Date()
    };
    mockOrders.push(newOrder);
    return newOrder;
  },
  findByIdAndUpdate: async (id, updateData) => {
    const idx = mockOrders.findIndex(o => o._id === id);
    if (idx === -1) return null;
    
    mockOrders[idx] = {
      ...mockOrders[idx],
      ...updateData
    };
    return mockOrders[idx];
  },
  findByIdAndDelete: async (id) => {
    const idx = mockOrders.findIndex(o => o._id === id);
    if (idx === -1) return null;
    const deleted = mockOrders[idx];
    mockOrders.splice(idx, 1);
    return deleted;
  }
};

// Mock Settings database operations
const SettingsDb = {
  get: async () => {
    return { ...mockSettings };
  },
  update: async (updateData) => {
    if (updateData.profile) mockSettings.profile = { ...mockSettings.profile, ...updateData.profile };
    if (updateData.security) mockSettings.security = { ...mockSettings.security, ...updateData.security };
    if (updateData.roleConfig) mockSettings.roleConfig = { ...mockSettings.roleConfig, ...updateData.roleConfig };
    if (updateData.system) mockSettings.system = { ...mockSettings.system, ...updateData.system };
    return { ...mockSettings };
  }
};

module.exports = {
  UserDb,
  OrderDb,
  SettingsDb,
  mockUsers,
  mockOrders,
  mockSettings
};
