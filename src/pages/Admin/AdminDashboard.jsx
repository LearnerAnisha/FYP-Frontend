import React, { useEffect, useState } from 'react';
import {
  Users, UserCheck, UserX, Shield,
  TrendingUp, Calendar, Filter, BarChart3, Activity
} from 'lucide-react';

// TEMP mock (we’ll wire API later)
const mockGetDashboardStats = async () => {
  return {
    overview: {
      total_users: 1248,
      verified_users: 1102,
      unverified_users: 146,
      active_users: 1180,
      inactive_users: 68,
      staff_users: 12,
      total_farmers: 856
    },
    registrations: {
      today: 23,
      this_week: 167,
      this_month: 542
    }
  };
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await mockGetDashboardStats();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Title */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
        <p className="text-sm text-slate-500 mt-1">Welcome back</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard icon={<Users className="w-8 h-8" />} title="Total Users" value={stats.overview.total_users} change="+12.5%" changeType="positive" gradient="from-blue-500 to-cyan-500" />
        <StatCard icon={<UserCheck className="w-8 h-8" />} title="Verified Users" value={stats.overview.verified_users} change="+8.3%" changeType="positive" gradient="from-green-500 to-emerald-500" />
        <StatCard icon={<UserX className="w-8 h-8" />} title="Unverified" value={stats.overview.unverified_users} change="-3.2%" changeType="negative" gradient="from-amber-500 to-orange-500" />
        <StatCard icon={<Shield className="w-8 h-8" />} title="Staff Members" value={stats.overview.staff_users} change="+1" changeType="positive" gradient="from-purple-500 to-pink-500" />
      </div>

      {/* Middle Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Registrations */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold">Recent Registrations</h2>
              <p className="text-sm text-slate-500">User growth over time</p>
            </div>
            <Calendar className="text-slate-400" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <MetricCard label="Today" value={stats.registrations.today} icon={<TrendingUp className="text-blue-500" />} />
            <MetricCard label="This Week" value={stats.registrations.this_week} icon={<TrendingUp className="text-green-500" />} />
            <MetricCard label="This Month" value={stats.registrations.this_month} icon={<TrendingUp className="text-purple-500" />} />
          </div>
        </div>

        {/* Distribution */}
        <div className="bg-white rounded-2xl shadow-lg border p-6">
          <h2 className="text-xl font-bold mb-6">User Distribution</h2>
          <ProgressBar label="Active Users" value={stats.overview.active_users} total={stats.overview.total_users} color="bg-green-500" />
          <ProgressBar label="Inactive Users" value={stats.overview.inactive_users} total={stats.overview.total_users} color="bg-slate-400" />
          <ProgressBar label="Farmers" value={stats.overview.total_farmers} total={stats.overview.total_users} color="bg-amber-500" />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-lg border p-6">
        <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <ActionButton icon={<Users />} label="Manage Users" description="View and edit users" />
          <ActionButton icon={<Activity />} label="View Logs" description="Check activity logs" />
          <ActionButton icon={<Filter />} label="Filter Data" description="Advanced filtering" />
          <ActionButton icon={<BarChart3 />} label="Analytics" description="Detailed reports" />
        </div>
      </div>
    </div>
  );
};

// Components
const NavItem = ({ icon, label, active, collapsed, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${active
        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
        : 'text-slate-600 hover:bg-slate-100'
      }`}
  >
    {icon}
    {!collapsed && <span className="font-medium">{label}</span>}
  </button>
);

const StatCard = ({ icon, title, value, change, changeType, gradient }) => (
  <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-shadow">
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-md`}>
        {icon}
      </div>
      <span className={`text-sm font-semibold px-2 py-1 rounded-full ${changeType === 'positive' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
        {change}
      </span>
    </div>
    <h3 className="text-sm font-medium text-slate-600 mb-1">{title}</h3>
    <p className="text-3xl font-bold text-slate-900">{value.toLocaleString()}</p>
  </div>
);

const MetricCard = ({ label, value, icon }) => (
  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
    <div className="flex items-center justify-between mb-2">
      <p className="text-sm font-medium text-slate-600">{label}</p>
      {icon}
    </div>
    <p className="text-2xl font-bold text-slate-900">{value}</p>
  </div>
);

const ProgressBar = ({ label, value, total, color }) => {
  const percentage = Math.round((value / total) * 100);
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <span className="text-sm font-semibold text-slate-900">{value}</span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2">
        <div
          className={`${color} h-2 rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

const ActionButton = ({ icon, label, description, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all group"
  >
    <div className="p-2 bg-white rounded-lg border border-slate-200 group-hover:border-indigo-300 transition-colors">
      {icon}
    </div>
    <div className="text-left">
      <h3 className="font-semibold text-slate-900 mb-1">{label}</h3>
      <p className="text-sm text-slate-500">{description}</p>
    </div>
  </button>
);

export default AdminDashboard;