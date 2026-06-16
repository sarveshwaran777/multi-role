import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Settings as SettingsIcon,
  Shield, 
  Lock, 
  Smartphone, 
  Mail, 
  Globe,
  Bell,
  Clock,
  Loader2,
  CheckCircle2
} from 'lucide-react';

const Settings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/settings');
        if (res.data.success) {
          setSettings(res.data.settings);
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
        setErrorMsg('Failed to load system settings.');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await axios.put('/api/settings', settings);
      if (res.data.success) {
        setSettings(res.data.settings);
        setSuccessMsg('System configuration saved successfully!');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      console.error('Error saving settings:', err);
      setErrorMsg(err.response?.data?.message || 'Error occurred while saving settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading system parameters...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', label: 'Profile Settings', icon: Globe },
    { id: 'security', label: 'Security & Access', icon: Lock },
    { id: 'roles', label: 'Role Permissions', icon: Shield },
    { id: 'system', label: 'System Policies', icon: SettingsIcon }
  ];

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">System Configuration</h2>
        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-0.5">
          Configure security protocols, permission tables, and notifications.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400">
          {errorMsg}
        </div>
      )}

      {/* Tabs Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Sidebar Tabs */}
        <div className="lg:col-span-1 flex flex-col gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/40'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Form Details */}
        <div className="lg:col-span-3 glass-panel p-6 rounded-2xl shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <div className="space-y-5">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 pb-3 border-b border-slate-200/50 dark:border-slate-800/50">
                  Dashboard Profile Configuration
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">System Name</label>
                    <input
                      type="text"
                      value={settings.profile.systemName}
                      onChange={(e) => handleChange('profile', 'systemName', e.target.value)}
                      className="block w-full mt-1.5 px-4 py-2.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Contact / Support Email</label>
                    <input
                      type="email"
                      value={settings.profile.supportEmail}
                      onChange={(e) => handleChange('profile', 'supportEmail', e.target.value)}
                      className="block w-full mt-1.5 px-4 py-2.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Default Timezone</label>
                    <select
                      value={settings.profile.timezone}
                      onChange={(e) => handleChange('profile', 'timezone', e.target.value)}
                      className="block w-full mt-1.5 px-4 py-2.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 text-xs font-semibold focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="UTC-05:00">EST (UTC-05:00)</option>
                      <option value="UTC+00:00">GMT (UTC+00:00)</option>
                      <option value="UTC+01:00">CET (UTC+01:00)</option>
                      <option value="UTC+05:30">IST (UTC+05:30)</option>
                      <option value="UTC+08:00">SGT (UTC+08:00)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* SECURITY TAB */}
            {activeTab === 'security' && (
              <div className="space-y-5">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 pb-3 border-b border-slate-200/50 dark:border-slate-800/50">
                  Access & Security Protocols
                </h3>

                <div className="space-y-4">
                  {/* Session Timeout */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Session Duration (Minutes)</span>
                    </label>
                    <input
                      type="number"
                      value={settings.security.sessionTimeout}
                      onChange={(e) => handleChange('security', 'sessionTimeout', parseInt(e.target.value))}
                      className="block w-full mt-1.5 px-4 py-2.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Password Min Length */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Minimum Password Complexity (Length)</label>
                    <input
                      type="number"
                      value={settings.security.passwordMinLength}
                      onChange={(e) => handleChange('security', 'passwordMinLength', parseInt(e.target.value))}
                      className="block w-full mt-1.5 px-4 py-2.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* MFA Checkbox Toggle */}
                  <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-950/30 rounded-xl border border-slate-100 dark:border-slate-900">
                    <input
                      type="checkbox"
                      id="mfa"
                      checked={settings.security.mfaRequired}
                      onChange={(e) => handleChange('security', 'mfaRequired', e.target.checked)}
                      className="h-4.5 w-4.5 rounded border-slate-300 dark:border-slate-800 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <label htmlFor="mfa" className="select-none cursor-pointer">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Force Multi-Factor Authentication (MFA)</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">Require validation keys on login triggers.</p>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* ROLES TAB */}
            {activeTab === 'roles' && (
              <div className="space-y-5">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 pb-3 border-b border-slate-200/50 dark:border-slate-800/50">
                  Access Privilege Structure (RBAC)
                </h3>

                <div className="space-y-4 text-xs font-semibold">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Super Admin privileges */}
                    <div className="p-4 bg-violet-50/20 dark:bg-violet-950/10 border border-violet-200/40 dark:border-violet-850 rounded-xl">
                      <span className="font-bold text-violet-700 dark:text-violet-400">Super Admin Permissions</span>
                      <ul className="mt-3.5 space-y-1.5 text-slate-600 dark:text-slate-400 list-disc list-inside">
                        <li>Dashboard access</li>
                        <li>User creation & management</li>
                        <li>Order full CRUD</li>
                        <li>Financial analytics reports</li>
                        <li>System-wide settings</li>
                      </ul>
                    </div>

                    {/* Manager privileges */}
                    <div className="p-4 bg-blue-50/20 dark:bg-blue-950/10 border border-blue-200/40 dark:border-blue-850 rounded-xl">
                      <span className="font-bold text-blue-700 dark:text-blue-400">Manager Permissions</span>
                      <ul className="mt-3.5 space-y-1.5 text-slate-600 dark:text-slate-400 list-disc list-inside">
                        <li>Dashboard access</li>
                        <li>Order list view</li>
                        <li>Update order status</li>
                        <li>Financial analytics reports</li>
                        <li className="line-through text-slate-400 dark:text-slate-500">Create/Delete users</li>
                      </ul>
                    </div>

                    {/* Staff privileges */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-850 rounded-xl">
                      <span className="font-bold text-slate-700 dark:text-slate-300">Staff Permissions</span>
                      <ul className="mt-3.5 space-y-1.5 text-slate-600 dark:text-slate-400 list-disc list-inside">
                        <li>Dashboard access</li>
                        <li>Order list view only</li>
                        <li className="line-through text-slate-400 dark:text-slate-500">Edit order status</li>
                        <li className="line-through text-slate-400 dark:text-slate-500">Access sales reports</li>
                        <li className="line-through text-slate-400 dark:text-slate-500">Modify system properties</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SYSTEM TAB */}
            {activeTab === 'system' && (
              <div className="space-y-5">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 pb-3 border-b border-slate-200/50 dark:border-slate-800/50">
                  Global System Policies
                </h3>

                <div className="space-y-4">
                  {/* Maintenance Mode */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/30 rounded-xl border border-slate-100 dark:border-slate-900">
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">System Maintenance Mode</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">Restrict non-admin routes for system checkouts.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleChange('system', 'maintenanceMode', !settings.system.maintenanceMode)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                        settings.system.maintenanceMode ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-800'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.system.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  {/* Enable Notifications */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/30 rounded-xl border border-slate-100 dark:border-slate-900">
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Broadcast Notifications</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">Enable visual popups and bells for audits.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleChange('system', 'enableNotifications', !settings.system.enableNotifications)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                        settings.system.enableNotifications ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-800'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.system.enableNotifications ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  {/* Default Language */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Interface Language</label>
                    <select
                      value={settings.system.defaultLanguage}
                      onChange={(e) => handleChange('system', 'defaultLanguage', e.target.value)}
                      className="block w-full mt-1.5 px-4 py-2.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    >
                      <option value="en">English (US)</option>
                      <option value="es">Español (ES)</option>
                      <option value="de">Deutsch (DE)</option>
                      <option value="fr">Français (FR)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Save Buttons */}
            {activeTab !== 'roles' && (
              <div className="flex justify-end pt-4 border-t border-slate-200/50 dark:border-slate-800/50">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/10 hover:bg-indigo-500 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Configuration</span>
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
