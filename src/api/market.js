import apiClient from "./client";

export const getMarketAnalysis = async () => {
  const response = await apiClient.get("api/market/analysis/");
  return response.data;
};

export const getMarketPrices = async (params = {}, signal = null) => {
  const response = await apiClient.get("api/market/latest/", { params, signal });
  return response.data;
};

export const getDailyPriceHistory = async (days = 30) => {
  const response = await apiClient.get("api/market/history/", { params: { days } });
  return response.data;
};

export const getCropHistory = async (commodity) => {
  const response = await apiClient.get(
    `api/market/history-last-month/${encodeURIComponent(commodity)}/`
  );
  return response.data;
};

export const getForecast = async (commodity, days = 28, model = "ensemble") => {
  const response = await apiClient.get("/api/market_forecast/forecast/", {
    params: { commodity, days, model },
  });
  return response.data;
};

export const getCommodities = async () => {
  const response = await apiClient.get("/api/market_forecast/commodities/");
  return response.data;
};