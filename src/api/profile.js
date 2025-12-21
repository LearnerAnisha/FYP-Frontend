import apiClient from "./client";

/**
 * Fetch logged-in user's profile
 * GET /api/profile/
 */
export async function fetchProfile() {
  const response = await apiClient.get("/api/auth/profile/");
  return response.data;
}

/**
 * Update logged-in user's profile
 * PUT /api/profile/
 */
export async function updateProfile(data) {
  const response = await apiClient.put("/api/auth/profile/", data);
  return response.data;
}

/**
 * Change logged-in user's password
 * POST /api/change-password/
 */
export async function changePassword(data) {
  const response = await apiClient.post("/api/auth/change-password/", data);
  return response.data;
}

export async function deleteAccount() {
  const response = await apiClient.delete("/api/auth/delete-account/");
  return response.data;
}