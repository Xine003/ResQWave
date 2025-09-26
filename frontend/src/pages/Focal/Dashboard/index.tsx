import { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import { flyToSignal, cinematicMapEntrance } from './utils/flyingEffects';
import Header from "./components/Header";
import MapControls from './components/MapControls';
import SignalPopup from './components/SignalPopup';
import useSignals from './hooks/useSignals';
import type { DashboardSignals } from './types/signals';
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import { createDraw, ensureSquareGreenImage, changeToDrawPolygon, makeUpdateCanSave } from './utils/drawMapBoundary';
import { addCustomLayers, makeTooltip } from './utils/mapHelpers';
import Alert, { AlertTitle, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2Icon, Info } from 'lucide-react';
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import { CircleAlert } from 'lucide-react';


mapboxgl.accessToken = "pk.eyJ1Ijoicm9kZWxsbCIsImEiOiJjbWU0OXNvb2gwYnM0MnpvbXNueXo2dzhxIn0.Ep43_IxVhaPhEqWBaAuuyA";

export default function Dashboard() {
    const mapContainer = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    // signal & UI state provided by the useSignals hook (centralized)
    const signals = useSignals();
    const { otherSignals, ownCommunitySignal: OwnCommunitySignal, editBoundaryOpen, setEditBoundaryOpen, popover, setPopover, infoBubble, setInfoBubble, infoBubbleVisible, setInfoBubbleVisible, setSavedGeoJson, canSave, setCanSave, getDistressCoord } = signals as unknown as DashboardSignals;
    const distressCoord: [number, number] = getDistressCoord();

    // transient bottom-centered alert when entering edit mode
    const [showEditAlert, setShowEditAlert] = useState(false);
    const editAlertTimer = useRef<number | null>(null);
    // transient alert when drawn boundary becomes valid
    const [showValidAlert, setShowValidAlert] = useState(false);
    const validAlertTimer = useRef<number | null>(null);
    // transient alert shown after user clicks Save
    const [showSavedAlert, setShowSavedAlert] = useState(false);
    const savedAlertTimer = useRef<number | null>(null);

    // keep a ref to the latest popover so map event handlers inside the load callback
    // (which are attached once) can see the current value and update its screen coords
    const popoverRef = useRef<typeof popover>(popover);
    useEffect(() => { popoverRef.current = popover; }, [popover]);

    useEffect(() => {
        // when editBoundaryOpen becomes true, show the transient alert
        if (editBoundaryOpen) {
            // clear any previous timer
            if (editAlertTimer.current) {
                window.clearTimeout(editAlertTimer.current);
            }
            setShowEditAlert(true);
            editAlertTimer.current = window.setTimeout(() => {
                setShowEditAlert(false);
                editAlertTimer.current = null;
            }, 3000);
        }

        return () => {
            if (editAlertTimer.current) {
                window.clearTimeout(editAlertTimer.current);
                editAlertTimer.current = null;
            }
        };
    }, [editBoundaryOpen]);

    // show a transient success alert when the drawn boundary becomes savable/valid
    useEffect(() => {
        if (canSave) {
            // clear any previous timer
            if (validAlertTimer.current) {
                window.clearTimeout(validAlertTimer.current);
            }
            setShowValidAlert(true);
            console.debug('[Dashboard] canSave -> true: showing valid alert');
            validAlertTimer.current = window.setTimeout(() => {
                console.debug('[Dashboard] valid alert timeout: hiding');
                setShowValidAlert(false);
                // note: do NOT reset canSave here so the Save button remains enabled until explicit save/exit
                validAlertTimer.current = null;
            }, 2500);
        }

        return () => {
            if (validAlertTimer.current) {
                window.clearTimeout(validAlertTimer.current);
                validAlertTimer.current = null;
            }
        };
    }, [canSave]);



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
        // show saved alert (transient with View Logs button)
        if (savedAlertTimer.current) {
            window.clearTimeout(savedAlertTimer.current);
        }
        setShowSavedAlert(true);
        savedAlertTimer.current = window.setTimeout(() => {
            setShowSavedAlert(false);
            savedAlertTimer.current = null;
        }, 411000);
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
        // Optionally, clear boundary or keep as is
    };

    return (
        <div style={{ minHeight: "100vh", width: "100%", position: "relative", background: "#222", overflow: "hidden" }}>
            <Header editBoundaryOpen={editBoundaryOpen} canSave={canSave} onSave={handleSave} onExit={handleExitEdit} />

            <div ref={mapContainer} style={{ position: "absolute", top: 85, left: 0, right: 0, bottom: 0, zIndex: 1 }} />

            <SignalPopup popover={popover} setPopover={setPopover} setEditBoundaryOpen={setEditBoundaryOpen} infoBubble={infoBubble} infoBubbleVisible={infoBubbleVisible} />

            <MapControls mapRef={mapRef} mapLoaded={mapLoaded} makeTooltip={makeTooltip} addCustomLayers={(m) => addCustomLayers(m, otherSignals, OwnCommunitySignal)} editBoundaryOpen={editBoundaryOpen} handleDeleteBoundary={handleDeleteBoundary} />

            {/* Display saved GeoJSON */}
            {/* {savedGeoJson && (
                <div style={{ position: "absolute", top: 150, right: 20, zIndex: 50, background: "#fff", padding: "10px", borderRadius: 8 }}>
                    <div style={{ fontWeight: "bold", marginBottom: 5 }}>Saved GeoJSON:</div>
                    <pre style={{ maxHeight: 200, overflow: "auto" }}>{JSON.stringify(savedGeoJson, null, 2)}</pre>
                </div>
            )} */}
            {/* Transient bottom-centered alert that slides up when editing community markers */}
            {/* Boundaries valid success alert (shown briefly when polygon is closed) */}
            <div style={{ position: 'absolute', left: '50%', bottom: 30, transform: `translateX(-50%) translateY(${showValidAlert ? '0' : '80px'})`, transition: 'transform 220ms cubic-bezier(.2,.9,.2,1), opacity 220ms linear', opacity: showValidAlert ? 1 : 0, pointerEvents: showValidAlert ? 'auto' : 'none', zIndex: 62 }}>
                <div style={{ minWidth: 160, maxWidth: 320 }}>
                    <Alert iconBoxVariant="success">
                        <CheckCircle2Icon color="#22c55e" />
                        <div>
                            <AlertDescription><b>Note:</b> Boundaries set are valid!</AlertDescription>
                        </div>
                    </Alert>
                </div>
            </div>

            {/* Transient bottom-centered alert that slides up when editing community markers */}
            <div style={{ position: 'absolute', left: '50%', bottom: 30, transform: `translateX(-50%) translateY(${showEditAlert ? '0' : '120px'})`, transition: 'transform 320ms cubic-bezier(.2,.9,.2,1)', zIndex: 60 }}>
                <div style={{ minWidth: 520, maxWidth: 570, background: "#000", borderRadius: 7 }}>
                    <Alert iconBoxVariant="note">
                        <Info color="#3B82F6" />
                        <div>
                            <AlertDescription>
                                <b>Note:</b> Click on the map to mark the corners of your community boundary. The border will connect automatically.
                            </AlertDescription>
                        </div>
                    </Alert>
                </div>
            </div>

            {/* Saved confirmation alert with View Logs button */}
            <div style={{ position: 'absolute', left: 30, bottom: 30, transform: `translateY(${showSavedAlert ? '0' : '120px'})`, transition: 'transform 320ms cubic-bezier(.2,.9,.2,1), opacity 220ms linear', opacity: showSavedAlert ? 1 : 0, pointerEvents: showSavedAlert ? 'auto' : 'none', zIndex: 70 }}>
                <div style={{ minWidth: 220, maxWidth: 520 }}>
                    <Alert iconBoxVariant="success">
                        <CheckCircle2Icon color="#22c55e" />
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                            <div style={{ minWidth: 290 }}>
                                <AlertDescription>Your New Community Boundary is now set!</AlertDescription>
                            </div>
                            <div>
                                <button onClick={() => console.log('View Logs clicked')} style={{ background: '#3B82F6', fontSize: "13px", color: '#fff', padding: '8px 14px', borderRadius: 4, border: 'none', cursor: 'pointer' }}>View Logs</button>
                            </div>
                        </div>
                    </Alert>
                </div>
            </div>


        </div>
    );
}
