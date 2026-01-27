import React, { useEffect, useState } from 'react';
import { 
  Users, UserCheck, UserX, Shield, Activity, 
  TrendingUp, Calendar, MessageSquare, Leaf, Loader
} from 'lucide-react';
import { getDashboardStats } from '@/api/admin';
import { getAdminUser } from '@/lib/adminAuth';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const adminUser = getAdminUser();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-16 h-16 text-indigo-600 mx-auto animate-spin" />
          <p className="mt-4 text-slate-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back, {adminUser?.full_name || 'Admin'}!</h1>
        <p className="text-indigo-100">Here's what's happening with your platform today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Users className="w-8 h-8" />}
          title="Total Users"
          value={stats?.overview?.total_users || 0}
          change="+12.5%"
          changeType="positive"
          gradient="from-blue-500 to-cyan-500"
        />
        <StatCard
          icon={<UserCheck className="w-8 h-8" />}
          title="Verified Users"
          value={stats?.overview?.verified_users || 0}
          change="+8.3%"
          changeType="positive"
          gradient="from-green-500 to-emerald-500"
        />
        <StatCard
          icon={<UserX className="w-8 h-8" />}
          title="Unverified"
          value={stats?.overview?.unverified_users || 0}
          change="-3.2%"
          changeType="negative"
          gradient="from-amber-500 to-orange-500"
        />
        <StatCard
          icon={<Shield className="w-8 h-8" />}
          title="Staff Members"
          value={stats?.overview?.staff_users || 0}
          change="+1"
          changeType="positive"
          gradient="from-purple-500 to-pink-500"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Registrations Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Recent Registrations</h2>
              <p className="text-sm text-slate-500 mt-1">User growth over time</p>
            </div>
            <Calendar className="w-6 h-6 text-slate-400" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <MetricCard
              label="Today"
              value={stats?.registrations?.today || 0}
              icon={<TrendingUp className="w-5 h-5 text-blue-500" />}
            />
            <MetricCard
              label="This Week"
              value={stats?.registrations?.this_week || 0}
              icon={<TrendingUp className="w-5 h-5 text-green-500" />}
            />
            <MetricCard
              label="This Month"
              value={stats?.registrations?.this_month || 0}
              icon={<TrendingUp className="w-5 h-5 text-purple-500" />}
            />
          </div>
        </div>

        {/* Additional Stats */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Platform Stats</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-slate-700">Conversations</span>
              </div>
              <span className="text-lg font-bold text-blue-600">{stats?.chatbot?.total_conversations || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Leaf className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-slate-700">Disease Scans</span>
              </div>
              <span className="text-lg font-bold text-green-600">{stats?.disease_detection?.total_scans || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-slate-700">Farmers</span>
              </div>
              <span className="text-lg font-bold text-purple-600">{stats?.overview?.total_farmers || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <ActionButton
            icon={<Users className="w-5 h-5" />}
            label="Manage Users"
            description="View and edit users"
            onClick={() => window.location.href = '/admin/users'}
          />
          <ActionButton
            icon={<MessageSquare className="w-5 h-5" />}
            label="Conversations"
            description="Check chat history"
            onClick={() => window.location.href = '/admin/chat-conversations'}
          />
          <ActionButton
            icon={<Leaf className="w-5 h-5" />}
            label="Scan Results"
            description="View disease scans"
            onClick={() => window.location.href = '/admin/scan-results'}
          />
          <ActionButton
            icon={<Activity className="w-5 h-5" />}
            label="Activity Logs"
            description="Monitor admin actions"
            onClick={() => window.location.href = '/admin/activity-logs'}
          />
        </div>
      </div>
    </div>
  );
};

// Helper Components
const StatCard = ({ icon, title, value, change, changeType, gradient }) => (
  <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-shadow">
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-md`}>
        {icon}
      </div>
      <span className={`text-sm font-semibold px-2 py-1 rounded-full ${
        changeType === 'positive' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
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

const ActionButton = ({ icon, label, description, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all group text-left"
  >
    <div className="p-2 bg-white rounded-lg border border-slate-200 group-hover:border-indigo-300 transition-colors">
      {icon}
    </div>
    <div>
      <h3 className="font-semibold text-slate-900 mb-1">{label}</h3>
      <p className="text-sm text-slate-500">{description}</p>
    </div>
  </button>
);

export default AdminDashboard;