import axios from "axios";

// Create a separate axios instance for admin API
const adminApiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

/* =========================
   REQUEST INTERCEPTOR
   ========================= */
adminApiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("admin_access");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* =========================
   RESPONSE INTERCEPTOR
   ========================= */
adminApiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refresh = localStorage.getItem("admin_refresh");
      if (!refresh) {
        localStorage.removeItem("admin_access");
        localStorage.removeItem("admin_refresh");
        localStorage.removeItem("admin_user");
        window.location.href = "/admin/login";
        return Promise.reject(error);
      }

      try {
        const res = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/accounts/token/refresh/`,
          { refresh }
        );
        localStorage.setItem("admin_access", res.data.access);
        originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
        return adminApiClient(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("admin_access");
        localStorage.removeItem("admin_refresh");
        localStorage.removeItem("admin_user");
        window.location.href = "/admin/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

/* =========================
   AUTHENTICATION
   ========================= */

/**
 * Admin login
 * @param {Object} credentials - { email, password } or { identifier, password }
 */
export const adminLogin = async (credentials) => {
  const response = await axios.post(
    `${import.meta.env.VITE_API_BASE_URL}/api/admin/login/`,
    {
      identifier: credentials.email || credentials.identifier,
      password: credentials.password,
    }
  );
  return response;
};

/**
 * Admin logout
 */
export const adminLogout = () => {
  localStorage.removeItem("admin_access");
  localStorage.removeItem("admin_refresh");
  localStorage.removeItem("admin_user");
  window.location.href = "/admin/login";
};

/* =========================
   DASHBOARD
   ========================= */

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async () => {
  const response = await adminApiClient.get("/api/admin/dashboard/stats/");
  return response.data;
};

/* =========================
   USER MANAGEMENT
   ========================= */

/**
 * Get all users with pagination and filters
 * @param {Object} params - { page, search, is_verified, is_active, is_staff, sort_by }
 */
export const getUsers = async (params = {}) => {
  const response = await adminApiClient.get("/api/admin/users/", { params });
  return response.data;
};

/**
 * Get single user by ID
 * @param {number} userId
 */
export const getUser = async (userId) => {
  const response = await adminApiClient.get(`/api/admin/users/${userId}/`);
  return response.data;
};

/**
 * Update user
 * @param {number} userId
 * @param {Object} data - User data to update
 */
export const updateUser = async (userId, data) => {
  const response = await adminApiClient.put(`/api/admin/users/${userId}/`, data);
  return response.data;
};

/**
 * Partial update user
 * @param {number} userId
 * @param {Object} data - User data to update
 */
export const patchUser = async (userId, data) => {
  const response = await adminApiClient.patch(`/api/admin/users/${userId}/`, data);
  return response.data;
};

/**
 * Delete user
 * @param {number} userId
 */
export const deleteUser = async (userId) => {
  const response = await adminApiClient.delete(`/api/admin/users/${userId}/`);
  return response.data;
};

/**
 * Toggle user active status
 * @param {number} userId
 */
export const toggleUserStatus = async (userId) => {
  const response = await adminApiClient.patch(
    `/api/admin/users/${userId}/toggle-status/`
  );
  return response.data;
};

/**
 * Manually verify user
 * @param {number} userId
 */
export const verifyUser = async (userId) => {
  const response = await adminApiClient.patch(
    `/api/admin/users/${userId}/verify/`
  );
  return response.data;
};

/* =========================
   ACTIVITY LOGS
   ========================= */

/**
 * Get admin activity logs
 * @param {Object} params - { page, admin_id, action, date_from, date_to }
 */
export const getActivityLogs = async (params = {}) => {
  const response = await adminApiClient.get("/api/admin/activity-logs/", {
    params,
  });
  return response.data;
};

/* =========================
   EXPORT
   ========================= */
export default adminApiClient;