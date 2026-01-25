/**
 * lib/auth.js
 * -----------
 * Authentication utilities for user session management
 */

/**
 * Store user authentication data
 */
export const setAuth = (access, refresh, user) => {
  localStorage.setItem("access", access);
  localStorage.setItem("refresh", refresh);
  localStorage.setItem("user", JSON.stringify(user));
};

/**
 * Get authentication data
 */
export const getAuth = () => {
  const access = localStorage.getItem("access");
  const refresh = localStorage.getItem("refresh");
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  return { access, refresh, user };
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  const { access, user } = getAuth();
  return !!(access && user);
};

/**
 * Clear authentication
 */
export const clearAuth = () => {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  localStorage.removeItem("user");
};

/**
 * Get current user
 */
export const getCurrentUser = () => {
  const { user } = getAuth();
  return user;
};

/**
 * Logout user
 */
export const logout = () => {
  clearAuth();
  window.location.href = "/auth";
};