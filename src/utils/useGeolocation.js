export function getUserCoordinates() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);

    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        }),
      () => resolve(null),
      { timeout: 5000 }
    );
  });
}
