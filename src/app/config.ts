// Address of your PHP API (the furrycorner_api folder).
// A phone cannot reach "localhost" on your PC - use your PC's LAN IP (run `ipconfig`, look for IPv4),
// or your hosted server URL later. No trailing slash.
export const API_BASE = 'https://furrycorner.online/furrycorner_api';

// Google Maps BROWSER key (Maps JavaScript API + Places API (New) + Geocoding API only).
// Paste your own key between the quotes. This key ships inside the app, so it MUST be restricted in Google Cloud:
//   - Application restriction: Websites (HTTP referrers) -> http://localhost/*, https://furrycorner.online/*,
//     and http://localhost:4200/* while developing. (Your capacitor.config.ts uses androidScheme 'http'.)
//   - API restriction: only the three APIs above.
// Leave it empty ('') and the address page simply hides the map and keeps manual entry.
// Never put a server-side / unrestricted key here.
export const GOOGLE_MAPS_BROWSER_KEY = '';

// Set to true ONLY after you have added the latitude/longitude columns to user_addresses (see the SQL in the
// instructions). While false, the map still fills the address form but coordinates are not sent to Supabase,
// so saving keeps working with your current table.
export const SAVE_ADDRESS_COORDINATES = false;

// Phones that draw the app edge-to-edge (behind the status bar and the gesture bar) report the size of those
// bars to the page. If a phone reports nothing, these fallbacks (in px) keep the top bar and the bottom tabs
// clear of them. Raise/lower them if you still see overlap or too much empty space.
export const STATUS_BAR_FALLBACK_PX = 40;
export const NAV_BAR_FALLBACK_PX = 20;