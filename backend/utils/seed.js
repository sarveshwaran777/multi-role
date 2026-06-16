const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Order = require('../models/Order');
const Setting = require('../models/Setting');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const seedUsers = [
  {
    name: 'Super Admin',
    email: 'superadmin@dashboard.com',
    password: 'password123', // Will be hashed by mongoose pre-save or in seed code
    role: 'Super Admin',
    status: 'active'
  },
  {
    name: 'Jane Manager',
    email: 'manager@dashboard.com',
    password: 'password123',
    role: 'Manager',
    status: 'active'
  },
  {
    name: 'John Staff',
    email: 'staff@dashboard.com',
    password: 'password123',
    role: 'Staff',
    status: 'active'
  },
  {
    name: 'Inactive User',
    email: 'inactive@dashboard.com',
    password: 'password123',
    role: 'Staff',
    status: 'inactive'
  }
];

const seedOrders = [
  {
    orderId: 'ORD-1001',
    customerName: 'Alice Johnson',
    productName: 'Mechanical Keyboard',
    quantity: 1,
    price: 129.99,
    status: 'Completed',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
  },
  {
    orderId: 'ORD-1002',
    customerName: 'Bob Smith',
    productName: 'Wireless Gaming Mouse',
    quantity: 2,
    price: 79.99,
    status: 'Pending',
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
  },
  {
    orderId: 'ORD-1003',
    customerName: 'Charlie Brown',
    productName: 'UltraWide Monitor',
    quantity: 1,
    price: 449.99,
    status: 'Processing',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  },
  {
    orderId: 'ORD-1004',
    customerName: 'David Lee',
    productName: 'USB-C Docking Station',
    quantity: 1,
    price: 159.99,
    status: 'Completed',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  },
  {
    orderId: 'ORD-1005',
    customerName: 'Eva Green',
    productName: 'Noise Cancelling Headphones',
    quantity: 1,
    price: 299.99,
    status: 'Pending',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  },
  {
    orderId: 'ORD-1006',
    customerName: 'Frank Miller',
    productName: 'Ergonomic Desk Chair',
    quantity: 1,
    price: 349.99,
    status: 'Processing',
    date: new Date(Date.now() - 12 * 60 * 60 * 1000)
  },
  {
    orderId: 'ORD-1007',
    customerName: 'Grace Hopper',
    productName: 'Webcam 4K Pro',
    quantity: 3,
    price: 99.99,
    status: 'Completed',
    date: new Date(Date.now() - 8 * 60 * 60 * 1000)
  },
  {
    orderId: 'ORD-1008',
    customerName: 'Henry Cavill',
    productName: 'Graphics Card RTX 4070',
    quantity: 1,
    price: 599.99,
    status: 'Pending',
    date: new Date(Date.now() - 4 * 60 * 60 * 1000)
  },
  {
    orderId: 'ORD-1009',
    customerName: 'Ivy Carter',
    productName: 'Laptop Stand',
    quantity: 2,
    price: 39.99,
    status: 'Completed',
    date: new Date(Date.now() - 2 * 60 * 60 * 1000)
  },
  {
    orderId: 'ORD-1010',
    customerName: 'Jack Reacher',
    productName: 'Mechanical Keyboard',
    quantity: 1,
    price: 129.99,
    status: 'Cancelled',
    date: new Date(Date.now() - 1 * 60 * 60 * 1000)
  },
  {
    orderId: 'ORD-1011',
    customerName: 'Karen Gillan',
    productName: 'Smart Desk Lamp',
    quantity: 1,
    price: 59.99,
    status: 'Completed',
    date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
  },
  {
    orderId: 'ORD-1012',
    customerName: 'Liam Neeson',
    productName: 'External SSD 2TB',
    quantity: 2,
    price: 149.99,
    status: 'Completed',
    date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
  },
  {
    orderId: 'ORD-1013',
    customerName: 'Mary Jane',
    productName: 'Wireless Gaming Mouse',
    quantity: 1,
    price: 79.99,
    status: 'Completed',
    date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000)
  },
  {
    orderId: 'ORD-1014',
    customerName: 'Nathan Drake',
    productName: 'Gaming Headset',
    quantity: 1,
    price: 119.99,
    status: 'Completed',
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
  },
  {
    orderId: 'ORD-1015',
    customerName: 'Olivia Wilde',
    productName: 'Desk Mat XL',
    quantity: 2,
    price: 29.99,
    status: 'Completed',
    date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)
  }
];

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/role_dashboard';
    console.log(`Connecting to MongoDB to seed database: ${mongoUri}...`);
    
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log('MongoDB Connected for Seeding.');

    // Clear existing data
    await User.deleteMany();
    await Order.deleteMany();
    await Setting.deleteMany();
    console.log('Existing data cleared.');

    // Create users (pre-save hook will hash passwords)
    await User.create(seedUsers);
    console.log('Seed users created.');

    // Create orders
    await Order.create(seedOrders);
    console.log('Seed orders created.');

    // Create default settings
    await Setting.create({ key: 'system_config' });
    console.log('Default settings created.');

    console.log('Database Seeding Completed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error.message);
    console.warn('Could not complete database seeding. Ensure MongoDB is running if attempting to seed a live instance.');
    process.exit(1);
  }
};

seedDB();
