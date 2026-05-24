import apiClient from "./client";
import { getUserCoordinates } from "@/utils/useGeolocation";

export async function fetchWeatherAndForecast() {
  const coords = await getUserCoordinates(); // never null anymore

  const res = await apiClient.post("/api/weather/forecast/", {
    lat: coords.lat,
    lon: coords.lon,
  });

  return {
    ...res.data,
    city: coords.city || res.data.city,
    owmCity: res.data.city,                   // ← ADD THIS: raw OWM city (for API calls)
    isDefault: coords.isDefault,   // ← pass to UI
    defaultCity: coords.city,
  };
}