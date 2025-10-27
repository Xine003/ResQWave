export async function reverseGeocode(lng: number, lat: number): Promise<string> {
  const token = import.meta.env.VITE_MAPBOX_TOKEN as string
  if (!token) throw new Error("Missing VITE_MAPBOX_TOKEN")
  
  // Add types parameter for more accurate address results and country bias for Philippines
  // Using 'address' type gives street-level precision, country=PH biases results to Philippines
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${token}&types=address,poi,place,locality&country=PH&limit=1`
  
  const res = await fetch(url)
  if (!res.ok) {
    console.error(`Reverse geocoding failed: ${res.status} ${res.statusText}`)
    throw new Error("Failed to reverse geocode")
  }
  
  const data = await res.json()
  
  // Check if we got valid results
  if (!data?.features || data.features.length === 0) {
    console.warn(`No geocoding results found for coordinates: ${lng}, ${lat}`)
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
  }
  
  const address = data.features[0]?.place_name
  if (!address) {
    console.warn(`Invalid place_name in geocoding response for: ${lng}, ${lat}`)
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
  }
  
  return address
}

export async function forwardGeocode(query: string): Promise<{ lng: number; lat: number; place_name: string } | null> {
  const token = import.meta.env.VITE_MAPBOX_TOKEN as string
  if (!token) throw new Error("Missing VITE_MAPBOX_TOKEN")
  
  // Add country bias for Philippines and address types for better results
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${token}&country=PH&types=address,poi,place,locality&limit=1`
  
  const res = await fetch(url)
  if (!res.ok) {
    console.error(`Forward geocoding failed: ${res.status} ${res.statusText}`)
    return null
  }
  
  const data = await res.json()
  const feat = data?.features?.[0]
  
  if (!feat) {
    console.warn(`No geocoding results found for query: "${query}"`)
    return null
  }
  
  const [lng, lat] = feat.center || []
  
  if (lng == null || lat == null) {
    console.warn(`Invalid coordinates in geocoding response for: "${query}"`)
    return null
  }
  
  return { lng, lat, place_name: feat.place_name }
}
