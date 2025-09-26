import { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import { flyToSignal, cinematicMapEntrance } from './utils/flyingEffects';
import Header from "./components/Header";
import Tooltip from "@/components/ui/tooltip";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Layers, Locate, Minus, Plus, X, Trash2 } from "lucide-react";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";


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
    const [infoBubbleVisible, setInfoBubbleVisible] = useState(true);

    // popover state for clicked signals (anchored overlay like LandingHero)
    const [popover, setPopover] = useState<{
        lng: number;
        lat: number;
        screen: { x: number; y: number };
        status?: string;
        title?: string;
        address?: string;
        date?: string;
        deviceId?: string;
        focalPerson?: string;
        altFocalPerson?: string;
    } | null>(null);

    // show/hide community boundary editor modal
    const [editBoundaryOpen, setEditBoundaryOpen] = useState(false);

    // static data for the signals so we can re-add them after style changes
    // each signal now has its own dummy properties so the popover shows distinct data per feature
    const otherSignals = [
        {
            coordinates: [121.03197820799186, 14.772888009898285] as [number, number],
            properties: {
                status: 'offline',
                deviceId: 'RSQW-101',
                focalPerson: 'Marites Dela Cruz',
                altFocalPerson: 'Rodel Sustiguer',
                address: 'Block 2, Lot 5, Rizal St.',
                date: 'September 3, 2025',
                name: 'PAMAKAI'
            },
            boundary: [
                [121.0315, 14.7732],
                [121.0325, 14.7732],
                [121.0325, 14.7725],
                [121.0315, 14.7725],
                [121.0315, 14.7732]
            ]
        },
        {
            coordinates: [121.04440528679821, 14.776897515717772] as [number, number],
            properties: {
                status: 'offline',
                deviceId: 'RSQW-102',
                focalPerson: 'Gwen Uy',
                altFocalPerson: 'Jose Ramos',
                address: 'Lot 11, Paraiso Rd.',
                date: 'September 7, 2025',
                name: 'PENTUNAI HOA'
            },
            boundary: [
                [121.0440, 14.7772],
                [121.0450, 14.7772],
                [121.0450, 14.7765],
                [121.0440, 14.7765],
                [121.0440, 14.7772]
            ]
        },
        {
            coordinates: [121.039008311252, 14.768014818600191] as [number, number],
            properties: {
                status: 'offline',
                deviceId: 'RSQW-103',
                focalPerson: 'Ana Santos',
                altFocalPerson: 'Lito Perez',
                address: 'Corner Gen. Luna & Mabini',
                date: 'August 28, 2025',
                name: 'ANCOP VILLAGE'
            },
            boundary: [
                [121.0385, 14.7684],
                [121.0395, 14.7684],
                [121.0395, 14.7677],
                [121.0385, 14.7677],
                [121.0385, 14.7684]
            ]
        }
    ];

    const OwnCommunitySignal = {
        coordinates: [121.04040046802031, 14.7721611560019] as [number, number],
        properties: {
            status: 'online',
            deviceId: 'RSQW-001',
            focalPerson: 'Gwyneth Uy',
            altFocalPerson: 'Rodel Sustiguer',
            address: 'Block 1, Lot 17, Paraiso Rd, 1400',
            date: 'September 9, 2025',
            name: 'Lerandia Subdivision'
        },
        boundary: [
            [121.0400, 14.7725],
            [121.0410, 14.7725],
            [121.0410, 14.7718],
            [121.0400, 14.7718],
            [121.0400, 14.7725]
        ]
    };
    const distressCoord: [number, number] = OwnCommunitySignal.coordinates;

    // helper to (re)create sources and layers after a style load
    const addCustomLayers = (map: mapboxgl.Map) => {
        // offline signals source
        if (!map.getSource("offline-signals")) {
            map.addSource("offline-signals", {
                type: "geojson",
                data: {
                    type: "FeatureCollection",
                    features: otherSignals.map((s) => ({
                        type: "Feature",
                        properties: s.properties,
                        geometry: { type: "Point", coordinates: s.coordinates }
                    }))
                }
            });
        } else {
            // update data if source exists
            const s = map.getSource("offline-signals") as mapboxgl.GeoJSONSource;
            s.setData({ type: "FeatureCollection", features: otherSignals.map((s2) => ({ type: "Feature", properties: s2.properties, geometry: { type: "Point", coordinates: s2.coordinates } })) });
        }

        // Add a single static gray circle for offline signals
        if (!map.getLayer("offline-core")) {
            map.addLayer({
                id: "offline-core",
                type: "circle",
                source: "offline-signals",
                paint: {
                    "circle-color": "#6b7280",
                    "circle-radius": 12,
                    "circle-opacity": 1,
                    "circle-stroke-color": "#fff",
                    "circle-stroke-width": 2
                }
            });
        }

        // distress signal source
        if (!map.getSource("distress-signal")) {
            map.addSource("distress-signal", {
                type: "geojson",
                data: {
                    type: "FeatureCollection",
                    features: [{ type: "Feature", properties: OwnCommunitySignal.properties, geometry: { type: "Point", coordinates: OwnCommunitySignal.coordinates } }]
                }
            });
        } else {
            const s = map.getSource("distress-signal") as mapboxgl.GeoJSONSource;
            s.setData({ type: "FeatureCollection", features: [{ type: "Feature", properties: OwnCommunitySignal.properties, geometry: { type: "Point", coordinates: OwnCommunitySignal.coordinates } }] });
        }

        // Add a single static green circle for distress signal
        if (!map.getLayer("distress-core")) {
            map.addLayer({
                id: "distress-core",
                type: "circle",
                source: "distress-signal",
                paint: {
                    "circle-color": "#22c55e",
                    "circle-radius": 12,
                    "circle-opacity": 1,
                    "circle-stroke-color": "#fff",
                    "circle-stroke-width": 2
                }
            });
        }
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
            try {
                // make the canvas focusable so draw.changeMode and keyboard interactions can work
                const canvas = map.getCanvas() as HTMLCanvasElement | null;
                if (canvas) {
                    canvas.tabIndex = 0;
                    canvas.style.touchAction = 'auto';
                }
            } catch (e) { }

            addCustomLayers(map);
            // Move signal dot layers above draw layers
            const drawLayerIds = [
                'gl-draw-polygon-fill',
                'gl-draw-polygon-stroke',
                'gl-draw-line',
                'gl-draw-points',
                'gl-draw-polygon-midpoint'
            ];
            const signalLayers = ['distress-core', 'offline-core'];
            signalLayers.forEach(layerId => {
                if (map.getLayer(layerId)) {
                    // Find the top-most draw layer
                    let beforeLayer = null;
                    for (let i = drawLayerIds.length - 1; i >= 0; i--) {
                        if (map.getLayer(drawLayerIds[i])) {
                            beforeLayer = drawLayerIds[i];
                            break;
                        }
                    }
                    if (beforeLayer) {
                        map.moveLayer(layerId);
                    }
                }
            });
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

            // Click interactions: open popover anchored to clicked signal (distress + offline)
            const distressLayers = ["distress-core", "distress-core-stroke", "distress-ring-1", "distress-ring-2", "distress-ring-3"];
            const offlineLayers = ["offline-core", "offline-core-stroke", "offline-ring-1", "offline-ring-2", "offline-ring-3"];

            const bindLayerClicks = (layerIds: string[]) => {
                layerIds.forEach((layerId) => {
                    map.on('click', layerId, (e: any) => {
                        const f = e.features?.[0];
                        const coord = (f?.geometry?.coordinates as [number, number]) || [e.lngLat.lng, e.lngLat.lat];
                        let boundary = null;
                        // Find boundary for clicked signal using deviceId
                        const deviceId = f?.properties?.deviceId;
                        if (deviceId) {
                            if (deviceId === OwnCommunitySignal.properties.deviceId) {
                                boundary = OwnCommunitySignal.boundary;
                            } else {
                                const found = otherSignals.find(s => s.properties.deviceId === deviceId);
                                if (found) boundary = found.boundary;
                            }
                        }

                        // Remove previous boundary layer/source
                        if (map.getLayer('signal-boundary')) map.removeLayer('signal-boundary');
                        if (map.getLayer('signal-boundary-line')) map.removeLayer('signal-boundary-line');
                        if (map.getSource('signal-boundary')) map.removeSource('signal-boundary');

                        if (boundary) {
                            // Determine color by signal status
                            let fillColor = '#2CBE00';
                            let lineColor = '#2CBE00';
                            let opacity = 0.1;
                            let status = f?.properties?.status;
                            if (status === 'offline') {
                                fillColor = '#0A0A0A';
                                lineColor = '#707070';
                                opacity = 0.1;
                            }
                            map.addSource('signal-boundary', {
                                type: 'geojson',
                                data: {
                                    type: 'Feature',
                                    properties: {},
                                    geometry: {
                                        type: 'Polygon',
                                        coordinates: [boundary]
                                    }
                                }
                            });
                            map.addLayer({
                                id: 'signal-boundary',
                                type: 'fill',
                                source: 'signal-boundary',
                                paint: {
                                    'fill-color': fillColor,
                                    'fill-opacity': opacity
                                }
                            });
                            map.addLayer({
                                id: 'signal-boundary-line',
                                type: 'line',
                                source: 'signal-boundary',
                                paint: {
                                    'line-color': lineColor,
                                    'line-width': 3,
                                    'line-dasharray': [2, 4]
                                }
                            });
                        }

                        try {
                            // Center the map on the clicked signal's coordinates using utility
                            flyToSignal(map, coord);
                            // Show popover immediately at current projected position
                            const pt = map.project(coord);
                            const props = f?.properties || {};
                            setPopover({
                                lng: coord[0],
                                lat: coord[1],
                                screen: { x: pt.x, y: pt.y },
                                status: props.status || undefined,
                                title: props.name || (props.status === 'offline' ? 'Offline Signal' : 'Community'),
                                address: props.address || undefined,
                                date: props.date || undefined,
                                deviceId: props.deviceId || undefined,
                                focalPerson: props.focalPerson || undefined,
                                altFocalPerson: props.altFocalPerson || undefined
                            });
                        } catch (err) {
                            // fallback: if anything goes wrong, keep previous behavior
                            flyToSignal(map, coord);
                            const pt = map.project(coord);
                            const props = f?.properties || {};
                            setPopover({
                                lng: coord[0],
                                lat: coord[1],
                                screen: { x: pt.x, y: pt.y },
                                status: props.status || undefined,
                                title: props.name || (props.status === 'offline' ? 'Offline Signal' : 'Community'),
                                address: props.address || undefined,
                                date: props.date || undefined,
                            });
                        }
                    });
                    map.on('mouseenter', layerId, () => (map.getCanvas().style.cursor = 'pointer'));
                    map.on('mouseleave', layerId, () => (map.getCanvas().style.cursor = ''));
                });
            };

            // When any signal is clicked, hide the info bubble forever
            const hideInfoBubbleOnClick = () => setInfoBubbleVisible(false);
            distressLayers.concat(offlineLayers).forEach(layerId => {
                map.on('click', layerId, hideInfoBubbleOnClick);
            });
            bindLayerClicks(distressLayers);
            bindLayerClicks(offlineLayers);

            // Keep popover anchored while moving
            map.on('move', () => {
                setPopover((curr) => {
                    if (!curr) return curr;
                    try {
                        const pt = map.project([curr.lng, curr.lat]);
                        return { ...curr, screen: { x: pt.x, y: pt.y } };
                    } catch (e) {
                        return curr;
                    }
                });
            });
            // fly into the area
            setTimeout(() => {
                cinematicMapEntrance(map, distressCoord);
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

    const [canSave, setCanSave] = useState(false);
    const [savedGeoJson, setSavedGeoJson] = useState<GeoJSON.FeatureCollection | null>(null);
    const drawRef = useRef<MapboxDraw | null>(null);
    const [isEditingBoundary, setIsEditingBoundary] = useState(true); // Set true if editing, false otherwise

    useEffect(() => {
        if (!mapRef.current) return;
        const map = mapRef.current;

        // Always remove signal boundary layers/source when entering edit mode
        if (editBoundaryOpen) {
            if (map.getLayer('signal-boundary')) map.removeLayer('signal-boundary');
            if (map.getLayer('signal-boundary-line')) map.removeLayer('signal-boundary-line');
            if (map.getSource('signal-boundary')) map.removeSource('signal-boundary');
        }

        if (!editBoundaryOpen) {
            if (drawRef.current) {
                try {
                    map.removeControl(drawRef.current as any);
                } catch (e) {
                    console.error("Error removing MapboxDraw control:", e);
                }
                drawRef.current = null;
            }
            return;
        }

        drawRef.current = new MapboxDraw({
            displayControlsDefault: false,
            controls: {},
            styles: [
                // Polygon fill
                {
                    id: 'gl-draw-polygon-fill',
                    type: 'fill',
                    filter: ['all', ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
                    paint: {
                        'fill-color': '#2CBE00',
                        'fill-opacity': 0.1,
                    },
                },
                // Polygon outline as dotted line
                {
                    id: 'gl-draw-polygon-stroke',
                    type: 'line',
                    filter: ['all', ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
                    layout: { 'line-cap': 'round', 'line-join': 'round' },
                    paint: {
                        'line-color': '#2CBE00',
                        'line-width': 3,
                        'line-dasharray': [2, 4], // larger dots, more visible
                    },
                },
                // LineString (if drawing lines)
                {
                    id: 'gl-draw-line',
                    type: 'line',
                    filter: ['all', ['==', '$type', 'LineString'], ['!=', 'mode', 'static']],
                    layout: { 'line-cap': 'round', 'line-join': 'round' },
                    paint: {
                        'line-color': '#2CBE00',
                        'line-width': 3,
                        'line-dasharray': [2, 4], // larger dots, more visible
                    },
                },
                // Vertices (main dots)
                {
                    id: 'gl-draw-points',
                    type: 'symbol',
                    filter: ['all', ['==', '$type', 'Point'], ['!=', 'meta', 'midpoint']],
                    layout: {
                        'icon-image': 'square-green',
                        'icon-size': 1.2,
                    },
                },
                // Midpoints (editing points)
                {
                    id: 'gl-draw-polygon-midpoint',
                    type: 'circle',
                    filter: ['all', ['==', '$type', 'Point'], ['==', 'meta', 'midpoint']],
                    paint: { 'circle-radius': 4, 'circle-color': 'green' },
                },
            ],
        });

        // Add a custom square icon for vertices
        if (!map.hasImage('square-green')) {
            const size = 20;
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.fillStyle = '#2CBE00';
                ctx.fillRect(0, 0, size, size);
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.strokeRect(0, 0, size, size);
                const imageData = ctx.getImageData(0, 0, size, size);
                map.addImage('square-green', imageData, { pixelRatio: 2 });
            }
        }

        map.addControl(drawRef.current as any);

        setTimeout(() => {
            try {
                drawRef.current?.changeMode('draw_polygon');
                const canvas = map.getCanvas();
                if (canvas) canvas.focus();
            } catch (e) { }
        }, 0);

        const updateCanSave = () => {
            const draw = drawRef.current;
            if (!draw) return setCanSave(false);
            const data = draw.getAll();
            if (!data || !data.features) return setCanSave(false);
            const hasClosedPolygon = data.features.some(
                (f: any) => f.geometry && f.geometry.type === "Polygon"
            );
            setCanSave(Boolean(hasClosedPolygon));
        };

        map.on("draw.create", updateCanSave);
        map.on("draw.update", updateCanSave);
        map.on("draw.delete", updateCanSave);

        return () => {
            map.off("draw.create", updateCanSave);
            map.off("draw.update", updateCanSave);
            map.off("draw.delete", updateCanSave);
            if (drawRef.current) {
                try {
                    map.removeControl(drawRef.current as any);
                } catch (e) {
                    console.error("Error removing MapboxDraw control:", e);
                }
                drawRef.current = null;
            }
        };
    }, [editBoundaryOpen]);


    const handleSave = () => {
        const draw = drawRef.current as MapboxDraw;
        if (!draw) return;
        const data = draw.getAll();
        if (!data || data.features.length === 0) {
            alert("Please draw a closed boundary (polygon) before saving.");
            return;
        }

        const polygons = data.features.filter(
            (f: any) => f.geometry && f.geometry.type === "Polygon"
        );
        if (polygons.length === 0) {
            alert("Please draw a closed polygon as your boundary.");
            return;
        }

        // Get the coordinates of the first polygon
        const newBoundary = polygons[0]?.geometry?.coordinates?.[0];
        // Update the boundary for the currently edited signal
        // We'll assume the last clicked signal is stored in popover
        if (popover && newBoundary) {
            const deviceId = popover.deviceId;
            if (deviceId === OwnCommunitySignal.properties.deviceId) {
                OwnCommunitySignal.boundary = newBoundary;
            } else {
                const found = otherSignals.find(s => s.properties.deviceId === deviceId);
                if (found) found.boundary = newBoundary;
            }
        }

        const featureCollection: GeoJSON.FeatureCollection = {
            type: "FeatureCollection",
            features: polygons as GeoJSON.Feature[],
        };

        setSavedGeoJson(featureCollection);
        console.log("Saved GeoJSON:", featureCollection);
        alert("Boundary saved! Check console for GeoJSON.");
        setEditBoundaryOpen(false);
    };

    const handleDeleteBoundary = () => {
        const draw = drawRef.current;
        if (!draw) return;
        draw.deleteAll();
        setSavedGeoJson(null);
        setCanSave(false);
        // Reset draw mode so user can draw again
        try {
            draw.changeMode('draw_polygon');
            const map = mapRef.current;
            if (map) {
                const canvas = map.getCanvas();
                if (canvas) canvas.focus();
            }
        } catch (e) { }
    };

    const handleEditCommunityMarkers = () => {
        setEditBoundaryOpen(true);
        // Remove signal boundary layers/source when entering edit mode
        const map = mapRef.current;
        if (map) {
            if (map.getLayer('signal-boundary')) map.removeLayer('signal-boundary');
            if (map.getLayer('signal-boundary-line')) map.removeLayer('signal-boundary-line');
            if (map.getSource('signal-boundary')) map.removeSource('signal-boundary');
        }
    };

    const handleExitEdit = () => {
        setEditBoundaryOpen(false);
        // Optionally, clear boundary or keep as is
    };

    return (
        <div style={{ minHeight: "100vh", width: "100%", position: "relative", background: "#222", overflow: "hidden" }}>
            {/* Header: show editing UI only when editing is active */}
            {editBoundaryOpen ? (
                <header
                    style={{
                        width: "100%",
                        background: "#171717",
                        color: "#fff",
                        display: "grid",
                        gridTemplateColumns: "1fr auto",
                        alignItems: "center",
                        padding: "0 3rem",
                        height: "85px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                        position: "relative",
                        zIndex: 100,
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "1.2rem" }}>
                        <img src={"/Landing/resqwave_logo.png"} alt="ResQWave Logo" style={{ height: 32 }} />
                        <span style={{ fontWeight: 700, fontSize: "1.25rem", letterSpacing: 1 }}>ResQWave</span>
                        <span style={{ fontWeight: 300, fontSize: "1.13rem", color: "#BABABA", marginLeft: 12, letterSpacing: 0.5 }}>
                            Editing Community Boundary ...
                        </span>
                        {/* ...Tabs as before... */}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                        <button
                            disabled={!canSave}
                            onClick={handleSave}
                            style={{
                                padding: "8px 18px",
                                borderRadius: 3,
                                background: canSave ? "#fff" : "#222",
                                color: canSave ? "#222" : "#aaa",
                                border: "none",
                                fontWeight: 600,
                                fontSize: "1rem",
                                marginRight: 8,
                                cursor: canSave ? "pointer" : "not-allowed",
                                boxShadow: canSave ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
                            }}
                        >
                            <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="9 12 12 15 16 10" />
                                </svg>
                                SAVE
                            </span>
                        </button>
                        <button
                            onClick={handleExitEdit}
                            style={{
                                padding: "8px 18px",
                                borderRadius: 3,
                                background: "transparent",
                                color: "#fff",
                                border: "1px solid #fff",
                                fontWeight: 600,
                                fontSize: "1rem",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: 7,
                            }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                            EXIT
                        </button>
                        {/* ...profile popover as before... */}
                    </div>
                </header>
            ) : (
                <Header />
            )}

            <div ref={mapContainer} style={{ position: "absolute", top: 85, left: 0, right: 0, bottom: 0, zIndex: 1 }} />

            {/* Info bubble overlay anchored to the online distress signal (rendered like Landing/Hero) */}
            {infoBubble && !popover && infoBubbleVisible && (
                <div style={{ position: 'absolute', left: infoBubble.x, top: 100 + infoBubble.y, transform: 'translate(-50%, 12px)', zIndex: 35, pointerEvents: 'none' }}>
                    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ background: '#ffffff', color: '#000', padding: '8px 12px', borderRadius: 999, boxShadow: '0 8px 20px rgba(2,6,23,0.18)', fontSize: 10.3, fontWeight: 500, textTransform: 'uppercase', whiteSpace: 'nowrap', border: '2px solid #22c55e' }}>YOUR COMMUNITY</div>
                        {/* outer green triangle (border) positioned above the bubble */}
                        <div style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%) rotate(180deg)', width: 0, height: 0, borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderTop: '8px solid #22c55e', marginBottom: -1 }} />
                    </div>
                </div>
            )}

            {/* Popover for clicked signals (anchored overlay like LandingHero) */}
            {popover && !editBoundaryOpen && (
                <div id="signal-popover-wrapper" style={{ position: 'absolute', left: 0, top: 0, transform: `translate(${popover.screen.x - 185}px, ${popover.screen.y - 285}px)`, zIndex: 'var(--z-map-popover)', pointerEvents: 'none' }}>
                    <div style={{ position: 'relative', minWidth: 370, maxWidth: 420 }}>
                        <div style={{ backgroundColor: 'rgba(0,0,0,0.88)', color: '#fff', boxShadow: '0 8px 28px rgba(0,0,0,0.45)', padding: '18px 18px 12px 18px', fontFamily: 'inherit', borderRadius: 6 }}>
                            {/* Close button top right */}
                            <button
                                onClick={() => setPopover(null)}
                                style={{ position: 'absolute', top: 10, right: 14, background: 'none', border: 'none', color: '#fff', fontSize: 26, cursor: 'pointer', zIndex: 2, pointerEvents: 'auto' }}
                                aria-label="Close"
                            >
                                &times;
                            </button>

                            {/* Title */}
                            <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: 0.6, marginBottom: 16 }}>{popover?.title || 'PAMAKAI'}</div>

                            {/* Rows (label/value) */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
                                <div style={{ display: 'flex', flexDirection: 'row', gap: 12 }}>
                                    <div style={{ width: 180, fontSize: 14, fontWeight: 600 }}>Device ID</div>
                                    <div style={{ marginLeft: 'auto', textAlign: 'right', fontSize: 14, maxWidth: 170, whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }}>{(popover as any).deviceId || 'RSQW-001'}</div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'row', gap: 12 }}>
                                    <div style={{ width: 180, fontSize: 14, fontWeight: 600 }}>Focal Person</div>
                                    <div style={{ marginLeft: 'auto', textAlign: 'right', fontSize: 14, maxWidth: 170, whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }}>{popover?.focalPerson || (popover?.title || 'Gwyneth Uy')}</div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'row', gap: 12 }}>
                                    <div style={{ width: 180, fontSize: 14, fontWeight: 600 }}>Alternative Focal Person</div>
                                    <div style={{ marginLeft: 'auto', textAlign: 'right', fontSize: 14, maxWidth: 170, whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }}>{popover?.altFocalPerson || 'Rodel Sustiguer'}</div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'row', gap: 12 }}>
                                    <div style={{ width: 180, fontSize: 14, fontWeight: 600 }}>Terminal Address</div>
                                    <div style={{ marginLeft: 'auto', textAlign: 'right', fontSize: 14, maxWidth: 170, whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }}>{popover.address || 'Block 1, Lot 17, Paraiso Rd, 1400'}</div>
                                </div>

                                {/* Coordinates row (stacked values on right) */}
                                <div style={{ display: 'flex', flexDirection: 'row', gap: 12 }}>
                                    <div style={{ width: 180, fontSize: 14, fontWeight: 600 }}>Coordinates</div>
                                    <div style={{ flex: 1, textAlign: 'right', fontSize: 14, lineHeight: 1.2, maxWidth: 220, whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                                        {popover.lat?.toFixed?.(6) && popover.lng?.toFixed?.(6) ? (
                                            <>
                                                <div>{popover.lat.toFixed(6)}</div>
                                                <div>{popover.lng.toFixed(6)}</div>
                                            </>
                                        ) : (
                                            <div>{(popover as any).coordinates || '—'}</div>
                                        )}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'row', gap: 12 }}>
                                    <div style={{ width: 180, fontSize: 14, fontWeight: 600 }}>Date Registered</div>
                                    <div style={{ marginLeft: 'auto', textAlign: 'right', fontSize: 14, maxWidth: 170, whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }}>{popover.date || 'September 9, 2025'}</div>
                                </div>
                            </div>

                            {/* Action button - match width of the content area */}
                            <div style={{ display: 'block', marginTop: 16 }}>
                                <button
                                    onClick={() => {
                                        // open the community boundary editor modal
                                        setPopover(null);
                                        setEditBoundaryOpen(true);
                                    }}
                                    style={{
                                        pointerEvents: 'auto',
                                        background: 'linear-gradient(to top, #3B82F6 0%, #70A6FF 100%)',
                                        color: '#fff',
                                        border: 'none',
                                        padding: '12px 14px',
                                        borderRadius: 8,
                                        fontWeight: 400,
                                        cursor: 'pointer',
                                        boxShadow: '0 6px 12px rgba(37,99,235,0.28)',
                                        width: '100%',
                                        textAlign: 'center',
                                        fontSize: "13px"
                                    }}
                                >
                                    EDIT MY COMMUNITY MARKERS
                                </button>
                            </div>

                            {/* Downward pointer/arrow */}
                            <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', bottom: '-24px', width: 0, height: 0, borderLeft: '20px solid transparent', borderRight: '20px solid transparent', borderTop: '24px solid rgba(0,0,0,0.88)' }} />
                        </div>
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
                            <PopoverContent side="left" align="center" zIndex={30} style={{ minWidth: 220, padding: 10, background: 'transparent', boxShadow: 'none', border: 'none', transform: 'translateX(8px)' }}>
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
                {/* Delete/Reset button for boundary only when editing, now in its own row below layers */}
                {editBoundaryOpen && (
                    <div>
                        <Tooltip content={"Delete boundary"} side="left">
                            <div style={{ width: 50, height: 50, borderRadius: 7, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 4px 12px rgba(2,6,23,0.21)" }}>
                                <button
                                    aria-label="Delete boundary"
                                    onClick={handleDeleteBoundary}
                                    style={{ background: "transparent", border: "none", color: "#000", display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }}
                                >
                                    <Trash2 size={21} />
                                </button>
                            </div>
                        </Tooltip>
                    </div>
                )}
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

            {/* Display saved GeoJSON */}
            {savedGeoJson && (
                <div style={{ position: "absolute", top: 150, right: 20, zIndex: 50, background: "#fff", padding: "10px", borderRadius: 8 }}>
                    <div style={{ fontWeight: "bold", marginBottom: 5 }}>Saved GeoJSON:</div>
                    <pre style={{ maxHeight: 200, overflow: "auto" }}>{JSON.stringify(savedGeoJson, null, 2)}</pre>
                </div>
            )}


        </div>
    );
}
