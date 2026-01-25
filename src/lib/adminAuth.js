/**
 * Store admin authentication data
 * @param {string} access - Access token
 * @param {string} refresh - Refresh token
 * @param {Object} user - Admin user object
 */
export const setAdminAuth = (access, refresh, user) => {
  localStorage.setItem("admin_access", access);
  localStorage.setItem("admin_refresh", refresh);
  localStorage.setItem("admin_user", JSON.stringify(user));
};

/**
 * Get admin user from localStorage
 * @returns {Object|null} Admin user object
 */
export const getAdminUser = () => {
  const userStr = localStorage.getItem("admin_user");
  return userStr ? JSON.parse(userStr) : null;
};

/**
 * Get admin access token
 * @returns {string|null} Access token
 */
export const getAdminToken = () => {
  return localStorage.getItem("admin_access");
};

/**
 * Check if admin is authenticated
 * @returns {boolean}
 */
export const isAdminAuthenticated = () => {
  const token = localStorage.getItem("admin_access");
  const user = getAdminUser();
  return !!(token && user);
};

/**
 * Clear admin authentication
 */
export const clearAdminAuth = () => {
  localStorage.removeItem("admin_access");
  localStorage.removeItem("admin_refresh");
  localStorage.removeItem("admin_user");
};

/**
 * Check if user has admin privileges
 * @returns {boolean}
 */
export const isAdmin = () => {
  const user = getAdminUser();
  return user?.is_staff || user?.is_superuser || false;
};