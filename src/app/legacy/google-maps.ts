/** Google Maps integration retired. FurryCorner now uses OpenStreetMap + Leaflet. */
export function onMapsAuthFailure(_handler: () => void): void {}
export function loadGoogleMaps(): Promise<any> {
  return Promise.reject(new Error('GOOGLE_MAPS_REMOVED_USE_OPENSTREETMAP'));
}
