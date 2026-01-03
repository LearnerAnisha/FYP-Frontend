import apiClient from "./client";

// Fetch today's stored market prices.
export async function getMarketPrices({ search = "", ordering = "" } = {}) {
  const params = new URLSearchParams();

  if (search) params.append("search", search);
  if (ordering) params.append("ordering", ordering);

  const response = await apiClient.get(
    `/api/market/latest/?${params.toString()}`
  );

  return response.data;
}

// Fetch price comparison (today vs previous day), trend, % change.
export async function getMarketAnalysis() {
  const response = await apiClient.get("/api/market/analysis/");
  return response.data;
}
