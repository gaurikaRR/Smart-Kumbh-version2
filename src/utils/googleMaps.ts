// Helper utilities for free Google Maps deep-links and navigation (No API key required)

/**
 * Generates a direct Google Maps walking navigation link
 * This opens natively in the Google Maps app on Android and iOS, or in the browser on desktop.
 */
export function getGoogleMapsNavigationUrl(
  origin: [number, number],
  destination: [number, number],
  travelMode: 'walking' | 'driving' | 'transit' = 'walking'
): string {
  const originStr = `${origin[0]},${origin[1]}`;
  const destStr = `${destination[0]},${destination[1]}`;
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
    originStr
  )}&destination=${encodeURIComponent(destStr)}&travelmode=${travelMode}`;
}

/**
 * Generates a direct Google Maps pin link for sharing coordinates
 */
export function getGoogleMapsPinUrl(coordinates: [number, number]): string {
  return `https://www.google.com/maps/search/?api=1&query=${coordinates[0]},${coordinates[1]}`;
}

/**
 * Generates a one-tap WhatsApp location sharing link with coordinates and Google Maps pin
 */
export function getWhatsAppShareLocationUrl(
  coordinates: [number, number],
  message: string = 'My current location at Kumbh Mela:'
): string {
  const mapLink = `https://maps.google.com/?q=${coordinates[0]},${coordinates[1]}`;
  const fullText = `${message}\n${mapLink}`;
  return `https://wa.me/?text=${encodeURIComponent(fullText)}`;
}
