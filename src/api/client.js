import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

/* =========================
   REQUEST INTERCEPTOR
   ========================= */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access");

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
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If access token expired
    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      const refresh = localStorage.getItem("refresh");

      if (!refresh) {
        // No refresh token → force logout
        localStorage.clear();
        window.location.href = "/auth";
        return Promise.reject(error);
      }

      try {
        const res = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/auth/token/refresh/`,
          { refresh }
        );

        // Save new access token
        localStorage.setItem("access", res.data.access);

        // Retry original request with new token
        originalRequest.headers.Authorization =
          `Bearer ${res.data.access}`;

        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh token also expired
        localStorage.clear();
        window.location.href = "/auth";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;