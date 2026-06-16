const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { registerClient } = require('../utils/updates');

// SSE updates stream endpoint - protected
router.get('/', protect, (req, res) => {
  registerClient(req, res);
});

module.exports = router;
