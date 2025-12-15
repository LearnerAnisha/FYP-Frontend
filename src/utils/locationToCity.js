// Converts browser location → city name
export async function saveCityFromLocation() {
  if (!navigator.geolocation) return;

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

      try {
        const res = await fetch(
          `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`
        );

        const data = await res.json();

        const city = data?.[0]?.name;

        if (city) {
          // Store ONLY city
          localStorage.setItem("user_city", city);
        }
      } catch (err) {
        console.log("Failed to get city");
      }
    },
    () => {
      // User denied → do nothing
      console.log("Location denied");
    }
  );
}
