import React, { useState, useEffect } from 'react';
import { 
  getUsers, 
  createUser,
  getUserDetail,
  updateUser,
  toggleUserStatus, 
  verifyUser, 
  deleteUser 
} from "@/api/admin";
import {
  Users, Search, Filter, MoreVertical, Edit, Trash2,
  CheckCircle, XCircle, Mail, Phone, Calendar, Shield,
  ChevronLeft, ChevronRight, Download, UserCheck, UserX, 
  Plus, Eye, X
} from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    is_verified: '',
    is_active: '',
    is_staff: '',
    sort_by: '-date_joined'
  });
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Selected user for operations
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Form data for create/edit
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    is_verified: false,
    is_active: true,
    is_staff: false,
    is_superuser: false,
    accepted_terms: true,
  });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 20;
  const totalPages = Math.ceil(totalCount / usersPerPage);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm, filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        search: searchTerm || undefined,
        is_verified: filters.is_verified || undefined,
        is_active: filters.is_active || undefined,
        is_staff: filters.is_staff || undefined,
        sort_by: filters.sort_by || undefined,
      };

      const data = await getUsers(params);
      setUsers(data.results || []);
      setTotalCount(data.count || 0);
    } catch (err) {
      console.error("Failed to load users", err);
      alert("Failed to load users: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    try {
      setLoading(true);
      const response = await createUser(formData);
      setShowCreateModal(false);
      resetForm();
      fetchUsers();
      alert(response.message || "User created successfully");
    } catch (err) {
      console.error("Failed to create user", err);
      const errors = err.response?.data?.errors || err.response?.data || {};
      const errorMessage = Object.entries(errors)
        .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
        .join('\n') || "Failed to create user";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (userId) => {
    try {
      setLoading(true);
      const data = await getUserDetail(userId);
      setSelectedUser(data);
      setShowViewModal(true);
    } catch (err) {
      console.error("Failed to load user details", err);
      alert("Failed to load user details");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (userId) => {
    try {
      setLoading(true);
      const data = await getUserDetail(userId);
      setSelectedUser(data);
      setFormData({
        full_name: data.full_name || '',
        email: data.email || '',
        phone: data.phone || '',
        password: '', // Don't populate password for security
        is_verified: data.is_verified || false,
        is_active: data.is_active || true,
        is_staff: data.is_staff || false,
        is_superuser: data.is_superuser || false,
        accepted_terms: data.accepted_terms || true,
      });
      setShowEditModal(true);
    } catch (err) {
      console.error("Failed to load user details", err);
      alert("Failed to load user details");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    try {
      setLoading(true);
      // Remove password if empty
      const updateData = { ...formData };
      if (!updateData.password) {
        delete updateData.password;
      }
      
      const response = await updateUser(selectedUser.id, updateData);
      setShowEditModal(false);
      resetForm();
      fetchUsers();
      alert("User updated successfully");
    } catch (err) {
      console.error("Failed to update user", err);
      const errors = err.response?.data || {};
      const errorMessage = Object.entries(errors)
        .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
        .join('\n') || "Failed to update user";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      const response = await toggleUserStatus(userId);
      fetchUsers();
      alert(response.message || "Status updated successfully");
    } catch (err) {
      console.error("Failed to update status", err);
      alert(err.response?.data?.message || "Failed to update status");
    }
  };

  const handleVerifyUser = async (userId) => {
    try {
      const response = await verifyUser(userId);
      fetchUsers();
      alert(response.message || "User verified successfully");
    } catch (err) {
      console.error("Failed to verify user", err);
      alert(err.response?.data?.message || "Failed to verify user");
    }
  };

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      await deleteUser(selectedUser.id);
      setShowDeleteModal(false);
      setSelectedUser(null);
      fetchUsers();
      alert("User deleted successfully");
    } catch (err) {
      console.error("Failed to delete user", err);
      alert(err.response?.data?.message || "Failed to delete user");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      password: '',
      is_verified: false,
      is_active: true,
      is_staff: false,
      is_superuser: false,
      accepted_terms: true,
    });
    setSelectedUser(null);
  };

  const resetFilters = () => {
    setFilters({
      is_verified: '',
      is_active: '',
      is_staff: '',
      sort_by: '-date_joined'
    });
    setCurrentPage(1);
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
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
        >
          <Plus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard
          icon={<Users className="w-5 h-5 text-blue-600" />}
          label="Total Users"
          value={totalCount}
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
                setCurrentPage(1);
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
          <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-4">
            <FilterSelect
              label="Verification Status"
              value={filters.is_verified}
              onChange={(val) => setFilters({ ...filters, is_verified: val })}
              options={[
                { value: '', label: 'All' },
                { value: 'true', label: 'Verified' },
                { value: 'false', label: 'Unverified' },
              ]}
            />
            <FilterSelect
              label="Active Status"
              value={filters.is_active}
              onChange={(val) => setFilters({ ...filters, is_active: val })}
              options={[
                { value: '', label: 'All' },
                { value: 'true', label: 'Active' },
                { value: 'false', label: 'Inactive' },
              ]}
            />
            <FilterSelect
              label="User Type"
              value={filters.is_staff}
              onChange={(val) => setFilters({ ...filters, is_staff: val })}
              options={[
                { value: '', label: 'All' },
                { value: 'true', label: 'Staff' },
                { value: 'false', label: 'Regular' },
              ]}
            />
            <FilterSelect
              label="Sort By"
              value={filters.sort_by}
              onChange={(val) => setFilters({ ...filters, sort_by: val })}
              options={[
                { value: '-date_joined', label: 'Newest First' },
                { value: 'date_joined', label: 'Oldest First' },
                { value: 'full_name', label: 'Name A-Z' },
                { value: '-full_name', label: 'Name Z-A' },
                { value: 'email', label: 'Email A-Z' },
              ]}
            />
            <button
              onClick={resetFilters}
              className="col-span-full text-sm text-red-600 hover:text-red-700 font-medium text-left"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">User</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Contact</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Role</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Joined</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-500">
                    Loading users...
                  </td>
                </tr>
              )}

              {!loading && users.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-500">
                    No users found
                  </td>
                </tr>
              )}

              {!loading && users.map((user) => (
                <tr key={user.id} className="group hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-semibold">
                        {user.full_name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{user.full_name}</p>
                        <p className="text-sm text-slate-500">ID: {user.id}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="space-y-1 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {user.email}
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {user.phone || "—"}
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 space-y-1">
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
                  </td>

                  <td className="px-6 py-4">
                    {user.is_staff && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                        <Shield className="w-3 h-3" />
                        Staff
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(user.date_joined).toLocaleDateString()}
                    </div>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleView(user.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="View Details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleEdit(user.id)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                        title="Edit User"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      {!user.is_verified && (
                        <button
                          onClick={() => handleVerifyUser(user.id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                          title="Verify User"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleToggleStatus(user.id)}
                        className={`p-2 rounded-lg ${
                          user.is_active
                            ? "text-amber-600 hover:bg-amber-50"
                            : "text-blue-600 hover:bg-blue-50"
                        }`}
                        title={user.is_active ? "Deactivate" : "Activate"}
                      >
                        {user.is_active ? (
                          <XCircle className="w-5 h-5" />
                        ) : (
                          <CheckCircle className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteClick(user)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
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
              Showing {totalCount === 0 ? 0 : (currentPage - 1) * usersPerPage + 1} to{' '}
              {Math.min(currentPage * usersPerPage, totalCount)} of {totalCount} users
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
                Page {currentPage} of {totalPages || 1}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages || totalPages === 0 || loading}
                className="p-2 border border-slate-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <UserFormModal
          title="Create New User"
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleCreateUser}
          onClose={() => {
            setShowCreateModal(false);
            resetForm();
          }}
          loading={loading}
          isCreate={true}
        />
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <UserFormModal
          title="Edit User"
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleUpdateUser}
          onClose={() => {
            setShowEditModal(false);
            resetForm();
          }}
          loading={loading}
          isCreate={false}
        />
      )}

      {/* View User Modal */}
      {showViewModal && selectedUser && (
        <Modal onClose={() => setShowViewModal(false)} title="User Details">
          <div className="space-y-4">
            <DetailRow label="Full Name" value={selectedUser.full_name} />
            <DetailRow label="Email" value={selectedUser.email} />
            <DetailRow label="Phone" value={selectedUser.phone} />
            <DetailRow 
              label="Verified" 
              value={selectedUser.is_verified ? "Yes" : "No"} 
            />
            <DetailRow 
              label="Active" 
              value={selectedUser.is_active ? "Yes" : "No"} 
            />
            <DetailRow 
              label="Staff" 
              value={selectedUser.is_staff ? "Yes" : "No"} 
            />
            <DetailRow 
              label="Superuser" 
              value={selectedUser.is_superuser ? "Yes" : "No"} 
            />
            <DetailRow 
              label="Date Joined" 
              value={new Date(selectedUser.date_joined).toLocaleString()} 
            />
            <DetailRow 
              label="Last Login" 
              value={selectedUser.last_login ? new Date(selectedUser.last_login).toLocaleString() : "Never"} 
            />
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <Modal onClose={() => setShowDeleteModal(false)} title="Confirm Delete">
          <p className="text-slate-600 mb-6">
            Are you sure you want to delete user <strong>{selectedUser.full_name}</strong>? 
            This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <button
              onClick={confirmDelete}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Deleting...' : 'Delete'}
            </button>
            <button
              onClick={() => setShowDeleteModal(false)}
              className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
            >
              Cancel
            </button>
          </div>
        </Modal>
      )}
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
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
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

const Modal = ({ onClose, title, children }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between p-6 border-b border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

const DetailRow = ({ label, value }) => (
  <div className="flex justify-between py-2 border-b border-slate-100">
    <span className="font-semibold text-slate-600">{label}:</span>
    <span className="text-slate-900">{value}</span>
  </div>
);

const UserFormModal = ({ title, formData, setFormData, onSubmit, onClose, loading, isCreate }) => (
  <Modal onClose={onClose} title={title}>
    <div className="space-y-4">
      <InputField
        label="Full Name"
        value={formData.full_name}
        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
        placeholder="John Doe"
      />
      <InputField
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        placeholder="john@example.com"
        disabled={!isCreate}
      />
      <InputField
        label="Phone"
        value={formData.phone}
        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        placeholder="98XXXXXXXX"
      />
      <InputField
        label={isCreate ? "Password" : "Password (leave blank to keep current)"}
        type="password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        placeholder="••••••••"
      />
      
      <div className="grid grid-cols-2 gap-4">
        <CheckboxField
          label="Verified"
          checked={formData.is_verified}
          onChange={(e) => setFormData({ ...formData, is_verified: e.target.checked })}
        />
        <CheckboxField
          label="Active"
          checked={formData.is_active}
          onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
        />
        <CheckboxField
          label="Staff"
          checked={formData.is_staff}
          onChange={(e) => setFormData({ ...formData, is_staff: e.target.checked })}
        />
        <CheckboxField
          label="Superuser"
          checked={formData.is_superuser}
          onChange={(e) => setFormData({ ...formData, is_superuser: e.target.checked })}
        />
      </div>
    </div>
    
    <div className="flex gap-3 mt-6">
      <button
        onClick={onSubmit}
        disabled={loading}
        className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
      >
        {loading ? 'Saving...' : isCreate ? 'Create User' : 'Save Changes'}
      </button>
      <button
        onClick={onClose}
        className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
      >
        Cancel
      </button>
    </div>
  </Modal>
);

const InputField = ({ label, type = 'text', value, onChange, placeholder, disabled = false }) => (
  <div>
    <label className="block text-sm font-semibold text-slate-700 mb-2">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none disabled:bg-slate-100"
    />
  </div>
);

const CheckboxField = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-2 cursor-pointer">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-2 focus:ring-indigo-500"
    />
    <span className="text-sm font-medium text-slate-700">{label}</span>
  </label>
);

export default UserManagement;