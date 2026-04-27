import apiClient from "./client";

export async function getDashboardStats() {
  const response = await apiClient.get("/api/dashboard/stats/");
  return response.data;
}
