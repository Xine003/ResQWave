// alert-dialog removed in favor of custom alerts
import { Button } from "@/components/ui/button"
import MapboxDraw from "@mapbox/mapbox-gl-draw"
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css"
import { CircleCheck, CircleX } from "lucide-react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ensureSquareBlueImage, getDrawStyles, updateBoundaryFill, updateBoundaryVertices } from "../utils/BoundaryLine"
import { reverseGeocode } from "../utils/geocoding"
import { animatePinSaved } from "../utils/PinAnimation"
import SettingLocationAlerts, { type SettingLocationAlertsHandle } from "./SettingLocationAlerts"
import SettingLocationControls from "./SettingLocationControls"

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN as string

type Phase = "terminal" | "boundary"

export default function SettingLocationPage() {
  const navigate = useNavigate()
  const [phase, setPhase] = useState<Phase>("terminal")
  const [baseStyle] = useState<"streets-v12" | "satellite-streets-v12">("streets-v12")
  const [terminalSaved, setTerminalSaved] = useState(false)
  const [boundarySaved, setBoundarySaved] = useState(false)
  const alertsRef = useRef<SettingLocationAlertsHandle | null>(null)

  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markerRef = useRef<mapboxgl.Marker | null>(null)
  const drawRef = useRef<any | null>(null)

  // Phase 1 selected point
  const [selectedPoint, setSelectedPoint] = useState<{ lng: number; lat: number; address: string } | null>(null)

  // Phase 2 boundary presence
  const [hasLine, setHasLine] = useState(false)
  // Saved boundary ring (LineString coords), used to re-add translucent fill
  const [savedBoundaryCoords, setSavedBoundaryCoords] = useState<number[][] | null>(null)
  // Live drawn coords for persistent vertex overlay
  const [lastDrawnCoords, setLastDrawnCoords] = useState<number[][] | null>(null)
  // Show polygon fill only after Save + Confirm
  const [showFill, setShowFill] = useState(false)
  // point card UI removed; using alerts instead

  const title = useMemo(() => {
    if (phase === "terminal") {
      if (!terminalSaved) return "Setting the location ....."
      return "Proceed with setting the community boundaries?"
    }
    // boundary phase
    if (!boundarySaved) return "Set this community boundaries?"
    return "Confirm location and community boundaries?"
  }, [phase, terminalSaved, boundarySaved])

  useEffect(() => {
    // guard against StrictMode double-mount
    if (mapRef.current) return
    if (!mapContainerRef.current) return

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: `mapbox://styles/mapbox/${baseStyle}`,
      center: [121.0404, 14.77216],
      zoom: 12,
    })
    mapRef.current = map
    map.addControl(new mapboxgl.NavigationControl(), "top-right")

    // Resize guards
    map.on("load", () => {
      try { ensureSquareBlueImage(map) } catch {}
      try { map.resize() } catch {}
      setTimeout(() => { try { map.resize() } catch {} }, 100)
    })
    let ro: ResizeObserver | null = null
    try {
      ro = new ResizeObserver(() => { try { map.resize() } catch {} })
      if (mapContainerRef.current) ro.observe(mapContainerRef.current)
    } catch {}

    return () => {
      try { ro && mapContainerRef.current && ro.unobserve(mapContainerRef.current) } catch {}
      try { map.remove() } catch {}
      mapRef.current = null
    }
  }, [])

  // When base style changes, update map style
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    try { map.setStyle(`mapbox://styles/mapbox/${baseStyle}`) } catch {}
    // After style change, the sprite resets. Re-add custom icon soon after style data is available.
    try {
      map.once("styledata", () => {
        try { ensureSquareBlueImage(map) } catch {}
      })
    } catch {}
  }, [baseStyle])

  // Phase handling: attach interactions for each phase
  useEffect(() => {
    if (!mapRef.current) return
    const m = mapRef.current as mapboxgl.Map
    // Hoisted handler refs so cleanup can access them safely
    let onVertsEnterOrMove: ((e: any) => void) | undefined
    let onVertsLeave: (() => void) | undefined
    let onVertsClick: ((e: any) => void) | undefined
  let detachStyleData: (() => void) | undefined

    // Clear existing listeners and draw controls
    try { m.off("click", onMapClick as any) } catch {}
    if (phase === "terminal") {
      m.on("click", onMapClick)
      // Use crosshair to match boundary point picking (plus-shaped cursor)
      try { m.getCanvas().style.cursor = "crosshair" } catch {}
    } else {
      const draw = new MapboxDraw({
        displayControlsDefault: false,
        controls: { line_string: true, trash: true },
        defaultMode: "draw_line_string",
        styles: getDrawStyles(),
      })
      drawRef.current = draw
      m.addControl(draw as any, "top-left")
      // Let Mapbox Draw manage its own cursor (reset any overrides)
      try { m.getCanvas().style.cursor = "" } catch {}

      // First-vertex UX: pointer cursor on hover, click to close/save boundary
      let vertexEventsAttached = false
      onVertsEnterOrMove = (e: any) => {
        try {
          const hasFirst = (e?.features || []).some((f: any) => f?.properties?.idx === 0)
          m.getCanvas().style.cursor = hasFirst ? "pointer" : ""
        } catch {}
      }
      onVertsLeave = () => { try { m.getCanvas().style.cursor = "" } catch {} }
      onVertsClick = (e: any) => {
        try {
          const clickedFirst = (e?.features || []).some((f: any) => f?.properties?.idx === 0)
          if (!clickedFirst) return
          if (boundarySaved) return
          const dataNow = draw.getAll()
          const linesNow = (dataNow?.features || []).filter((f: any) => f.geometry?.type === "LineString")
          if (!linesNow.length) return
          const coords = (linesNow[linesNow.length - 1].geometry?.coordinates || []) as number[][]
          if (coords.length < 3) return
          const first = coords[0]
          const last = coords[coords.length - 1]
          if (first[0] !== last[0] || first[1] !== last[1]) coords.push(first)
          setLastDrawnCoords([...coords])
          if (mapRef.current) {
            updateBoundaryVertices(mapRef.current, coords)
          }
          try { (draw as any).changeMode("simple_select") } catch {}
        } catch {}
      }
      const tryAttachVertexEvents = () => {
        if (vertexEventsAttached) return
        try {
          if (!m.getLayer("cg-boundary-vertices")) return
          if (onVertsEnterOrMove) {
            m.on("mousemove", "cg-boundary-vertices", onVertsEnterOrMove as any)
            m.on("mouseenter", "cg-boundary-vertices", onVertsEnterOrMove as any)
          }
          if (onVertsLeave) m.on("mouseleave", "cg-boundary-vertices", onVertsLeave as any)
          if (onVertsClick) m.on("click", "cg-boundary-vertices", onVertsClick as any)
          vertexEventsAttached = true
        } catch {}
      }

      const handleDrawChange = () => {
        const data = draw.getAll()
        const lines = (data?.features || []).filter((f: any) => f.geometry?.type === "LineString")
        setHasLine(lines.length > 0)
        // update live coords for vertex overlay (use the last line if multiple)
        const coords = lines.length > 0 ? (lines[lines.length - 1].geometry?.coordinates as number[][]) : null
        setLastDrawnCoords(coords || null)
        try { updateBoundaryVertices(m, coords || null) } catch {}
        // Attach UX handlers once the layer exists
        tryAttachVertexEvents()
      }
      m.on("draw.create", () => {
        handleDrawChange()
      })
      m.on("draw.update", handleDrawChange)
      m.on("draw.delete", handleDrawChange)
      m.on("draw.render", handleDrawChange)
      // Initial attempt (layer appears after first draw)
      tryAttachVertexEvents()
      // Also try re-attaching after any style change (e.g., switching base layers)
      m.on("styledata", tryAttachVertexEvents)
      detachStyleData = () => { try { m.off("styledata", tryAttachVertexEvents) } catch {} }
    }

    function onMapClick(e: any) {
      const { lng, lat } = e.lngLat
      // set marker
      if (markerRef.current) {
        markerRef.current.setLngLat([lng, lat])
      } else {
        markerRef.current = new mapboxgl.Marker({ color: "#3b82f6" }).setLngLat([lng, lat]).addTo(m)
      }
      // reverse geocode for address
      reverseGeocode(lng, lat).then((address) => {
        setSelectedPoint({ lng, lat, address })
        alertsRef.current?.showPinAlert(`${address}\n${lat.toFixed(6)}, ${lng.toFixed(6)}`)
      }).catch(() => {
        const fallback = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
        setSelectedPoint({ lng, lat, address: fallback })
        alertsRef.current?.showPinAlert(fallback)
      })
    }

    return () => {
      try { m.off("click", onMapClick as any) } catch {}
      // Cleanup cursor override when leaving this phase/effect
      try { m.getCanvas().style.cursor = "" } catch {}
      if (phase === "boundary") {
        try { (drawRef.current as any) && m.removeControl(drawRef.current) } catch {}
        drawRef.current = null
        try {
          if (detachStyleData) detachStyleData()
          if (onVertsEnterOrMove) {
            m.off("mousemove", "cg-boundary-vertices", onVertsEnterOrMove as any)
            m.off("mouseenter", "cg-boundary-vertices", onVertsEnterOrMove as any)
          }
          if (onVertsLeave) m.off("mouseleave", "cg-boundary-vertices", onVertsLeave as any)
          if (onVertsClick) m.off("click", "cg-boundary-vertices", onVertsClick as any)
        } catch {}
      }
    }
  }, [phase])

  // When entering boundary phase (and until saved), show the persistent boundary hint
  useEffect(() => {
    if (phase === "boundary" && !boundarySaved) {
      alertsRef.current?.showBoundaryHint()
    }
  }, [phase, boundarySaved])

  // lightweight inline toasts removed in favor of alerts

  const handleExit = () => navigate(-1)

  const handleProceed = () => {
    if (!selectedPoint) return
    // Hide the persistent pin alert only when proceeding to boundary phase
    alertsRef.current?.hidePinAlert?.()
    setPhase("boundary")
    setBoundarySaved(false)
  }

  const handleSaveBoundary = () => {
    const draw = drawRef.current
    if (!draw || !selectedPoint) return
    const data = draw.getAll()
    const lines = (data?.features || []).filter((f: any) => f.geometry?.type === "LineString")
    if (lines.length === 0) return
    const coords = (lines[0].geometry?.coordinates || []) as number[][]
      setSavedBoundaryCoords(coords)
      // Ensure vertices overlay reflects saved shape; also add fill on Save
      if (mapRef.current) {
        updateBoundaryVertices(mapRef.current, coords)
        try { updateBoundaryFill(mapRef.current, coords) } catch {}
        try { setShowFill(true) } catch {}
      }
    setBoundarySaved(true)
    alertsRef.current?.showBoundaryValid("Boundaries set are valid!")
  }

  // note: boundary exit handled by Exit button resetting phase when needed

  // search removed per request

  // Controls helpers
  const makeTooltip = (text: string) => <span>{text}</span>
  const addCustomLayers = (_m: mapboxgl.Map) => {
    // Re-add boundary translucent fill after base style changes
    if (mapRef.current) {
      try { ensureSquareBlueImage(mapRef.current) } catch {}
      if (savedBoundaryCoords && showFill) {
        try { updateBoundaryFill(mapRef.current, savedBoundaryCoords) } catch {}
      }
      const verts = boundarySaved ? savedBoundaryCoords : lastDrawnCoords
      try { updateBoundaryVertices(mapRef.current, verts || null) } catch {}
    }
  }
  // boundary delete-all is no longer used; granular undo implemented via onUndo

  return (
    <div className="fixed inset-0 z-50 bg-[#171717] text-white">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center gap-2 px-4 py-3 border-b border-[#2a2a2a] bg-[#171717] backdrop-blur-sm">
        <div className="font-semibold text-base">{title}</div>
        
        <div className="ml-auto flex gap-2">
          {phase === "terminal" && !terminalSaved && (
        <>
      <Button onClick={() => { if (selectedPoint) { setTerminalSaved(true); alertsRef.current?.showLocationSaved(); if (markerRef.current) { animatePinSaved(markerRef.current) } } }} disabled={!selectedPoint} className="bg-[#4285f4] hover:bg-[#3367d6] text-white disabled:opacity-60"><CircleCheck className="w-4 h-4 mr-2" />Save</Button>
        <Button variant="outline" onClick={handleExit} className="bg-transparent border-[#2a2a2a] text-white hover:bg-[#262626]"><CircleX className="w-4 h-4" />Exit</Button>
            </>
          )}
          {phase === "terminal" && terminalSaved && (
            <>
              <Button onClick={handleProceed} className="bg-[#4285f4] hover:bg-[#3367d6] text-white"><CircleCheck className="w-4 h-4" />Proceed</Button>
              <Button variant="outline" onClick={handleExit} className="bg-transparent border-[#2a2a2a] text-white hover:bg-[#262626]"><CircleX className="w-4 h-4" />Exit</Button>
            </>
          )}
          {phase === "boundary" && !boundarySaved && (
            <>
              <Button onClick={handleSaveBoundary} disabled={!hasLine} className="bg-[#4285f4] hover:bg-[#3367d6] text-white disabled:opacity-60"><CircleCheck className="w-4 h-4" />Save</Button>
              <Button variant="outline" onClick={handleExit} className="bg-transparent border-[#2a2a2a] text-white hover:bg-[#262626] hover:text-white"><CircleX className="w-4 h-4" />Exit</Button>
            </>
          )}
          {phase === "boundary" && boundarySaved && (
            <>
              <Button onClick={() => {
                const draw = drawRef.current
                if (!draw || !selectedPoint) return
                const data = draw.getAll()
                const lines = (data?.features || []).filter((f: any) => f.geometry?.type === "LineString")
                if (lines.length === 0) return
                const feature = lines[0]
                const geojson = { type: "Feature", properties: {}, geometry: feature.geometry }
                // Fill already applied on Save
                sessionStorage.setItem("cg_pick_result", JSON.stringify({
                  type: "both",
                  data: {
                    point: selectedPoint,
                    line: { geojson: JSON.stringify(geojson) },
                  }
                }))
                try { sessionStorage.setItem("cg_reopen_sheet", "1") } catch {}
                // Small delay so the user can see the fill before leaving
                setTimeout(() => navigate(-1), 200)
              }} className="bg-[#4285f4] hover:bg-[#3367d6] text-white"><CircleCheck className="w-4 h-4 mr-2" />Confirm</Button>
              <Button variant="outline" onClick={() => { setBoundarySaved(false); setSavedBoundaryCoords(null); setLastDrawnCoords(null); setShowFill(false); if (mapRef.current) { updateBoundaryFill(mapRef.current, null); updateBoundaryVertices(mapRef.current, null) } }} className="bg-transparent border-[#2a2a2a] text-white hover:text-white hover:bg-[#262626]"><CircleX className="w-4 h-4 mr-2" />Discard</Button>
            </>
          )}
        </div>
      </div>

      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

      {/* Floating map controls bottom-right */}
      <SettingLocationControls
        mapRef={mapRef}
        makeTooltip={makeTooltip}
        addCustomLayers={addCustomLayers}
        onUndo={() => {
          if (phase === "boundary") {
            const draw = drawRef.current
            if (!draw) return
            try {
              draw.deleteAll()
              setHasLine(false)
              setBoundarySaved(false)
              setSavedBoundaryCoords(null)
              setLastDrawnCoords(null)
              setShowFill(false)
              if (mapRef.current) { updateBoundaryFill(mapRef.current, null); updateBoundaryVertices(mapRef.current, null) }
              try { (draw as any).changeMode("draw_line_string") } catch { void 0 }
            } catch { void 0 }
          } else {
            // terminal phase undo: remove pin and selection
            try { markerRef.current?.remove() } catch {}
            markerRef.current = null
            setSelectedPoint(null)
            setTerminalSaved(false)
            alertsRef.current?.hideAll()
          }
        }}
      />

      <SettingLocationAlerts ref={alertsRef} />
    </div>
  )
}
