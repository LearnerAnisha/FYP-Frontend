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
