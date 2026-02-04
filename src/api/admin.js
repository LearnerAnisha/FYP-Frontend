import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_ADMIN_URL;

// =======================
// Axios instance
// =======================
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// =======================
// Request interceptor
// =======================
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("admin_access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// =======================
// Response interceptor (refresh token)
// =======================
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("admin_refresh_token");

        const response = await axios.post(
          `${import.meta.env.VITE_AUTH_BASE_URL}/token/refresh/`,
          { refresh: refreshToken }
        );

        const { access } = response.data;
        localStorage.setItem("admin_access_token", access);

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // logout if refresh fails
        localStorage.removeItem("admin_access_token");
        localStorage.removeItem("admin_refresh_token");
        localStorage.removeItem("admin_user");
        window.location.href = "/admin/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// =======================
// AUTH
// =======================

/**
 * Admin login
 * POST /api/admin/login/
 */
export const adminLogin = (credentials) => {
  return apiClient.post("/login/", credentials);
};

/**
 * Admin logout
 */
export const adminLogout = () => {
  localStorage.removeItem("admin_access_token");
  localStorage.removeItem("admin_refresh_token");
  localStorage.removeItem("admin_user");
  window.location.href = "/admin/login";
};

// =======================
// DASHBOARD
// =======================

export const getDashboardStats = async () => {
  const response = await apiClient.get("/dashboard/stats/");
  return response.data;
};

// =======================
// USER MANAGEMENT
// =======================

export const getUsers = async (params = {}) => {
  const response = await apiClient.get("/users/", { params });
  return response.data;
};

export const getUserDetail = async (id) => {
  const response = await apiClient.get(`/users/${id}/`);
  return response.data;
};

export const updateUser = async (id, data) => {
  const response = await apiClient.patch(`/users/${id}/`, data);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await apiClient.delete(`/users/${id}/`);
  return response.data;
};

export const toggleUserStatus = async (id) => {
  const response = await apiClient.patch(`/users/${id}/toggle-status/`);
  return response.data;
};

export const verifyUser = async (id) => {
  const response = await apiClient.patch(`/users/${id}/verify/`);
  return response.data;
};

// =======================
// ACTIVITY LOGS
// =======================

export const getActivityLogs = async (params = {}) => {
  const response = await apiClient.get("/activity-logs/", { params });
  return response.data;
};

// =======================
// CHATBOT MANAGEMENT
// =======================

export const getChatConversations = async (params = {}) => {
  const response = await apiClient.get("/chat-conversations/", { params });
  return response.data;
};

export const getChatConversationDetail = async (pk) => {
  const response = await apiClient.get(`/chat-conversations/${pk}/`);
  return response.data;
};

export const updateChatConversation = async (pk, data) => {
  const response = await apiClient.patch(`/chat-conversations/${pk}/`, data);
  return response.data;
};

export const deleteChatConversation = async (pk) => {
  const response = await apiClient.delete(`/chat-conversations/${pk}/`);
  return response.data;
};

export const getChatMessages = async (params = {}) => {
  const response = await apiClient.get("/chat-messages/", { params });
  return response.data;
};

// =======================
// CROP & WEATHER
// =======================

export const getCropSuggestions = async (params = {}) => {
  const response = await apiClient.get("/crop-suggestions/", { params });
  return response.data;
};

export const getWeatherData = async (params = {}) => {
  const response = await apiClient.get("/weather-data/", { params });
  return response.data;
};

// =======================
// DISEASE SCANS
// =======================

export const getScanResults = async (params = {}) => {
  const response = await apiClient.get("/scan-results/", { params });
  return response.data;
};

export const getScanResultDetail = async (pk) => {
  const response = await apiClient.get(`/scan-results/${pk}/`);
  return response.data;
};

export const updateScanResult = async (pk, data) => {
  const response = await apiClient.patch(`/scan-results/${pk}/`, data);
  return response.data;
};

export const deleteScanResult = async (pk) => {
  const response = await apiClient.delete(`/scan-results/${pk}/`);
  return response.data;
};

export default apiClient;


// import React, { useState, useEffect } from 'react';
// import { getUsers, toggleUserStatus, verifyUser, deleteUser } from "@/api/admin";
// import {
//   Users, Search, Filter, MoreVertical, Edit, Trash2,
//   CheckCircle, XCircle, Mail, Phone, Calendar, Shield,
//   ChevronLeft, ChevronRight, Download, UserCheck, UserX
// } from 'lucide-react';

// const UserManagement = () => {
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [totalCount, setTotalCount] = useState(0);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filters, setFilters] = useState({
//     is_verified: null,
//     is_active: null,
//     is_staff: null,
//   });
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [showFilters, setShowFilters] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);
//   const usersPerPage = 10;

//   // Filter users
//   const filteredUsers = users.filter(user => {
//     const matchesSearch =
//       user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       user.phone.includes(searchTerm);

//     const matchesVerified = filters.is_verified === null || user.is_verified === filters.is_verified;
//     const matchesActive = filters.is_active === null || user.is_active === filters.is_active;
//     const matchesStaff = filters.is_staff === null || user.is_staff === filters.is_staff;

//     return matchesSearch && matchesVerified && matchesActive && matchesStaff;
//   });

//   // Pagination
//   const currentUsers = users;
//   const totalPages = Math.ceil(totalCount / usersPerPage);

//   const handleToggleStatus = async (userId) => {
//     try {
//       await toggleUserStatus(userId);
//       fetchUsers(); // re-fetch fresh data
//     } catch (err) {
//       alert("Failed to update status");
//     }
//   };

//   const handleVerifyUser = async (userId) => {
//     try {
//       await verifyUser(userId);
//       fetchUsers();
//     } catch (err) {
//       alert("Failed to verify user");
//     }
//   };

//   const handleDeleteUser = async (userId) => {
//     if (!confirm("Are you sure you want to delete this user?")) return;

//     try {
//       await deleteUser(userId);
//       fetchUsers();
//     } catch (err) {
//       alert("Failed to delete user");
//     }
//   };

//   useEffect(() => {
//     fetchUsers();
//   }, [currentPage, searchTerm, filters]);

//   const fetchUsers = async () => {
//     try {
//       setLoading(true);
//       const data = await getUsers({
//         page: currentPage,
//         search: searchTerm,
//         is_verified: filters.is_verified,
//         is_active: filters.is_active,
//         is_staff: filters.is_staff,
//       });

//       // if DRF pagination
//       setUsers(data.results);
//       setTotalCount(data.count);

//     } catch (err) {
//       setError("Failed to load users");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="mb-8">
//           <div className="flex items-center justify-between mb-6">
//             <div>
//               <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
//                 <Users className="w-8 h-8 text-indigo-600" />
//                 User Management
//               </h1>
//               <p className="text-slate-500 mt-2">Manage and monitor all users in the system</p>
//             </div>
//             <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg">
//               <Download className="w-4 h-4" />
//               Export Data
//             </button>
//           </div>

//           {/* Stats Summary */}
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//             <SummaryCard
//               icon={<Users className="w-5 h-5 text-blue-600" />}
//               label="Total Users"
//               value={users.length}
//               bgColor="bg-blue-50"
//             />
//             <SummaryCard
//               icon={<UserCheck className="w-5 h-5 text-green-600" />}
//               label="Verified"
//               value={users.filter(u => u.is_verified).length}
//               bgColor="bg-green-50"
//             />
//             <SummaryCard
//               icon={<UserX className="w-5 h-5 text-amber-600" />}
//               label="Unverified"
//               value={users.filter(u => !u.is_verified).length}
//               bgColor="bg-amber-50"
//             />
//             <SummaryCard
//               icon={<Shield className="w-5 h-5 text-purple-600" />}
//               label="Staff"
//               value={users.filter(u => u.is_staff).length}
//               bgColor="bg-purple-50"
//             />
//           </div>
//         </div>

//         {/* Search and Filters */}
//         <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-6">
//           <div className="flex flex-col lg:flex-row gap-4">
//             {/* Search */}
//             <div className="flex-1 relative">
//               <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
//               <input
//                 type="text"
//                 placeholder="Search by name, email, or phone..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
//               />
//             </div>

//             {/* Filter Toggle */}
//             <button
//               onClick={() => setShowFilters(!showFilters)}
//               className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${showFilters
//                   ? 'bg-indigo-600 text-white shadow-md'
//                   : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
//                 }`}
//             >
//               <Filter className="w-5 h-5" />
//               Filters
//             </button>
//           </div>

//           {/* Filter Options */}
//           {showFilters && (
//             <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4">
//               <FilterSelect
//                 label="Verification Status"
//                 value={filters.is_verified}
//                 onChange={(val) => setFilters({ ...filters, is_verified: val })}
//                 options={[
//                   { value: null, label: 'All' },
//                   { value: true, label: 'Verified' },
//                   { value: false, label: 'Unverified' },
//                 ]}
//               />
//               <FilterSelect
//                 label="Active Status"
//                 value={filters.is_active}
//                 onChange={(val) => setFilters({ ...filters, is_active: val })}
//                 options={[
//                   { value: null, label: 'All' },
//                   { value: true, label: 'Active' },
//                   { value: false, label: 'Inactive' },
//                 ]}
//               />
//               <FilterSelect
//                 label="User Type"
//                 value={filters.is_staff}
//                 onChange={(val) => setFilters({ ...filters, is_staff: val })}
//                 options={[
//                   { value: null, label: 'All' },
//                   { value: true, label: 'Staff' },
//                   { value: false, label: 'Regular' },
//                 ]}
//               />
//             </div>
//           )}
//         </div>

//         {/* Users Table */}
//         <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead className="bg-slate-50 border-b border-slate-200">
//                 <tr>
//                   <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">User</th>
//                   <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Contact</th>
//                   <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
//                   <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Role</th>
//                   <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Joined</th>
//                   <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-slate-200">

//                 {/* 1. Loading */}
//                 {loading && (
//                   <tr>
//                     <td colSpan={6} className="p-6 text-center text-slate-500">
//                       Loading users...
//                     </td>
//                   </tr>
//                 )}

//                 {/* 2. No users */}
//                 {!loading && users.length === 0 && (
//                   <tr>
//                     <td colSpan={6} className="p-6 text-center text-slate-500">
//                       No users found
//                     </td>
//                   </tr>
//                 )}

//                 {/* 3. Users */}
//                 {!loading && currentUsers.map((user) => (
//                   <tr key={user.id} className="hover:bg-slate-50 transition-colors">

//                     {/* USER */}
//                     <td className="px-6 py-4">
//                       <div className="flex items-center gap-3">
//                         <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-semibold">
//                           {user.full_name?.charAt(0)}
//                         </div>
//                         <div>
//                           <p className="font-semibold text-slate-900">{user.full_name}</p>
//                           <p className="text-sm text-slate-500">ID: {user.id}</p>
//                         </div>
//                       </div>
//                     </td>

//                     {/* CONTACT */}
//                     <td className="px-6 py-4">
//                       <div className="space-y-1 text-sm text-slate-600">
//                         <div className="flex items-center gap-2">
//                           <Mail className="w-4 h-4" />
//                           {user.email}
//                         </div>
//                         <div className="flex items-center gap-2">
//                           <Phone className="w-4 h-4" />
//                           {user.phone || "—"}
//                         </div>
//                       </div>
//                     </td>

//                     {/* STATUS */}
//                     <td className="px-6 py-4 space-y-1">
//                       <StatusBadge
//                         active={user.is_verified}
//                         activeLabel="Verified"
//                         inactiveLabel="Unverified"
//                         activeColor="green"
//                         inactiveColor="amber"
//                       />
//                       <StatusBadge
//                         active={user.is_active}
//                         activeLabel="Active"
//                         inactiveLabel="Inactive"
//                         activeColor="blue"
//                         inactiveColor="gray"
//                       />
//                     </td>

//                     {/* ROLE */}
//                     <td className="px-6 py-4">
//                       {user.is_staff && (
//                         <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
//                           <Shield className="w-3 h-3" />
//                           Staff
//                         </span>
//                       )}
//                     </td>

//                     {/* JOINED */}
//                     <td className="px-6 py-4 text-sm text-slate-600">
//                       <div className="flex items-center gap-2">
//                         <Calendar className="w-4 h-4" />
//                         {new Date(user.date_joined).toLocaleDateString()}
//                       </div>
//                     </td>

//                     {/* ACTIONS */}
//                     <td className="px-6 py-4 text-right">
//                       <div className="flex justify-end gap-2">
//                         {!user.is_verified && (
//                           <button onClick={() => handleVerifyUser(user.id)}>
//                             <CheckCircle className="w-5 h-5 text-green-600" />
//                           </button>
//                         )}
//                         <button onClick={() => handleToggleStatus(user.id)}>
//                           {user.is_active ? (
//                             <XCircle className="w-5 h-5 text-amber-600" />
//                           ) : (
//                             <CheckCircle className="w-5 h-5 text-blue-600" />
//                           )}
//                         </button>
//                         <button onClick={() => handleDeleteUser(user.id)}>
//                           <Trash2 className="w-5 h-5 text-red-600" />
//                         </button>
//                       </div>
//                     </td>

//                   </tr>
//                 ))}

//               </tbody>

//             </table>
//           </div>

//           {/* Pagination */}
//           <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
//             <div className="flex items-center justify-between">
//               <p className="text-sm text-slate-600">
//                 Showing {(currentPage - 1) * usersPerPage + 1}
//                 {" "}to{" "}
//                 {(currentPage - 1) * usersPerPage + users.length}
//                 {" "}of {totalCount} users
//               </p>
//               <div className="flex items-center gap-2">
//                 <button
//                   onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
//                   disabled={currentPage === 1}
//                   className="p-2 border border-slate-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                 >
//                   <ChevronLeft className="w-5 h-5" />
//                 </button>
//                 <span className="px-4 py-2 text-sm font-medium text-slate-700">
//                   Page {currentPage} of {totalPages}
//                 </span>
//                 <button
//                   onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
//                   disabled={currentPage === totalPages}
//                   className="p-2 border border-slate-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                 >
//                   <ChevronRight className="w-5 h-5" />
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Helper Components
// const SummaryCard = ({ icon, label, value, bgColor }) => (
//   <div className={`${bgColor} rounded-xl p-4 border border-slate-200`}>
//     <div className="flex items-center justify-between">
//       <div>
//         <p className="text-sm font-medium text-slate-600 mb-1">{label}</p>
//         <p className="text-2xl font-bold text-slate-900">{value}</p>
//       </div>
//       <div className="p-2 bg-white rounded-lg">{icon}</div>
//     </div>
//   </div>
// );

// const FilterSelect = ({ label, value, onChange, options }) => (
//   <div>
//     <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>
//     <select
//       value={value === null ? '' : value}
//       onChange={(e) => onChange(e.target.value === '' ? null : e.target.value === 'true')}
//       className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
//     >
//       {options.map((opt) => (
//         <option key={String(opt.value)} value={opt.value === null ? '' : opt.value}>
//           {opt.label}
//         </option>
//       ))}
//     </select>
//   </div>
// );

// const StatusBadge = ({ active, activeLabel, inactiveLabel, activeColor, inactiveColor }) => {
//   const colors = {
//     green: 'bg-green-100 text-green-700',
//     amber: 'bg-amber-100 text-amber-700',
//     blue: 'bg-blue-100 text-blue-700',
//     gray: 'bg-slate-100 text-slate-700',
//   };

//   return (
//     <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${active ? colors[activeColor] : colors[inactiveColor]
//       }`}>
//       {active ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
//       {active ? activeLabel : inactiveLabel}
//     </span>
//   );
// };

// export default UserManagement;