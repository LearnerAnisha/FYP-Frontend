import apiClient from "@/api/client";

export async function getCurrentWeather({ lat, lon }) {
  const params = new URLSearchParams();

  if (lat && lon) {
    params.append("lat", lat);
    params.append("lon", lon);
  }

  const response = await apiClient.get(
    `/api/weather/current/?${params.toString()}`
  );

  return response.data;
}