import { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import { flyToSignal, cinematicMapEntrance } from './utils/flyingEffects';
import Header from "./components/Header";
import AboutModal from "./components/AboutModal";
import MapControls from './components/MapControls';
import SignalPopover from './components/SignalPopover';
import useSignals from './hooks/useSignals';
import type { DashboardSignals } from './types/signals';
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import { createDraw, ensureSquareGreenImage, changeToDrawPolygon, makeUpdateCanSave } from './utils/drawMapBoundary';
import { addCustomLayers, makeTooltip } from './utils/mapHelpers';
import DashboardAlerts from './components/DashboardAlerts';
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
// lucide icons removed (unused in this file)


mapboxgl.accessToken = "pk.eyJ1Ijoicm9kZWxsbCIsImEiOiJjbWU0OXNvb2gwYnM0MnpvbXNueXo2dzhxIn0.Ep43_IxVhaPhEqWBaAuuyA";

export default function Dashboard() {
    const mapContainer = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    // signal & UI state provided by the useSignals hook (centralized)
    const signals = useSignals();
    const { otherSignals, ownCommunitySignal: OwnCommunitySignal, editBoundaryOpen, setEditBoundaryOpen, popover, setPopover, infoBubble, setInfoBubble, infoBubbleVisible, setInfoBubbleVisible, setSavedGeoJson, canSave, setCanSave, getDistressCoord } = signals as unknown as DashboardSignals;
    const distressCoord: [number, number] = getDistressCoord();

    // Dashboard alerts are now handled by DashboardAlerts component
    const alertsRef = useRef<any>(null);
    const [savedTrigger, setSavedTrigger] = useState<number | null>(null);

    // keep a ref to the latest popover so map event handlers inside the load callback
    // (which are attached once) can see the current value and update its screen coords
    const popoverRef = useRef<typeof popover>(popover);
    useEffect(() => { popoverRef.current = popover; }, [popover]);

    // Alerts are handled by the DashboardAlerts component (centralized)



    // addCustomLayers moved to utils/mapHelpers and imported above
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

            addCustomLayers(map, otherSignals, OwnCommunitySignal);
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
                            const rect = mapContainer.current?.getBoundingClientRect();
                            const absX = (rect?.left ?? 0) + pt.x;
                            const absY = (rect?.top ?? 0) + pt.y;
                            const props = f?.properties || {};
                            setPopover({
                                lng: coord[0],
                                lat: coord[1],
                                screen: { x: absX, y: absY },
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
                            const rect2 = mapContainer.current?.getBoundingClientRect();
                            const absX2 = (rect2?.left ?? 0) + pt.x;
                            const absY2 = (rect2?.top ?? 0) + pt.y;
                            const props = f?.properties || {};
                            setPopover({
                                lng: coord[0],
                                lat: coord[1],
                                screen: { x: absX2, y: absY2 },
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
                const current = popoverRef.current;
                if (!current) return;
                try {
                    const pt = map.project([current.lng, current.lat]);
                    const rect = mapContainer.current?.getBoundingClientRect();
                    const absX = (rect?.left ?? 0) + pt.x;
                    const absY = (rect?.top ?? 0) + pt.y;
                    setPopover({ ...current, screen: { x: absX, y: absY } });
                } catch (e) {
                    // ignore
                }
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

    // makeTooltip moved to utils/mapHelpers and imported above

    // canSave and savedGeoJson are provided by useSignals() hook
    const drawRef = useRef<MapboxDraw | null>(null);
    // removed isEditingBoundary (unused)

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

        // Reset canSave when entering edit mode so subsequent draw completion toggles canSave -> true
        setCanSave(false);

        // create draw instance and add helper image
        drawRef.current = createDraw();
        ensureSquareGreenImage(map);

        map.addControl(drawRef.current as any);

        // immediately switch into draw polygon mode and focus the canvas
        setTimeout(() => {
            changeToDrawPolygon(drawRef.current);
            const canvas = map.getCanvas();
            if (canvas) canvas.focus();
        }, 0);

        const updateCanSave = makeUpdateCanSave(drawRef, setCanSave);

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
        // ask DashboardAlerts to hide the valid alert (centralized)
        alertsRef.current?.hideValidAlert?.();
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
        // Programmatically show the saved boundary and popover for the signal we edited
        try {
            const map = mapRef.current;
            if (map && newBoundary) {
                // remove any previous temporary boundary overlay
                if (map.getLayer('signal-boundary')) map.removeLayer('signal-boundary');
                if (map.getLayer('signal-boundary-line')) map.removeLayer('signal-boundary-line');
                if (map.getSource('signal-boundary')) map.removeSource('signal-boundary');

                // determine the actual signal point coordinate (use the edited signal's point)
                let signalCoord: [number, number] | null = null;
                const targetDeviceId = popover?.deviceId ?? OwnCommunitySignal.properties.deviceId;
                let sourceSignalFeature: any = null;
                if (targetDeviceId === OwnCommunitySignal.properties.deviceId) {
                    sourceSignalFeature = OwnCommunitySignal as any;
                    if (OwnCommunitySignal?.coordinates) {
                        signalCoord = OwnCommunitySignal.coordinates as [number, number];
                    }
                } else {
                    const found = otherSignals.find((s: any) => s.properties?.deviceId === targetDeviceId);
                    if (found) {
                        sourceSignalFeature = found;
                        if (found.coordinates) signalCoord = found.coordinates as [number, number];
                    }
                }

                // Add boundary source + layers (same style as click handler)
                map.addSource('signal-boundary', {
                    type: 'geojson',
                    data: {
                        type: 'Feature',
                        properties: {},
                        geometry: {
                            type: 'Polygon',
                            coordinates: [newBoundary]
                        }
                    }
                });
                map.addLayer({
                    id: 'signal-boundary',
                    type: 'fill',
                    source: 'signal-boundary',
                    paint: {
                        'fill-color': '#2CBE00',
                        'fill-opacity': 0.1
                    }
                });
                map.addLayer({
                    id: 'signal-boundary-line',
                    type: 'line',
                    source: 'signal-boundary',
                    paint: {
                        'line-color': '#2CBE00',
                        'line-width': 3,
                        'line-dasharray': [2, 4]
                    }
                });

                // Use the signal point for flyTo/popover. If not available, fall back to polygon centroid
                let coord: [number, number];
                if (signalCoord) {
                    coord = signalCoord;
                } else {
                    // centroid fallback
                    const pts = Array.isArray(newBoundary) ? newBoundary : [];
                    let cx = 0, cy = 0;
                    if (pts.length > 0) {
                        for (const p of pts) {
                            cx += p[0];
                            cy += p[1];
                        }
                        cx = cx / pts.length;
                        cy = cy / pts.length;
                    }
                    coord = [cx, cy];
                }

                try { flyToSignal(map, coord); } catch (e) { }

                const rect = mapContainer.current?.getBoundingClientRect();
                const pt = map.project(coord);
                const absX = (rect?.left ?? 0) + pt.x;
                const absY = (rect?.top ?? 0) + pt.y;

                // Build popover props using the actual signal feature when possible
                const deviceId = targetDeviceId;
                const propsFromSignal = sourceSignalFeature?.properties || {};
                setPopover({
                    lng: coord[0],
                    lat: coord[1],
                    screen: { x: absX, y: absY },
                    status: propsFromSignal.status || popover?.status || 'online',
                    title: propsFromSignal.name || popover?.title || (propsFromSignal.status === 'offline' ? 'Offline Signal' : 'Community'),
                    address: propsFromSignal.address || popover?.address,
                    date: propsFromSignal.date || popover?.date,
                    deviceId,
                    focalPerson: propsFromSignal.focalPerson || popover?.focalPerson,
                    altFocalPerson: propsFromSignal.altFocalPerson || popover?.altFocalPerson
                });
            }
        } catch (e) {
            console.warn('[Dashboard] could not programmatically show saved boundary popover', e);
        }
        // notify DashboardAlerts that a save happened
        setSavedTrigger(prev => (prev == null ? 1 : prev + 1));
        // after saving, clear canSave so future edits re-trigger the valid alert
        setCanSave(false);
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

    // handleEditCommunityMarkers removed (replaced by direct UI flow that sets editBoundaryOpen)

    const handleExitEdit = () => {
        setEditBoundaryOpen(false);
        // hide any transient valid alert via the alerts component
        alertsRef.current?.hideValidAlert?.();
    };

    // About modal state (opened when user clicks "About Your Community" tab)
    const [aboutOpen, setAboutOpen] = useState(false);
    const [aboutCenter, setAboutCenter] = useState<{ x: number; y: number } | null>(null);
    const [activeTab, setActiveTab] = useState('community');
    const openAbout = () => {
        // compute map container center in viewport coords so modal sits over the map
        try {
            const rect = mapContainer.current?.getBoundingClientRect();
            if (rect) {
                const center = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
                setAboutCenter(center);
            } else {
                setAboutCenter(null);
            }
        } catch (e) {
            setAboutCenter(null);
        }
        setAboutOpen(true);
        setActiveTab('about');
    };
    const closeAbout = () => { setAboutOpen(false); setActiveTab('community'); };
    const handleTabChange = (value: string) => {
        setActiveTab(value);
        if (value === 'community') closeAbout();
    };

    return (
        <div style={{ minHeight: "100vh", width: "100%", position: "relative", background: "#222", overflow: "hidden" }}>
            <Header editBoundaryOpen={editBoundaryOpen} canSave={canSave} onSave={handleSave} onExit={handleExitEdit} onAboutClick={openAbout} onTabChange={handleTabChange} activeTab={activeTab} />

            <div ref={mapContainer} style={{ position: "absolute", top: 85, left: 0, right: 0, bottom: 0, zIndex: 1 }} />

            <SignalPopover popover={popover} setPopover={setPopover} setEditBoundaryOpen={setEditBoundaryOpen} infoBubble={infoBubble} infoBubbleVisible={infoBubbleVisible} />

            <MapControls mapRef={mapRef} mapLoaded={mapLoaded} makeTooltip={makeTooltip} addCustomLayers={(m) => addCustomLayers(m, otherSignals, OwnCommunitySignal)} editBoundaryOpen={editBoundaryOpen} handleDeleteBoundary={handleDeleteBoundary} />

            <AboutModal open={aboutOpen} onClose={closeAbout} onEdit={() => console.log('Edit About')} center={aboutCenter} />

            {/* Transient bottom-centered alert that slides up when editing community markers */}
            {/* centralized dashboard alerts (edit/valid/saved) */}
            <DashboardAlerts ref={alertsRef} editBoundaryOpen={editBoundaryOpen} canSave={canSave} savedTrigger={savedTrigger} onViewLogs={() => console.log('View Logs clicked')} />

        </div>
    );
}
