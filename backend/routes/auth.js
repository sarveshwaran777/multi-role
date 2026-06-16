const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { UserDb } = require('../utils/dbMock');
const { protect } = require('../middleware/auth');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign(
    { id }, 
    process.env.JWT_SECRET || 'super_secret_role_dashboard_key_123456', 
    { expiresIn: process.env.JWT_EXPIRY || '24h' }
  );
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide email and password' });
  }

  try {
    let user = null;
    let isMatch = false;

    if (process.env.USE_MOCK_DB === 'true') {
      user = await UserDb.findOne({ email });
      if (user) {
        // Compare password (already encrypted in seed users or newly added users)
        isMatch = await bcrypt.compare(password, user.password);
      }
    } else {
      // Find user and include select password
      user = await User.findOne({ email }).select('+password');
      if (user) {
        isMatch = await user.matchPassword(password);
      }
    }

    if (!user || !isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({ success: false, message: 'Your account is deactivated. Please contact an administrator.' });
    }

    // Generate token
    const token = generateToken(user._id);

    // Don't send password
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt
    };

    res.status(200).json({
      success: true,
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide name, email and password' });
  }

  try {
    let newUser;
    if (process.env.USE_MOCK_DB === 'true') {
      newUser = await UserDb.create({ name, email, password, role: role || 'Staff', status: 'active' });
    } else {
      // Check if user already exists
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ success: false, message: 'User with this email already exists' });
      }
      newUser = await User.create({ name, email, password, role: role || 'Staff', status: 'active' });
    }

    // Generate token
    const token = generateToken(newUser._id);

    res.status(201).json({
      success: true,
      token,
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
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error during registration' });
  }
});

// @desc    Get current logged in user details
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    // req.user is loaded in the protect middleware
    res.status(200).json({
      success: true,
      user: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        status: req.user.status,
        createdAt: req.user.createdAt
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching user profile' });
  }
});

// @desc    Logout user / clear token on client side
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', protect, async (req, res) => {
  try {
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error during logout' });
  }
});

module.exports = router;
