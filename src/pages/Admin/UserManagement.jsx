import React, { useState, useEffect } from 'react';
import {
  Users, Search, Filter, Edit, Trash2, 
  CheckCircle, XCircle, Mail, Phone, Calendar, Shield,
  ChevronLeft, ChevronRight, Download, UserCheck, UserX,
  Eye, X, RefreshCw, Loader
} from 'lucide-react';
import { getUsers, deleteUser, toggleUserStatus, verifyUser } from '@/api/admin';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    is_verified: null,
    is_active: null,
    is_staff: null,
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [actionLoading, setActionLoading] = useState(null);
  const usersPerPage = 20;

  useEffect(() => {
    loadUsers();
  }, [currentPage, searchTerm, filters]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        page_size: usersPerPage,
      };

      if (searchTerm) params.search = searchTerm;
      if (filters.is_verified !== null) params.is_verified = filters.is_verified;
      if (filters.is_active !== null) params.is_active = filters.is_active;
      if (filters.is_staff !== null) params.is_staff = filters.is_staff;

      const response = await getUsers(params);
      
      setUsers(response.results || []);
      setTotalCount(response.count || 0);
      setTotalPages(Math.ceil((response.count || 0) / usersPerPage));
    } catch (error) {
      console.error('Failed to load users:', error);
      alert('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId) => {
    const user = users.find(u => u.id === userId);
    const action = user?.is_active ? 'deactivate' : 'activate';
    
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) {
      return;
    }

    setActionLoading(userId);
    try {
      const response = await toggleUserStatus(userId);
      
      // Update user in list
      setUsers(users.map(u => 
        u.id === userId ? { ...u, is_active: response.is_active } : u
      ));
      
      alert(response.message || `User ${action}d successfully!`);
    } catch (error) {
      console.error('Failed to toggle user status:', error);
      alert(error.response?.data?.message || 'Failed to update user status.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleVerifyUser = async (userId) => {
    if (!window.confirm('Are you sure you want to verify this user?')) {
      return;
    }

    setActionLoading(userId);
    try {
      const response = await verifyUser(userId);
      
      // Update user in list
      setUsers(users.map(u => 
        u.id === userId ? { ...u, is_verified: response.is_verified } : u
      ));
      
      alert(response.message || 'User verified successfully!');
    } catch (error) {
      console.error('Failed to verify user:', error);
      alert(error.response?.data?.message || 'Failed to verify user.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    setActionLoading(userId);
    try {
      await deleteUser(userId);
      
      // Remove user from list
      setUsers(users.filter(u => u.id !== userId));
      setTotalCount(prev => prev - 1);
      
      alert('User deleted successfully!');
      
      // Reload if current page is now empty
      if (users.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert(error.response?.data?.message || 'Failed to delete user.');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleExport = () => {
    alert('Export functionality coming soon!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Users className="w-8 h-8 text-indigo-600" />
            User Management
          </h1>
          <p className="text-slate-500 mt-2">Manage and monitor all users in the system</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={loadUsers}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
          >
            <Download className="w-4 h-4" />
            Export Data
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard
          icon={<Users className="w-5 h-5 text-blue-600" />}
          label="Total Users"
          value={totalCount}
          bgColor="bg-blue-50"
          borderColor="border-blue-200"
        />
        <SummaryCard
          icon={<UserCheck className="w-5 h-5 text-green-600" />}
          label="Verified"
          value={users.filter(u => u.is_verified).length}
          bgColor="bg-green-50"
          borderColor="border-green-200"
        />
        <SummaryCard
          icon={<UserX className="w-5 h-5 text-amber-600" />}
          label="Unverified"
          value={users.filter(u => !u.is_verified).length}
          bgColor="bg-amber-50"
          borderColor="border-amber-200"
        />
        <SummaryCard
          icon={<Shield className="w-5 h-5 text-purple-600" />}
          label="Staff"
          value={users.filter(u => u.is_staff).length}
          bgColor="bg-purple-50"
          borderColor="border-purple-200"
        />
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              showFilters
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Filter className="w-5 h-5" />
            Filters
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4">
            <FilterSelect
              label="Verification Status"
              value={filters.is_verified}
              onChange={(val) => {
                setFilters({ ...filters, is_verified: val });
                setCurrentPage(1);
              }}
              options={[
                { value: null, label: 'All' },
                { value: true, label: 'Verified' },
                { value: false, label: 'Unverified' },
              ]}
            />
            <FilterSelect
              label="Active Status"
              value={filters.is_active}
              onChange={(val) => {
                setFilters({ ...filters, is_active: val });
                setCurrentPage(1);
              }}
              options={[
                { value: null, label: 'All' },
                { value: true, label: 'Active' },
                { value: false, label: 'Inactive' },
              ]}
            />
            <FilterSelect
              label="User Type"
              value={filters.is_staff}
              onChange={(val) => {
                setFilters({ ...filters, is_staff: val });
                setCurrentPage(1);
              }}
              options={[
                { value: null, label: 'All' },
                { value: true, label: 'Staff' },
                { value: false, label: 'Regular' },
              ]}
            />
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader className="w-12 h-12 text-indigo-600 mx-auto animate-spin" />
            <p className="mt-4 text-slate-600">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">No users found</p>
            {(searchTerm || filters.is_verified !== null || filters.is_active !== null || filters.is_staff !== null) && (
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setFilters({ is_verified: null, is_active: null, is_staff: null });
                }}
                className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">User</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{user.full_name}</p>
                            <p className="text-sm text-slate-500">ID: {user.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Mail className="w-4 h-4" />
                            {user.email}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Phone className="w-4 h-4" />
                            {user.phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          <StatusBadge
                            active={user.is_verified}
                            activeLabel="Verified"
                            inactiveLabel="Unverified"
                            activeColor="green"
                            inactiveColor="amber"
                          />
                          <StatusBadge
                            active={user.is_active}
                            activeLabel="Active"
                            inactiveLabel="Inactive"
                            activeColor="blue"
                            inactiveColor="gray"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          {user.is_staff && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                              <Shield className="w-3 h-3" />
                              Staff
                            </span>
                          )}
                          {user.has_farmer_profile && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                              🌾 Farmer
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Calendar className="w-4 h-4" />
                          <div>
                            <p>{formatDate(user.date_joined)}</p>
                            <p className="text-xs text-slate-400">{user.days_active} days</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {!user.is_verified && (
                            <button
                              onClick={() => handleVerifyUser(user.id)}
                              disabled={actionLoading === user.id}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Verify User"
                            >
                              {actionLoading === user.id ? (
                                <Loader className="w-5 h-5 animate-spin" />
                              ) : (
                                <CheckCircle className="w-5 h-5" />
                              )}
                            </button>
                          )}
                          <button
                            onClick={() => handleToggleStatus(user.id)}
                            disabled={actionLoading === user.id}
                            className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                              user.is_active
                                ? 'text-amber-600 hover:bg-amber-50'
                                : 'text-blue-600 hover:bg-blue-50'
                            }`}
                            title={user.is_active ? 'Deactivate' : 'Activate'}
                          >
                            {actionLoading === user.id ? (
                              <Loader className="w-5 h-5 animate-spin" />
                            ) : user.is_active ? (
                              <XCircle className="w-5 h-5" />
                            ) : (
                              <CheckCircle className="w-5 h-5" />
                            )}
                          </button>
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={actionLoading === user.id}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete User"
                          >
                            {actionLoading === user.id ? (
                              <Loader className="w-5 h-5 animate-spin" />
                            ) : (
                              <Trash2 className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600">
                  Showing {(currentPage - 1) * usersPerPage + 1} to {Math.min(currentPage * usersPerPage, totalCount)} of {totalCount} users
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1 || loading}
                    className="p-2 border border-slate-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="px-4 py-2 text-sm font-medium text-slate-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages || loading}
                    className="p-2 border border-slate-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedUser(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">User Details</h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {selectedUser.full_name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-slate-900">{selectedUser.full_name}</h4>
                    <p className="text-slate-500">{selectedUser.email}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                  <InfoItem label="Phone" value={selectedUser.phone} />
                  <InfoItem label="User ID" value={`#${selectedUser.id}`} />
                  <InfoItem label="Days Active" value={`${selectedUser.days_active} days`} />
                  <InfoItem label="Joined" value={formatDate(selectedUser.date_joined)} />
                  <InfoItem label="Last Login" value={formatDate(selectedUser.last_login)} />
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <h5 className="font-semibold text-slate-900 mb-3">Status</h5>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge active={selectedUser.is_verified} activeLabel="Verified" inactiveLabel="Unverified" activeColor="green" inactiveColor="amber" />
                    <StatusBadge active={selectedUser.is_active} activeLabel="Active" inactiveLabel="Inactive" activeColor="blue" inactiveColor="gray" />
                    {selectedUser.is_staff && <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full">Staff</span>}
                    {selectedUser.is_superuser && <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full">Superuser</span>}
                    {selectedUser.has_farmer_profile && <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">Farmer Profile</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper Components
const SummaryCard = ({ icon, label, value, bgColor, borderColor }) => (
  <div className={`${bgColor} border ${borderColor} rounded-xl p-4`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-600 mb-1">{label}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
      <div className="p-2 bg-white rounded-lg">{icon}</div>
    </div>
  </div>
);

const FilterSelect = ({ label, value, onChange, options }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>
    <select
      value={value === null ? '' : value}
      onChange={(e) => onChange(e.target.value === '' ? null : e.target.value === 'true')}
      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
    >
      {options.map((opt) => (
        <option key={String(opt.value)} value={opt.value === null ? '' : opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

const StatusBadge = ({ active, activeLabel, inactiveLabel, activeColor, inactiveColor }) => {
  const colors = {
    green: 'bg-green-100 text-green-700',
    amber: 'bg-amber-100 text-amber-700',
    blue: 'bg-blue-100 text-blue-700',
    gray: 'bg-slate-100 text-slate-700',
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
      active ? colors[activeColor] : colors[inactiveColor]
    }`}>
      {active ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
      {active ? activeLabel : inactiveLabel}
    </span>
  );
};

const InfoItem = ({ label, value }) => (
  <div>
    <p className="text-sm font-medium text-slate-600">{label}</p>
    <p className="text-lg font-semibold text-slate-900 mt-1">{value || 'N/A'}</p>
  </div>
);

export default UserManagement;