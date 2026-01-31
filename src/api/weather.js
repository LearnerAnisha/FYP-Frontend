import apiClient from "./client";
import { getUserCoordinates } from "@/utils/useGeolocation";

export async function fetchWeatherAndForecast() {
  const coords = await getUserCoordinates();
  if (!coords) return null;

  const res = await apiClient.post("/api/weather/forecast/", {
    lat: coords.lat,
    lon: coords.lon,
  });

  return res.data;
}
