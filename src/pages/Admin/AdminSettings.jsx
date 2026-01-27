import React, { useState } from 'react';
import { Settings, User, Bell, Shield, Save } from 'lucide-react';
import { getAdminUser } from '@/lib/adminAuth';

const AdminSettings = () => {
  const adminUser = getAdminUser();
  const [settings, setSettings] = useState({
    notifications: true,
    emailAlerts: false,
    twoFactor: false,
  });

  const handleSave = () => {
    alert('Settings saved successfully!');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Settings className="w-8 h-8 text-indigo-600" />
          Settings
        </h1>
        <p className="text-slate-500 mt-2">Manage your admin panel preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <User className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-900">Profile Information</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-600">Full Name</label>
              <p className="mt-1 text-lg font-semibold text-slate-900">{adminUser?.full_name || 'Admin'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Email</label>
              <p className="mt-1 text-slate-900">{adminUser?.email || ''}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Role</label>
              <div className="mt-1">
                {adminUser?.is_superuser ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full">
                    <Shield className="w-4 h-4" />
                    Superuser
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full">
                    <Shield className="w-4 h-4" />
                    Staff
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Notifications Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-900">Notifications</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">Push Notifications</p>
                <p className="text-sm text-slate-500">Receive push notifications</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={(e) => setSettings({...settings, notifications: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">Email Alerts</p>
                <p className="text-sm text-slate-500">Receive email notifications</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.emailAlerts}
                  onChange={(e) => setSettings({...settings, emailAlerts: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">Two-Factor Auth</p>
                <p className="text-sm text-slate-500">Enable 2FA for extra security</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.twoFactor}
                  onChange={(e) => setSettings({...settings, twoFactor: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg font-medium"
        >
          <Save className="w-5 h-5" />
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default AdminSettings;