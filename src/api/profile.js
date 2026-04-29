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
  const isFormData = data instanceof FormData;

  const response = await apiClient.patch("/api/auth/profile/", data, {
    headers: isFormData
      ? { "Content-Type": "multipart/form-data" }
      : { "Content-Type": "application/json" },
  });

  return response.data;
}

export async function changePassword(data) {
  const response = await apiClient.post("/api/auth/change-password/", data);
  return response.data;
}

export async function deleteAccount() {
  const response = await apiClient.delete("/api/auth/delete-account/");
  return response.data;
}

export async function exportData() {
  const response = await apiClient.get("/api/auth/export-data/", {
    responseType: "blob",
  });
  // Trigger browser download
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "krishisathi_export.json");
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}