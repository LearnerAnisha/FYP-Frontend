import React, { useState, useEffect } from 'react';
import {
  Users, Search, Filter, MoreVertical, Edit, Trash2, 
  CheckCircle, XCircle, Mail, Phone, Calendar, Shield,
  ChevronLeft, ChevronRight, Download, UserCheck, UserX
} from 'lucide-react';

// Mock data
const mockUsers = [
  { id: 1, full_name: 'John Doe', email: 'john@example.com', phone: '+1234567890', is_verified: true, is_active: true, is_staff: false, date_joined: '2024-01-15', has_farmer_profile: true, days_active: 42 },
  { id: 2, full_name: 'Jane Smith', email: 'jane@example.com', phone: '+1234567891', is_verified: true, is_active: true, is_staff: true, date_joined: '2024-01-10', has_farmer_profile: false, days_active: 47 },
  { id: 3, full_name: 'Bob Wilson', email: 'bob@example.com', phone: '+1234567892', is_verified: false, is_active: true, is_staff: false, date_joined: '2024-02-01', has_farmer_profile: true, days_active: 26 },
  { id: 4, full_name: 'Alice Brown', email: 'alice@example.com', phone: '+1234567893', is_verified: true, is_active: false, is_staff: false, date_joined: '2024-01-20', has_farmer_profile: false, days_active: 37 },
  { id: 5, full_name: 'Charlie Davis', email: 'charlie@example.com', phone: '+1234567894', is_verified: true, is_active: true, is_staff: false, date_joined: '2024-02-10', has_farmer_profile: true, days_active: 17 },
];

const UserManagement = () => {
  const [users, setUsers] = useState(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    is_verified: null,
    is_active: null,
    is_staff: null,
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm);
    
    const matchesVerified = filters.is_verified === null || user.is_verified === filters.is_verified;
    const matchesActive = filters.is_active === null || user.is_active === filters.is_active;
    const matchesStaff = filters.is_staff === null || user.is_staff === filters.is_staff;

    return matchesSearch && matchesVerified && matchesActive && matchesStaff;
  });

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handleToggleStatus = (userId) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, is_active: !user.is_active } : user
    ));
  };

  const handleVerifyUser = (userId) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, is_verified: true } : user
    ));
  };

  const handleDeleteUser = (userId) => {
    if (confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(user => user.id !== userId));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                <Users className="w-8 h-8 text-indigo-600" />
                User Management
              </h1>
              <p className="text-slate-500 mt-2">Manage and monitor all users in the system</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg">
              <Download className="w-4 h-4" />
              Export Data
            </button>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <SummaryCard
              icon={<Users className="w-5 h-5 text-blue-600" />}
              label="Total Users"
              value={users.length}
              bgColor="bg-blue-50"
            />
            <SummaryCard
              icon={<UserCheck className="w-5 h-5 text-green-600" />}
              label="Verified"
              value={users.filter(u => u.is_verified).length}
              bgColor="bg-green-50"
            />
            <SummaryCard
              icon={<UserX className="w-5 h-5 text-amber-600" />}
              label="Unverified"
              value={users.filter(u => !u.is_verified).length}
              bgColor="bg-amber-50"
            />
            <SummaryCard
              icon={<Shield className="w-5 h-5 text-purple-600" />}
              label="Staff"
              value={users.filter(u => u.is_staff).length}
              bgColor="bg-purple-50"
            />
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
                onChange={(val) => setFilters({ ...filters, is_verified: val })}
                options={[
                  { value: null, label: 'All' },
                  { value: true, label: 'Verified' },
                  { value: false, label: 'Unverified' },
                ]}
              />
              <FilterSelect
                label="Active Status"
                value={filters.is_active}
                onChange={(val) => setFilters({ ...filters, is_active: val })}
                options={[
                  { value: null, label: 'All' },
                  { value: true, label: 'Active' },
                  { value: false, label: 'Inactive' },
                ]}
              />
              <FilterSelect
                label="User Type"
                value={filters.is_staff}
                onChange={(val) => setFilters({ ...filters, is_staff: val })}
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
                {currentUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {user.full_name.charAt(0)}
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
                          <p>{new Date(user.date_joined).toLocaleDateString()}</p>
                          <p className="text-xs text-slate-400">{user.days_active} days</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {!user.is_verified && (
                          <button
                            onClick={() => handleVerifyUser(user.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Verify User"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleToggleStatus(user.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            user.is_active
                              ? 'text-amber-600 hover:bg-amber-50'
                              : 'text-blue-600 hover:bg-blue-50'
                          }`}
                          title={user.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {user.is_active ? <XCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                        </button>
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit User"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-5 h-5" />
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
                Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-slate-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="px-4 py-2 text-sm font-medium text-slate-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-slate-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const SummaryCard = ({ icon, label, value, bgColor }) => (
  <div className={`${bgColor} rounded-xl p-4 border border-slate-200`}>
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

export default UserManagement;