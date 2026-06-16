const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  key: {
    type: String,
    default: 'system_config',
    unique: true
  },
  profile: {
    systemName: { type: String, default: 'AeroDash Multi-Role Systems' },
    supportEmail: { type: String, default: 'support@aerodash.io' },
    timezone: { type: String, default: 'UTC+05:30' }
  },
  security: {
    mfaRequired: { type: Boolean, default: false },
    sessionTimeout: { type: Number, default: 60 },
    passwordMinLength: { type: Number, default: 8 }
  },
  roleConfig: {
    superAdminPermissions: { 
      type: [String], 
      default: ['Dashboard', 'Users', 'Orders', 'Reports', 'Settings'] 
    },
    managerPermissions: { 
      type: [String], 
      default: ['Dashboard', 'Orders', 'Reports'] 
    },
    staffPermissions: { 
      type: [String], 
      default: ['Dashboard', 'Orders'] 
    }
  },
  system: {
    maintenanceMode: { type: Boolean, default: false },
    enableNotifications: { type: Boolean, default: true },
    defaultLanguage: { type: String, default: 'en' }
  }
});

module.exports = mongoose.model('Setting', settingSchema);
