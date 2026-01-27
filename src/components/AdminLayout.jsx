import React, { useState } from 'react';
import { 
  LayoutDashboard, Users, Shield, MessageSquare, Leaf, 
  DollarSign, Activity, Menu, X, LogOut, Search,
  ChevronDown, Bell, Settings
} from 'lucide-react';
import { getAdminUser } from '@/lib/adminAuth';
import { adminLogout } from '@/api/admin';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [expandedMenus, setExpandedMenus] = useState({});
  const adminUser = getAdminUser();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      adminLogout();
    }
  };

  const handleNavigation = (path, sectionId) => {
    setActiveSection(sectionId);
    window.location.href = path;
  };

  const toggleSubmenu = (menuId) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      path: '/admin/dashboard'
    },
    {
      id: 'users',
      label: 'Users',
      icon: <Users className="w-5 h-5" />,
      path: '/admin/users'
    },
    {
      id: 'chatbot',
      label: 'Chatbot',
      icon: <MessageSquare className="w-5 h-5" />,
      path: '/admin/chat-conversations'
    },
    {
      id: 'scan-results',
      label: 'Crop Disease',
      icon: <Leaf className="w-5 h-5" />,
      path: '/admin/scan-results'
    },
    {
      id: 'price-predictor',
      label: 'Price Predictor',
      icon: <DollarSign className="w-5 h-5" />,
      path: '/admin/price-predictor'
    },
    {
      id: 'activity-logs',
      label: 'Activity Logs',
      icon: <Activity className="w-5 h-5" />,
      path: '/admin/activity-logs'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-5 h-5" />,
      path: '/admin/settings'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full bg-white shadow-xl transition-all duration-300 z-50 ${
        sidebarOpen ? 'w-72' : 'w-20'
      }`}>
        {/* Logo & Toggle */}
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
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 overflow-y-auto" style={{ height: 'calc(100vh - 64px)' }}>
          {menuItems.map((item) => (
            <div key={item.id}>
              {item.submenu ? (
                <>
                  <button
                    onClick={() => toggleSubmenu(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
                      expandedMenus[item.id]
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      {sidebarOpen && <span className="font-medium">{item.label}</span>}
                    </div>
                    {sidebarOpen && (
                      <ChevronDown className={`w-4 h-4 transition-transform ${
                        expandedMenus[item.id] ? 'rotate-180' : ''
                      }`} />
                    )}
                  </button>
                  {expandedMenus[item.id] && sidebarOpen && (
                    <div className="ml-4 mt-1 space-y-1 border-l-2 border-indigo-200 pl-4">
                      {item.submenu.map((subItem) => (
                        <button
                          key={subItem.id}
                          onClick={() => handleNavigation(subItem.path, subItem.id)}
                          className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-all ${
                            activeSection === subItem.id
                              ? 'bg-indigo-100 text-indigo-700 font-medium'
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {subItem.label}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <button
                  onClick={() => handleNavigation(item.path, item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activeSection === item.id
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {item.icon}
                  {sidebarOpen && <span className="font-medium">{item.label}</span>}
                </button>
              )}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-72' : 'ml-20'}`}>
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30">
          <div className="h-full px-6 flex items-center justify-between">
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              <div className="h-8 w-px bg-slate-200"></div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {adminUser?.full_name?.charAt(0) || 'A'}
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-semibold text-slate-900">{adminUser?.full_name || 'Admin'}</p>
                  <p className="text-xs text-slate-500">{adminUser?.email || ''}</p>
                </div>
              </div>

              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
              >
                <LogOut className="w-4 h-4" />
                <span className="font-medium hidden md:inline">Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;