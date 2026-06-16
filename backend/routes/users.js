const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const { broadcastUpdate } = require('../utils/updates');

// Apply protection & authorization (Super Admin only) to all routes
router.use(protect);
router.use(authorize('Super Admin'));

// @desc    Get all users (with search, filter, pagination, sorting)
// @route   GET /api/users
// @access  Private/SuperAdmin
router.get('/', async (req, res) => {
  try {
    const { search, role, status, sortBy, order, page, limit } = req.query;

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skipNum = (pageNum - 1) * limitNum;

    let usersList = [];
    let total = 0;

    if (process.env.USE_MOCK_DB === 'true') {
      usersList = await UserDb.find();

      // Filter
      if (search) {
        const query = search.toLowerCase();
        usersList = usersList.filter(u => 
          u.name.toLowerCase().includes(query) || 
          u.email.toLowerCase().includes(query)
        );
      }
      if (role) {
        usersList = usersList.filter(u => u.role === role);
      }
      if (status) {
        usersList = usersList.filter(u => u.status === status);
      }

      total = usersList.length;

      // Sort
      if (sortBy) {
        const sortOrder = order === 'desc' ? -1 : 1;
        usersList.sort((a, b) => {
          if (a[sortBy] < b[sortBy]) return -1 * sortOrder;
          if (a[sortBy] > b[sortBy]) return 1 * sortOrder;
          return 0;
        });
      } else {
        // Default sort by createdAt desc
        usersList.sort((a, b) => b.createdAt - a.createdAt);
      }

      // Pagination
      usersList = usersList.slice(skipNum, skipNum + limitNum);
    } else {
      // Mongoose DB
      let query = {};

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }
      if (role) {
        query.role = role;
      }
      if (status) {
        query.status = status;
      }

      total = await User.countDocuments(query);

      let sortQuery = {};
      if (sortBy) {
        sortQuery[sortBy] = order === 'desc' ? -1 : 1;
      } else {
        sortQuery.createdAt = -1; // Default
      }

      usersList = await User.find(query)
        .sort(sortQuery)
        .skip(skipNum)
        .limit(limitNum);
    }

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      users: usersList.map(u => ({
        _id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        status: u.status,
        createdAt: u.createdAt
      }))
    });
  } catch (error) {
    console.error('Fetch users error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving users' });
  }
});

// @desc    Create a new user
// @route   POST /api/users
// @access  Private/SuperAdmin
router.post('/', async (req, res) => {
  const { name, email, password, role, status } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Please include name, email and password' });
  }

  try {
    let newUser;
    if (process.env.USE_MOCK_DB === 'true') {
      newUser = await UserDb.create({ name, email, password, role, status });
    } else {
      // Check if user already exists
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ success: false, message: 'User with this email already exists' });
      }
      newUser = await User.create({ name, email, password, role, status });
    }

    broadcastUpdate('user_event', {
      action: 'create',
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status
      }
    });

    res.status(201).json({
      success: true,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
        createdAt: newUser.createdAt
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error creating user' });
  }
});

// @desc    Update a user
// @route   PUT /api/users/:id
// @access  Private/SuperAdmin
router.put('/:id', async (req, res) => {
  const { name, email, password, role, status } = req.body;

  try {
    let updatedUser;

    if (process.env.USE_MOCK_DB === 'true') {
      const updateData = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email;
      if (password) updateData.password = password;
      if (role) updateData.role = role;
      if (status) updateData.status = status;

      updatedUser = await UserDb.findByIdAndUpdate(req.params.id, updateData);
    } else {
      let user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      if (name) user.name = name;
      if (email) {
        // Email check
        const emailExists = await User.findOne({ email });
        if (emailExists && emailExists._id.toString() !== req.params.id) {
          return res.status(400).json({ success: false, message: 'Email already in use' });
        }
        user.email = email;
      }
      if (password) user.password = password;
      if (role) user.role = role;
      if (status) user.status = status;

      updatedUser = await user.save();
    }

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    broadcastUpdate('user_event', {
      action: 'update',
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        status: updatedUser.status
      }
    });

    res.status(200).json({
      success: true,
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        status: updatedUser.status,
        createdAt: updatedUser.createdAt
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error updating user' });
  }
});

// @desc    Delete a user
// @route   DELETE /api/users/:id
// @access  Private/SuperAdmin
router.delete('/:id', async (req, res) => {
  try {
    let deletedUser;

    // Prevent deleting oneself
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account' });
    }

    if (process.env.USE_MOCK_DB === 'true') {
      deletedUser = await UserDb.findByIdAndDelete(req.params.id);
    } else {
      deletedUser = await User.findByIdAndDelete(req.params.id);
    }

    if (!deletedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    broadcastUpdate('user_event', {
      action: 'delete',
      id: req.params.id
    });

    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting user' });
  }
});

module.exports = router;
