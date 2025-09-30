export async function reverseGeocode(lng: number, lat: number): Promise<string> {
  const token = import.meta.env.VITE_MAPBOX_TOKEN as string
  if (!token) throw new Error("Missing VITE_MAPBOX_TOKEN")
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${token}&limit=1`
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to reverse geocode")
  const data = await res.json()
  return data?.features?.[0]?.place_name ?? `${lat.toFixed(6)}, ${lng.toFixed(6)}`
}

export async function forwardGeocode(query: string): Promise<{ lng: number; lat: number; place_name: string } | null> {
  const token = import.meta.env.VITE_MAPBOX_TOKEN as string
  if (!token) throw new Error("Missing VITE_MAPBOX_TOKEN")
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${token}&limit=1`
  const res = await fetch(url)
  if (!res.ok) return null
  const data = await res.json()
  const feat = data?.features?.[0]
  if (!feat) return null
  const [lng, lat] = feat.center || []
  if (lng == null || lat == null) return null
  return { lng, lat, place_name: feat.place_name }
}
