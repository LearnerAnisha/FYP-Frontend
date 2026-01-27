import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('admin_refresh_token');
        const response = await axios.post(
          `${API_BASE_URL.replace('/api/admin', '')}/api/token/refresh/`,
          { refresh: refreshToken }
        );

        const { access } = response.data;
        localStorage.setItem('admin_access_token', access);

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('admin_access_token');
        localStorage.removeItem('admin_refresh_token');
        localStorage.removeItem('admin_user');
        window.location.href = '/admin/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ==========================================
// AUTHENTICATION & DASHBOARD
// ==========================================

/**
 * Admin login
 * POST /api/admin/login/
 */
export const adminLogin = (credentials) => {
  return apiClient.post('/login/', credentials);
};

/**
 * Admin logout (client-side)
 */
export const adminLogout = () => {
  localStorage.removeItem('admin_access_token');
  localStorage.removeItem('admin_refresh_token');
  localStorage.removeItem('admin_user');
  window.location.href = '/admin/login';
};

/**
 * Get dashboard statistics
 * GET /api/admin/dashboard/stats/
 */
export const getDashboardStats = async () => {
  const response = await apiClient.get('/dashboard/stats/');
  return response.data;
};

// ==========================================
// USER MANAGEMENT
// ==========================================

/**
 * Get list of users with optional filters
 * GET /api/admin/users/
 * Query params: search, is_verified, is_active, is_staff, sort_by, page, page_size
 */
export const getUsers = async (params = {}) => {
  const response = await apiClient.get('/users/', { params });
  return response.data;
};

/**
 * Get single user details
 * GET /api/admin/users/{id}/
 */
export const getUserDetail = async (id) => {
  const response = await apiClient.get(`/users/${id}/`);
  return response.data;
};

/**
 * Update user details
 * PATCH /api/admin/users/{id}/
 */
export const updateUser = async (id, data) => {
  const response = await apiClient.patch(`/users/${id}/`, data);
  return response.data;
};

/**
 * Delete user
 * DELETE /api/admin/users/{id}/
 */
export const deleteUser = async (id) => {
  const response = await apiClient.delete(`/users/${id}/`);
  return response.data;
};

/**
 * Toggle user active status
 * PATCH /api/admin/users/{id}/toggle-status/
 */
export const toggleUserStatus = async (id) => {
  const response = await apiClient.patch(`/users/${id}/toggle-status/`);
  return response.data;
};

/**
 * Manually verify user
 * PATCH /api/admin/users/{id}/verify/
 */
export const verifyUser = async (id) => {
  const response = await apiClient.patch(`/users/${id}/verify/`);
  return response.data;
};

// ==========================================
// ACTIVITY LOGS
// ==========================================

/**
 * Get activity logs
 * GET /api/admin/activity-logs/
 * Query params: admin_id, action, search, page, page_size
 */
export const getActivityLogs = async (params = {}) => {
  const response = await apiClient.get('/activity-logs/', { params });
  return response.data;
};

// ==========================================
// CHATBOT MANAGEMENT
// ==========================================

/**
 * Get chat conversations list
 * GET /api/admin/chat-conversations/
 * Query params: search, page, page_size
 */
export const getChatConversations = async (params = {}) => {
  const response = await apiClient.get('/chat-conversations/', { params });
  return response.data;
};

/**
 * Get single conversation details with messages
 * GET /api/admin/chat-conversations/{pk}/
 */
export const getChatConversationDetail = async (pk) => {
  const response = await apiClient.get(`/chat-conversations/${pk}/`);
  return response.data;
};

/**
 * Update conversation
 * PATCH /api/admin/chat-conversations/{pk}/
 */
export const updateChatConversation = async (pk, data) => {
  const response = await apiClient.patch(`/chat-conversations/${pk}/`, data);
  return response.data;
};

/**
 * Delete conversation
 * DELETE /api/admin/chat-conversations/{pk}/
 */
export const deleteChatConversation = async (pk) => {
  const response = await apiClient.delete(`/chat-conversations/${pk}/`);
  return response.data;
};

/**
 * Get chat messages
 * GET /api/admin/chat-messages/
 * Query params: conversation_id, role, page, page_size
 */
export const getChatMessages = async (params = {}) => {
  const response = await apiClient.get('/chat-messages/', { params });
  return response.data;
};

/**
 * Get crop suggestions
 * GET /api/admin/crop-suggestions/
 * Query params: search, page, page_size
 */
export const getCropSuggestions = async (params = {}) => {
  const response = await apiClient.get('/crop-suggestions/', { params });
  return response.data;
};

/**
 * Get weather data
 * GET /api/admin/weather-data/
 * Query params: location, page, page_size
 */
export const getWeatherData = async (params = {}) => {
  const response = await apiClient.get('/weather-data/', { params });
  return response.data;
};

// ==========================================
// CROP DISEASE DETECTION
// ==========================================

/**
 * Get scan results list
 * GET /api/admin/scan-results/
 * Query params: search, severity, page, page_size
 */
export const getScanResults = async (params = {}) => {
  const response = await apiClient.get('/scan-results/', { params });
  return response.data;
};

/**
 * Get single scan result details
 * GET /api/admin/scan-results/{pk}/
 */
export const getScanResultDetail = async (pk) => {
  const response = await apiClient.get(`/scan-results/${pk}/`);
  return response.data;
};

/**
 * Update scan result
 * PATCH /api/admin/scan-results/{pk}/
 */
export const updateScanResult = async (pk, data) => {
  const response = await apiClient.patch(`/scan-results/${pk}/`, data);
  return response.data;
};

/**
 * Delete scan result
 * DELETE /api/admin/scan-results/{pk}/
 */
export const deleteScanResult = async (pk) => {
  const response = await apiClient.delete(`/scan-results/${pk}/`);
  return response.data;
};

export default apiClient;