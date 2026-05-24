const DEFAULT_CITY = "Kathmandu";
const DEFAULT_COORDS = { lat: 27.7172, lon: 85.3240 };

async function reverseGeocode(lat, lon) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      { headers: { "Accept-Language": "en" } }
    );
    const data = await res.json();
    return (
      data?.address?.suburb ||
      data?.address?.neighbourhood ||
      data?.address?.town ||
      data?.address?.city ||
      null
    );
  } catch {
    return null;
  }
}

export async function getUserCoordinates() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      return resolve({ ...DEFAULT_COORDS, isDefault: true, city: DEFAULT_CITY });
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        // Falls back to DEFAULT_CITY if reverse geocode fails (CORS etc.)
        const city = (await reverseGeocode(lat, lon)) ?? DEFAULT_CITY;
        resolve({ lat, lon, isDefault: false, city });
      },
      () => resolve({ ...DEFAULT_COORDS, isDefault: true, city: DEFAULT_CITY }),
      { timeout: 5000 }
    );
  });
}