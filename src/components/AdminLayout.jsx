import React, { useState } from 'react';
import {
  LayoutDashboard, Users, Shield, MessageSquare, Leaf,
  DollarSign, Activity, Menu, X, LogOut, Search,
  Bell, Settings
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { getAdminUser } from '@/lib/adminAuth';
import { adminLogout } from '@/api/admin';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const adminUser = getAdminUser();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      adminLogout();
    }
  };

  const menuItems = [
    { label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, path: '/admin/dashboard' },
    { label: 'Users', icon: <Users className="w-5 h-5" />, path: '/admin/users' },
    { label: 'Chatbot', icon: <MessageSquare className="w-5 h-5" />, path: '/admin/chat-conversations' },
    { label: 'Crop Disease', icon: <Leaf className="w-5 h-5" />, path: '/admin/scan-results' },
    { label: 'Price Predictor', icon: <DollarSign className="w-5 h-5" />, path: '/admin/price-predictor' },
    { label: 'Settings', icon: <Settings className="w-5 h-5" />, path: '/admin/settings' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full bg-white shadow-xl transition-all duration-300 z-50 ${
        sidebarOpen ? 'w-72' : 'w-20'
      }`}>
        <div className="h-16 border-b border-slate-200 flex items-center justify-between px-6">
          {sidebarOpen && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-lg">Farm Admin</h2>
                <p className="text-xs text-slate-500">Management Portal</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-slate-100 rounded-lg"
          >
            {sidebarOpen ? <X /> : <Menu />}
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {menuItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              {item.icon}
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-72' : 'ml-20'}`}>
        {/* Header */}
        <header className="h-16 bg-white border-b sticky top-0 z-30">
          <div className="h-full px-6 flex items-center justify-between">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
                placeholder="Search..."
              />
            </div>

            <div className="flex items-center gap-4">
              <Bell className="text-slate-600" />
              <div className="text-right">
                <p className="text-sm font-semibold">{adminUser?.full_name}</p>
                <p className="text-xs text-slate-500">{adminUser?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
