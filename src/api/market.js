import apiClient from "./client";

// Fetch today's stored market prices.
export async function getMarketPrices(params = {}, signal) {
  const query = new URLSearchParams(params).toString();
  const response = await apiClient.get(`/api/market/latest/?${query}`, {
    signal,
  });
  return response.data;
}

// Fetch price comparison (today vs previous day), trend, % change.
export async function getMarketAnalysis() {
  const response = await apiClient.get("/api/market/analysis/");
  return response.data;
}
