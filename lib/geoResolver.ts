import { cityCoordinates, languageRegionFallback } from './cityCoordinates'

const nominatimCache = new Map<string, {lat: number, lng: number} | null>()
let lastNominatimCall = 0
const SKIP_TERMS = ['earth', 'worldwide', 'internet', 'global', 'everywhere', 'online', 'the internet', 'moon', 'mars', 'space']

export type GeoConfidence = 'exact' | 'city' | 'region'

export interface ResolvedLocation {
  lat: number
  lng: number
  confidence: GeoConfidence
  resolvedName?: string
}

export async function resolveLocation(
  locationText: string | null | undefined,
  detectedLanguage: string | null
): Promise<ResolvedLocation | null> {

  if (locationText) {
    const normalised = locationText.toLowerCase().trim()
    if (SKIP_TERMS.includes(normalised)) return null

    // Direct city lookup
    if (cityCoordinates[normalised]) {
      return { ...cityCoordinates[normalised], confidence: 'city', resolvedName: locationText }
    }

    // Split on commas and spaces, try each part
    const parts = normalised.split(/[,\/\|]+/).map(p => p.trim())
    for (const part of parts) {
      if (cityCoordinates[part]) {
        return { ...cityCoordinates[part], confidence: 'city', resolvedName: part }
      }
      // Try removing common suffixes like "area", "region", "city"
      const cleaned = part.replace(/\s*(area|region|city|town|district)\s*$/i, '').trim()
      if (cityCoordinates[cleaned]) {
        return { ...cityCoordinates[cleaned], confidence: 'city', resolvedName: cleaned }
      }
    }

    // Nominatim fallback - rate limited
    if (locationText.length > 2) {
      if (nominatimCache.has(locationText)) {
        const cached = nominatimCache.get(locationText)
        return cached ? { ...cached, confidence: 'city', resolvedName: locationText } : null
      }
      const now = Date.now()
      if (now - lastNominatimCall >= 1100) {
        lastNominatimCall = now
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationText)}&format=json&limit=1`,
            { headers: { 'User-Agent': 'FeedMeLight-FanIntelligence/1.0 (ben.leyland@feedmelight.com)' } }
          )
          const data = await res.json()
          if (data[0]) {
            const coords = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
            nominatimCache.set(locationText, coords)
            return { ...coords, confidence: 'city', resolvedName: locationText }
          }
          nominatimCache.set(locationText, null)
        } catch {}
      }
    }
  }

  // Language region fallback
  if (detectedLanguage && languageRegionFallback[detectedLanguage]) {
    const region = languageRegionFallback[detectedLanguage]
    const jitter = () => (Math.random() - 0.5) * region.radius
    return { lat: region.lat + jitter(), lng: region.lng + jitter(), confidence: 'region' }
  }

  return null
}
