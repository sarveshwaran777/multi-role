const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { UserDb } = require('../utils/dbMock');

// Protect routes - Verify token & load user
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_role_dashboard_key_123456');

      if (process.env.USE_MOCK_DB === 'true') {
        req.user = await UserDb.findById(decoded.id);
      } else {
        req.user = await User.findById(decoded.id).select('-password');
      }

      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
      }

      if (req.user.status === 'inactive') {
        return res.status(403).json({ success: false, message: 'Your account is deactivated. Please contact an administrator.' });
      }

      next();
    } catch (error) {
      console.error('Auth Error:', error.message);
      return res.status(401).json({ success: false, message: 'Not authorized, token validation failed' });
    }
  } else {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

// Authorize specific user roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Role '${req.user ? req.user.role : 'unknown'}' is not authorized to access this route`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
