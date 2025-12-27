import apiClient from "./client";

/**
 * Fetch current weather + 5-day forecast
 */
export async function getCurrentWeather({ city, lat, lon }) {
  const params = new URLSearchParams();

  if (lat && lon) {
    params.append("lat", lat);
    params.append("lon", lon);
  } else if (city) {
    params.append("city", city);
  }

  const response = await apiClient.get(
    `/api/weather/current/?${params.toString()}`
  );

  return response.data;
}