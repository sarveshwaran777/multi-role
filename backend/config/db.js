const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/role_dashboard';
  console.log(`Connecting to MongoDB at: ${uri}...`);
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    process.env.USE_MOCK_DB = "false";
  } catch (error) {
    console.warn(`MongoDB Connection Failed: ${error.message}`);
    console.warn('------------------------------------------------------------');
    console.warn('>>> WARNING: FALLING BACK TO IN-MEMORY MOCK DATABASE SETUP  <<<');
    console.warn('>>> Full CRUD operations and API checks will function, but   <<<');
    console.warn('>>> database changes will not persist across restarts.      <<<');
    console.warn('------------------------------------------------------------');
    process.env.USE_MOCK_DB = "true";
  }
};

module.exports = connectDB;
