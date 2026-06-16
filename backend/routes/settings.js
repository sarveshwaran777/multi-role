const express = require('express');
const router = express.Router();
const Setting = require('../models/Setting');
const { SettingsDb } = require('../utils/dbMock');
const { protect, authorize } = require('../middleware/auth');

// Apply protection & authorization (Super Admin only)
router.use(protect);
router.use(authorize('Super Admin'));

// @desc    Get system settings
// @route   GET /api/settings
// @access  Private/SuperAdmin
router.get('/', async (req, res) => {
  try {
    let settings;

    if (process.env.USE_MOCK_DB === 'true') {
      settings = await SettingsDb.get();
    } else {
      settings = await Setting.findOne({ key: 'system_config' });
      if (!settings) {
        // Create default settings if not exists
        settings = await Setting.create({ key: 'system_config' });
      }
    }

    res.status(200).json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('Fetch settings error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving system settings' });
  }
});

// @desc    Update system settings
// @route   PUT /api/settings
// @access  Private/SuperAdmin
router.put('/', async (req, res) => {
  try {
    let updatedSettings;

    if (process.env.USE_MOCK_DB === 'true') {
      updatedSettings = await SettingsDb.update(req.body);
    } else {
      let settings = await Setting.findOne({ key: 'system_config' });
      if (!settings) {
        settings = new Setting({ key: 'system_config' });
      }

      if (req.body.profile) settings.profile = { ...settings.profile, ...req.body.profile };
      if (req.body.security) settings.security = { ...settings.security, ...req.body.security };
      if (req.body.roleConfig) settings.roleConfig = { ...settings.roleConfig, ...req.body.roleConfig };
      if (req.body.system) settings.system = { ...settings.system, ...req.body.system };

      updatedSettings = await settings.save();
    }

    res.status(200).json({
      success: true,
      message: 'System settings updated successfully',
      settings: updatedSettings
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ success: false, message: 'Server error updating system settings' });
  }
});

module.exports = router;
