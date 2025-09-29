import { useEffect } from 'react'
import { formStore } from '../store/formStore'

export function useLocationPickerResults() {
  useEffect(() => {
    const consumePickResult = () => {
      try {
        const raw = sessionStorage.getItem("cg_pick_result")
        if (!raw) return

        sessionStorage.removeItem("cg_pick_result")
        const parsed = JSON.parse(raw)
        
        console.log("🗺️ Consuming pick result:", parsed)
        
        if (parsed?.type === "both") {
          const point = parsed?.data?.point
          const line = parsed?.data?.line
          
          const updates: any = {}
          
          if (point?.lng != null && point?.lat != null && point?.address) {
            updates.focalPersonAddress = point.address
            updates.focalPersonCoordinates = `${point.lng},${point.lat}`
          }
          
          if (line?.geojson) {
            updates.boundaryGeoJSON = line.geojson
          }
          
          if (Object.keys(updates).length > 0) {
            formStore.updateFormData(updates)
          }
        } else if (parsed?.type === "point") {
          const { lng, lat, address } = parsed.data || {}
          if (lng != null && lat != null && address) {
            formStore.updateFormData({
              focalPersonAddress: address,
              focalPersonCoordinates: `${lng},${lat}`,
            })
          }
        } else if (parsed?.type === "line") {
          const { geojson } = parsed.data || {}
          if (geojson) {
            formStore.updateFormData({ boundaryGeoJSON: geojson })
          }
        }
        
        console.log("✅ Pick result consumed successfully")
      } catch (error) {
        console.error("❌ Failed to consume pick result:", error)
      }
    }

    // Check for pick results immediately
    consumePickResult()

    // Also check on window focus (backup mechanism)
    const handleFocus = () => {
      setTimeout(consumePickResult, 100)
    }

    window.addEventListener("focus", handleFocus)
    return () => {
      window.removeEventListener("focus", handleFocus)
    }
  }, [])
}