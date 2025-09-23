import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import Header from "./components/Header";
import Tooltip from "@/components/ui/tooltip";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Layers, Locate, Minus, Plus } from "lucide-react";

mapboxgl.accessToken = "pk.eyJ1Ijoicm9kZWxsbCIsImEiOiJjbWU0OXNvb2gwYnM0MnpvbXNueXo2dzhxIn0.Ep43_IxVhaPhEqWBaAuuyA";

export default function Dashboard() {
    const mapContainer = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const [mapLoaded, setMapLoaded] = useState(false);

    // animation frame refs so we can cancel/restart when switching styles
    const rafRef = useRef<number | null>(null);
    const rafOfflineRef = useRef<number | null>(null);

    // info bubble screen position (we render a React overlay like in the Landing hero)
    const [infoBubble, setInfoBubble] = useState<{ x: number; y: number } | null>(null);

    // static data for the signals so we can re-add them after style changes
    const offlineCoords: [number, number][] = [
        [121.03197820799186, 14.772888009898285],
        [121.04440528679821, 14.776897515717772],
        [121.039008311252, 14.768014818600191]
    ];
    const distressCoord: [number, number] = [121.04040046802031, 14.7721611560019];

    // helper to (re)create sources and layers after a style load
    const addCustomLayers = (map: mapboxgl.Map) => {
        // offline signals source
        if (!map.getSource("offline-signals")) {
            map.addSource("offline-signals", {
                type: "geojson",
                data: {
                    type: "FeatureCollection",
                    features: offlineCoords.map((coord) => ({
                        type: "Feature",
                        properties: { status: "offline" },
                        geometry: { type: "Point", coordinates: coord }
                    }))
                }
            });
        } else {
            // update data if source exists
            const s = map.getSource("offline-signals") as mapboxgl.GeoJSONSource;
            s.setData({ type: "FeatureCollection", features: offlineCoords.map((coord) => ({ type: "Feature", properties: { status: "offline" }, geometry: { type: "Point", coordinates: coord } })) });
        }

        const offlineRingPaint = (opacity: number) => ({
            "circle-color": "#6b7280",
            "circle-opacity": opacity,
        });

        if (!map.getLayer("offline-ring-3")) {
            map.addLayer({ id: "offline-ring-3", type: "circle", source: "offline-signals", paint: { ...offlineRingPaint(0.12), "circle-radius": 34 } });
            map.addLayer({ id: "offline-ring-2", type: "circle", source: "offline-signals", paint: { ...offlineRingPaint(0.18), "circle-radius": 24 } });
            map.addLayer({ id: "offline-ring-1", type: "circle", source: "offline-signals", paint: { ...offlineRingPaint(0.26), "circle-radius": 16 } });
            map.addLayer({ id: "offline-core-stroke", type: "circle", source: "offline-signals", paint: { "circle-color": "#ffffff", "circle-radius": 12, "circle-opacity": 1 } });
            map.addLayer({ id: "offline-core", type: "circle", source: "offline-signals", paint: { "circle-color": "#6b7280", "circle-radius": 10, "circle-opacity": 1, "circle-blur": 0 } });
        }

        // distress signal source
        if (!map.getSource("distress-signal")) {
            map.addSource("distress-signal", {
                type: "geojson",
                data: {
                    type: "FeatureCollection",
                    features: [{ type: "Feature", properties: { status: "online" }, geometry: { type: "Point", coordinates: distressCoord } }]
                }
            });
        } else {
            const s = map.getSource("distress-signal") as mapboxgl.GeoJSONSource;
            s.setData({ type: "FeatureCollection", features: [{ type: "Feature", properties: { status: "online" }, geometry: { type: "Point", coordinates: distressCoord } }] });
        }

        const ringPaint = (opacity: number) => ({
            "circle-color": "#22c55e",
            "circle-opacity": opacity,
        });

        if (!map.getLayer("distress-ring-3")) {
            map.addLayer({ id: "distress-ring-3", type: "circle", source: "distress-signal", paint: { ...ringPaint(0.12), "circle-radius": 34 } });
            map.addLayer({ id: "distress-ring-2", type: "circle", source: "distress-signal", paint: { ...ringPaint(0.18), "circle-radius": 24 } });
            map.addLayer({ id: "distress-ring-1", type: "circle", source: "distress-signal", paint: { ...ringPaint(0.26), "circle-radius": 16 } });
            map.addLayer({ id: "distress-core-stroke", type: "circle", source: "distress-signal", paint: { "circle-color": "#ffffff", "circle-radius": 12, "circle-opacity": 1 } });
            map.addLayer({ id: "distress-core", type: "circle", source: "distress-signal", paint: { "circle-color": "#22c55e", "circle-radius": 10, "circle-opacity": 1, "circle-blur": 0 } });
        }
    };

    // We render the info bubble as a React overlay anchored with map.project (like Landing/Hero)

    // start/restart the pulsing animations
    const startAnimations = (map: mapboxgl.Map) => {
        // cancel any running animations first
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        if (rafOfflineRef.current) cancelAnimationFrame(rafOfflineRef.current);

        // online pulsers
        const cycleMsOnline = 2200;
        const start = performance.now();
        const tick = () => {
            const t = ((performance.now() - start) % cycleMsOnline) / cycleMsOnline;
            const twoPi = Math.PI * 2;
            const r1 = 16 + 2 * Math.sin(twoPi * t);
            const r2 = 24 + 3.5 * Math.sin(twoPi * (t - 0.15));
            const r3 = 34 + 5 * Math.sin(twoPi * (t - 0.3));
            const o1 = 0.26 + 0.12 * Math.max(0, Math.sin(twoPi * t));
            const o2 = 0.18 + 0.10 * Math.max(0, Math.sin(twoPi * (t - 0.15)));
            const o3 = 0.12 + 0.08 * Math.max(0, Math.sin(twoPi * (t - 0.3)));
            try {
                map.setPaintProperty("distress-ring-1", "circle-radius", r1);
                map.setPaintProperty("distress-ring-2", "circle-radius", r2);
                map.setPaintProperty("distress-ring-3", "circle-radius", r3);
                map.setPaintProperty("distress-ring-1", "circle-opacity", o1);
                map.setPaintProperty("distress-ring-2", "circle-opacity", o2);
                map.setPaintProperty("distress-ring-3", "circle-opacity", o3);
            } catch (e) {
                // layer might not exist yet
            }
            rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);

        // offline pulsers
        const cycleMsOffline = 2200;
        const startOffline = performance.now();
        const tickOffline = () => {
            const t = ((performance.now() - startOffline) % cycleMsOffline) / cycleMsOffline;
            const twoPi = Math.PI * 2;
            const r1 = 16 + 2 * Math.sin(twoPi * t);
            const r2 = 24 + 3.5 * Math.sin(twoPi * (t - 0.15));
            const r3 = 34 + 5 * Math.sin(twoPi * (t - 0.3));
            const o1 = 0.26 + 0.12 * Math.max(0, Math.sin(twoPi * t));
            const o2 = 0.18 + 0.10 * Math.max(0, Math.sin(twoPi * (t - 0.15)));
            const o3 = 0.12 + 0.08 * Math.max(0, Math.sin(twoPi * (t - 0.3)));
            try {
                map.setPaintProperty("offline-ring-1", "circle-radius", r1);
                map.setPaintProperty("offline-ring-2", "circle-radius", r2);
                map.setPaintProperty("offline-ring-3", "circle-radius", r3);
                map.setPaintProperty("offline-ring-1", "circle-opacity", o1);
                map.setPaintProperty("offline-ring-2", "circle-opacity", o2);
                map.setPaintProperty("offline-ring-3", "circle-opacity", o3);
            } catch (e) {
                // layer might not exist yet
            }
            rafOfflineRef.current = requestAnimationFrame(tickOffline);
        };
        rafOfflineRef.current = requestAnimationFrame(tickOffline);
    };

    useEffect(() => {
        if (!mapContainer.current) return;
        const map = new mapboxgl.Map({
            container: mapContainer.current as HTMLElement,
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [121.04040046802031, 14.7721611560019],
            zoom: 12,
            pitch: 75,
            bearing: 0,
            antialias: true,
        });
        mapRef.current = map;

        map.on("load", () => {
            addCustomLayers(map);
            startAnimations(map);
            // compute overlay position for the info bubble and keep it updated during moves
            try {
                const pt = map.project(distressCoord);
                setInfoBubble({ x: pt.x, y: pt.y });
            } catch (e) { }
            map.on('move', () => {
                try {
                    const pt = map.project(distressCoord);
                    setInfoBubble({ x: pt.x, y: pt.y });
                } catch (e) { }
            });
            // fly into the area
            setTimeout(() => {
                map.flyTo({
                    center: distressCoord,
                    zoom: 16,
                    pitch: 35,
                    bearing: -17.6,
                    duration: 4000,
                    curve: 1.8,
                    speed: 0.8,
                    essential: true,
                });
            }, 600);

            // Map loaded state
            setMapLoaded(true);
        });

        return () => {
            mapRef.current = null;
            map.remove();
        };
    }, []);

    // small helper to render the tooltip visual (keeps visuals local to this page)
    const makeTooltip = (text: string) => (
        <div style={{ position: 'relative', left: '-7px' }}>
            <div style={{ background: 'rgba(0,0,0,0.60)', color: '#fff', padding: '8px 10px', borderRadius: 6, fontSize: 13, boxShadow: '0 8px 20px rgba(2,6,23,0.18)' }}>{text}</div>
            {/* subtle shadow triangle behind the arrow */}
            <div style={{ position: 'absolute', right: -9, top: '50%', transform: 'translateY(-50%)', width: 0, height: 0, borderTop: '7px solid transparent', borderBottom: '7px solid transparent', borderLeft: '7px solid rgba(75,85,99,0.18)', filter: 'blur(0.2px)' }} />
            {/* main arrow pointing to the control */}
            <div style={{ position: 'absolute', right: -6, top: '50%', transform: 'translateY(-50%)', width: 0, height: 0, borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderLeft: '6px solid rgba(75,85,99,0.72)' }} />
        </div>
    );

    // Layers open state (controls whether the popover is visible)
    const [layersOpen, setLayersOpen] = useState(false);

    // Layers selection state (controls which pill is active in the popover)
    // default: 'terrain' so the Terrain pill starts selected
    const [selectedLayer, setSelectedLayer] = useState<'terrain' | 'satellite'>('terrain');

    return (
        <div style={{ minHeight: "100vh", width: "100%", position: "relative", background: "#222", overflow: "hidden" }}>
            <Header />
            <div ref={mapContainer} style={{ position: "absolute", top: 85, left: 0, right: 0, bottom: 0, zIndex: 1 }} />

            {/* Info bubble overlay anchored to the online distress signal (rendered like Landing/Hero) */}
            {infoBubble && (
                <div style={{ position: 'absolute', left: infoBubble.x, top: 100 + infoBubble.y, transform: 'translate(-50%, 12px)', zIndex: 35, pointerEvents: 'none' }}>
                        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ background: '#ffffff', color: '#000', padding: '8px 12px', borderRadius: 999, boxShadow: '0 8px 20px rgba(2,6,23,0.18)', fontSize: 10.3, fontWeight: 500, textTransform: 'uppercase', whiteSpace: 'nowrap', border: '2px solid #22c55e' }}>YOUR COMMUNITY</div>
                            {/* outer green triangle (border) positioned above the bubble */}
                            <div style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%) rotate(180deg)', width: 0, height: 0, borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderTop: '8px solid #22c55e', marginBottom: -1 }} />
                        </div>
                </div>
            )}

            {/* Map controls (bottom-right) */}
            <div style={{ position: "absolute", right: 21, bottom: 21, zIndex: 40, display: "flex", flexDirection: "column", gap: 11 }}>
                {/* Location button */}
                <Tooltip content={makeTooltip('Your Location')} side="left">
                    <div
                        style={{
                            width: 50,
                            height: 50,
                            borderRadius: 7,
                            background: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: mapLoaded ? "pointer" : "not-allowed",
                            boxShadow: "0 4px 12px rgba(2,6,23,0.21)",
                            transition: "background 0.18s"
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = "#EEEEEE")}
                        onMouseLeave={e => (e.currentTarget.style.background = "#fff")}
                    >
                        <button
                            aria-label="Locate"
                            disabled={!mapLoaded}
                            onClick={() => {
                                const map = mapRef.current;
                                if (!map) return;
                                map.flyTo({ center: [121.04040046802031, 14.7721611560019], zoom: 17, speed: 1.2, curve: 1.4, essential: true });
                            }}
                            style={{
                                background: "transparent",
                                border: "none",
                                color: "#000",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                            }}
                        >
                            <Locate size={21} />
                        </button>
                    </div>
                </Tooltip>

                {/* Layers popover */}
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <Tooltip content={makeTooltip('Layers')} side="left">
                        <Popover onOpenChange={(open) => setLayersOpen(open)}>
                            <PopoverTrigger asChild>
                                <div
                                    style={{
                                        width: 50,
                                        height: 50,
                                        borderRadius: 7,
                                        background: layersOpen ? "#111827" : "#fff",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        cursor: "pointer",
                                        boxShadow: layersOpen ? "0 6px 16px rgba(0,0,0,0.35)" : "0 4px 12px rgba(2,6,23,0.21)",
                                        transition: "background 0.18s, box-shadow 0.18s"
                                    }}
                                    onMouseEnter={e => { if (!layersOpen) e.currentTarget.style.background = "#EEEEEE" }}
                                    onMouseLeave={e => { if (!layersOpen) e.currentTarget.style.background = "#fff" }}
                                >
                                    <button aria-label="Layers" style={{ background: "transparent", border: "none", color: layersOpen ? "#fff" : "#000", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <Layers size={21} />
                                    </button>
                                </div>
                            </PopoverTrigger>
                            <PopoverContent side="left" align="center" style={{ minWidth: 220, padding: 10, background: 'transparent', boxShadow: 'none', border: 'none', transform: 'translateX(8px)' }}>
                                {/* Segmented control */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', padding: 6, borderRadius: 12, boxShadow: '0 8px 20px rgba(2,6,23,0.12)' }}>
                                    <button
                                        onClick={() => {
                                            setSelectedLayer('terrain');
                                            const m = mapRef.current;
                                            if (m) {
                                                m.setStyle('mapbox://styles/mapbox/outdoors-v12');
                                                // re-add our custom layers when the new style is ready
                                                m.once('styledata', () => {
                                                    addCustomLayers(m);
                                                    startAnimations(m);
                                                });
                                            }
                                        }}
                                        style={{
                                            padding: '8px 16px',
                                            borderRadius: 8,
                                            background: selectedLayer === 'terrain' ? '#111827' : 'transparent',
                                            color: selectedLayer === 'terrain' ? '#fff' : '#9ca3af',
                                            border: 'none',
                                            fontWeight: 500,
                                            cursor: 'pointer',
                                            boxShadow: selectedLayer === 'terrain' ? '0 6px 12px rgba(0,0,0,0.25)' : 'none'
                                        }}
                                    >
                                        Terrain
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSelectedLayer('satellite');
                                            const m = mapRef.current;
                                            if (m) {
                                                m.setStyle('mapbox://styles/mapbox/satellite-streets-v12');
                                                m.once('styledata', () => {
                                                    addCustomLayers(m);
                                                    startAnimations(m);
                                                });
                                            }
                                        }}
                                        style={{
                                            padding: '8px 16px',
                                            borderRadius: 8,
                                            background: selectedLayer === 'satellite' ? '#111827' : 'transparent',
                                            color: selectedLayer === 'satellite' ? '#fff' : '#9ca3af',
                                            border: 'none',
                                            fontWeight: 500,
                                            cursor: 'pointer',
                                            boxShadow: selectedLayer === 'satellite' ? '0 6px 12px rgba(0,0,0,0.25)' : 'none'
                                        }}
                                    >
                                        Satellite
                                    </button>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </Tooltip>
                </div>

                {/* Zoom in/out */}
                {/* Zoom in/out - joined control */}
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <Tooltip content={makeTooltip('Zoom in')} side="left">
                        <div style={{ width: 50, borderTopLeftRadius: 7, borderTopRightRadius: 7, borderBottomLeftRadius: 0, borderBottomRightRadius: 0, overflow: "hidden", background: "#fff", boxShadow: "0 6px 16px rgba(2,6,23,0.21)", display: "flex", flexDirection: "column" }}>
                            <button
                                aria-label="Zoom in"
                                onClick={() => { const m = mapRef.current; if (m) m.zoomIn(); }}
                                style={{
                                    width: "100%",
                                    height: 50,
                                    border: "none",
                                    background: "transparent",
                                    color: "#000",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    borderBottom: "1px solid rgba(0,0,0,0.12)",
                                    transition: "background 0.18s",
                                    cursor: "pointer"
                                }}
                                onMouseEnter={e => (e.currentTarget.style.background = "#EEEEEE")}
                                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                            >
                                <Minus size={21} />
                            </button>
                        </div>
                    </Tooltip>
                    <Tooltip content={makeTooltip('Zoom out')} side="left">
                        <div style={{ width: 50, borderTopLeftRadius: 0, borderTopRightRadius: 0, borderBottomLeftRadius: 7, borderBottomRightRadius: 7, overflow: "hidden", background: "#fff", boxShadow: "0 6px 16px rgba(2,6,23,0.21)", display: "flex", flexDirection: "column" }}>
                            <button
                                aria-label="Zoom out"
                                onClick={() => { const m = mapRef.current; if (m) m.zoomOut(); }}
                                style={{
                                    width: "100%",
                                    height: 50,
                                    border: "none",
                                    background: "transparent",
                                    color: "#000",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    transition: "background 0.18s",
                                    cursor: "pointer"
                                }}
                                onMouseEnter={e => (e.currentTarget.style.background = "#EEEEEE")}
                                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                            >
                                <Plus size={21} />
                            </button>
                        </div>
                    </Tooltip>
                </div>
            </div>
        </div>
    );
}
