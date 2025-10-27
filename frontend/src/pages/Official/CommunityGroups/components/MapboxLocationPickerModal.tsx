import { Button } from "@/components/ui/button"
import { CircleCheck, CircleX } from "lucide-react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { useEffect, useMemo, useRef, useState } from "react"
import { ensureSquareBlueImage } from "../utils/BoundaryLine"
import { reverseGeocode } from "../utils/geocoding"
import { animatePinSaved } from "../utils/PinAnimation"
import SettingLocationAlerts, { type SettingLocationAlertsHandle } from "./SettingLocationAlerts"
import SettingLocationControls from "./SettingLocationControls"

mapboxgl.accessToken = "pk.eyJ1Ijoicm9kZWxsbCIsImEiOiJjbWU0OXNvb2gwYnM0MnpvbXNueXo2dzhxIn0.Ep43_IxVhaPhEqWBaAuuyA"

interface MapboxLocationPickerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onLocationSelect: (address: string, coordinates: string) => void
  initialCoordinates?: string // "lng, lat" format (Mapbox standard)
}

export function MapboxLocationPickerModal({
  open,
  onOpenChange,
  onLocationSelect,
  initialCoordinates,
}: MapboxLocationPickerModalProps) {
  const [baseStyle] = useState<"streets-v12" | "satellite-streets-v12">("streets-v12")
  const [terminalSaved, setTerminalSaved] = useState(false)
  const alertsRef = useRef<SettingLocationAlertsHandle | null>(null)

  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markerRef = useRef<mapboxgl.Marker | null>(null)

  // Selected point data
  const [selectedPoint, setSelectedPoint] = useState<{ lng: number; lat: number; address: string } | null>(null)

  // Parse initial coordinates if provided (useMemo to calculate once)
  const initialCenter = useMemo<[number, number]>(() => {
    if (initialCoordinates) {
      const parts = initialCoordinates.split(',').map(s => parseFloat(s.trim()))
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        // Coordinates are already in lng,lat format (Mapbox standard)
        return [parts[0], parts[1]] // [lng, lat]
      }
    }
    return [121.049366, 14.762601] // Default Manila
  }, [initialCoordinates])

  const title = useMemo(() => {
    if (!terminalSaved) return "Setting the location ....."
    return "Confirm the pin address and coordinates?"
  }, [terminalSaved])

  // Initialize map when modal opens
  useEffect(() => {
    if (!open) return
    if (mapRef.current) return
    if (!mapContainerRef.current) return

    console.log("🗺️ Initializing Mapbox map...")

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: `mapbox://styles/mapbox/${baseStyle}`,
      center: initialCenter,
      zoom: 13.5,
    })
    mapRef.current = map
    map.addControl(new mapboxgl.NavigationControl(), "top-right")

    // If initial coordinates provided, place marker
    if (initialCoordinates) {
      const [lng, lat] = initialCenter
      markerRef.current = new mapboxgl.Marker({ color: "#3b82f6" })
        .setLngLat([lng, lat])
        .addTo(map)
      
      reverseGeocode(lng, lat).then((address) => {
        setSelectedPoint({ lng, lat, address })
        console.log(`✅ Initial location geocoded: ${address}`)
      }).catch((err) => {
        console.error("❌ Failed to geocode initial location:", err)
        setSelectedPoint({ lng, lat, address: `${lat.toFixed(6)}, ${lng.toFixed(6)}` })
      })
    }

    // Resize guards
    map.on("load", () => {
      console.log("🗺️ Map loaded successfully")
      try { ensureSquareBlueImage(map) } catch { }
      try { map.resize() } catch { }
      setTimeout(() => { try { map.resize() } catch { } }, 100)
      setTimeout(() => { try { map.resize() } catch { } }, 500)
    })

    let ro: ResizeObserver | null = null
    try {
      ro = new ResizeObserver(() => { try { map.resize() } catch { } })
      if (mapContainerRef.current) ro.observe(mapContainerRef.current)
    } catch { }

    return () => {
      console.log("🗺️ Cleaning up map...")
      try { ro && mapContainerRef.current && ro.unobserve(mapContainerRef.current) } catch { }
      try { map.remove() } catch { }
      mapRef.current = null
      markerRef.current = null
    }
  }, [open, baseStyle, initialCoordinates, initialCenter])

  // Handle map clicks for pin placement
  useEffect(() => {
    if (!mapRef.current || !open) return
    const m = mapRef.current as mapboxgl.Map

    // Clear existing listeners
    try { m.off("click", onMapClick as any) } catch {}
    
    m.on("click", onMapClick)
    
    // Set cursor on both canvas and container
    try { 
      m.getCanvas().style.cursor = "crosshair"
      if (mapContainerRef.current) {
        mapContainerRef.current.style.cursor = "crosshair"
      }
    } catch {}

    function onMapClick(e: any) {
      const { lng, lat } = e.lngLat
      
      console.log(`📍 Map clicked at: [${lng.toFixed(6)}, ${lat.toFixed(6)}]`)
      
      // Set/update marker
      if (markerRef.current) {
        markerRef.current.setLngLat([lng, lat])
      } else {
        markerRef.current = new mapboxgl.Marker({ color: "#3b82f6" })
          .setLngLat([lng, lat])
          .addTo(m)
      }
      
      // Reset saved state when placing new pin
      setTerminalSaved(false)
      
      // Reverse geocode for address
      reverseGeocode(lng, lat).then((address) => {
        console.log(`✅ Address found: ${address}`)
        setSelectedPoint({ lng, lat, address })
        alertsRef.current?.showPinAlert(`${address}\n${lng.toFixed(6)}, ${lat.toFixed(6)}`)
      }).catch((err) => {
        console.error("❌ Geocoding failed:", err)
        const fallback = `${lng.toFixed(6)}, ${lat.toFixed(6)}`
        setSelectedPoint({ lng, lat, address: fallback })
        alertsRef.current?.showPinAlert(`Coordinates: ${fallback}`)
      })
    }

    return () => {
      try { m.off("click", onMapClick as any) } catch {}
      try { 
        m.getCanvas().style.cursor = ""
        if (mapContainerRef.current) {
          mapContainerRef.current.style.cursor = ""
        }
      } catch {}
    }
  }, [open])

  // Update map style when baseStyle changes
  useEffect(() => {
    const map = mapRef.current
    if (!map || !open) return
    try { 
      map.setStyle(`mapbox://styles/mapbox/${baseStyle}`) 
      map.once("styledata", () => {
        try { ensureSquareBlueImage(map) } catch { }
      })
    } catch { }
  }, [baseStyle, open])

  const handleCancel = () => {
    // Hide alerts
    alertsRef.current?.hideAll()
    
    // Clean up marker if not saving
    if (!terminalSaved) {
      try { markerRef.current?.remove() } catch {}
      markerRef.current = null
      setSelectedPoint(null)
    }
    
    // Reset saved state
    setTerminalSaved(false)
    
    onOpenChange(false)
  }

  const handleSave = () => {
    if (!selectedPoint) return
    setTerminalSaved(true)
    alertsRef.current?.showLocationSaved()
    if (markerRef.current) {
      animatePinSaved(markerRef.current)
    }
  }

  const handleConfirm = () => {
    if (!selectedPoint) return
    
    // Hide alerts
    alertsRef.current?.hideAll()
    
    // Pass data back to parent - MUST be lng,lat format for Mapbox
    const coordinates = `${selectedPoint.lng.toFixed(6)}, ${selectedPoint.lat.toFixed(6)}`
    onLocationSelect(selectedPoint.address, coordinates)
    
    // Clean up and close
    setSelectedPoint(null)
    setTerminalSaved(false)
    try { markerRef.current?.remove() } catch {}
    markerRef.current = null
    
    onOpenChange(false)
  }

  const handleUndo = () => {
    try { markerRef.current?.remove() } catch {}
    markerRef.current = null
    setSelectedPoint(null)
    setTerminalSaved(false)
    alertsRef.current?.hideAll()
  }

  const makeTooltip = (text: string) => <span>{text}</span>
  const addCustomLayers = (_m: mapboxgl.Map) => {
    if (mapRef.current) {
      try { ensureSquareBlueImage(mapRef.current) } catch {}
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80" onClick={handleCancel}>
      <div 
        className="fixed inset-0 w-screen h-screen bg-[#171717] text-white flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a2a] bg-[#171717] z-10">
          <div className="font-semibold text-base">
            {title}
          </div>
          
          <div className="flex gap-2">
            {!terminalSaved && (
              <>
                <Button 
                  onClick={handleSave} 
                  disabled={!selectedPoint} 
                  className="bg-[#4285f4] hover:bg-[#3367d6] text-white disabled:opacity-60"
                >
                  <CircleCheck className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleCancel} 
                  className="bg-transparent border-[#2a2a2a] text-white hover:bg-[#262626]"
                >
                  <CircleX className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </>
            )}
            {terminalSaved && (
              <>
                <Button 
                  onClick={handleConfirm} 
                  className="bg-[#4285f4] hover:bg-[#3367d6] text-white"
                >
                  <CircleCheck className="w-4 h-4 mr-2" />
                  Confirm
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleCancel} 
                  className="bg-transparent border-[#2a2a2a] text-white hover:bg-[#262626]"
                >
                  <CircleX className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Map Container - Fixed height to fill remaining space */}
        <div className="relative flex-1 w-full h-[calc(100vh-73px)]">
          <div 
            ref={mapContainerRef} 
            className="absolute inset-0 w-full h-full min-h-[400px] cursor-crosshair"
          />
          
          {/* Map Controls (Floating) */}
          <div className="absolute bottom-4 right-4 z-10">
            <SettingLocationControls
              mapRef={mapRef}
              makeTooltip={makeTooltip}
              addCustomLayers={addCustomLayers}
              onUndo={handleUndo}
            />
          </div>

          {/* Alerts */}
          <SettingLocationAlerts ref={alertsRef} />
        </div>
      </div>
    </div>
  )
}
