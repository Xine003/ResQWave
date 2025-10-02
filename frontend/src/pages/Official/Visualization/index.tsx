import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef, useState } from "react";
import MapControls from './components/MapControls';
import SignalPopover from './components/SignalPopover';
import useSignals from './hooks/useSignals';
import type { VisualizationSignals } from './types/signals';
import { cinematicMapEntrance, flyToSignal } from './utils/flyingEffects';
import { addCustomLayers, makeTooltip } from './utils/mapHelpers';

mapboxgl.accessToken = "pk.eyJ1Ijoicm9kZWxsbCIsImEiOiJjbWU0OXNvb2gwYnM0MnpvbXNueXo2dzhxIn0.Ep43_IxVhaPhEqWBaAuuyA";

export function Visualization() {
    const mapContainer = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    
    // signal & UI state provided by the useSignals hook (centralized)
    const signals = useSignals();
    const { otherSignals, ownCommunitySignal: OwnCommunitySignal, popover, setPopover, infoBubble, setInfoBubble, infoBubbleVisible, setInfoBubbleVisible, getDistressCoord } = signals as unknown as VisualizationSignals;
    const distressCoord: [number, number] = getDistressCoord();

    // keep a ref to the latest popover so map event handlers inside the load callback
    // (which are attached once) can see the current value and update its screen coords
    const popoverRef = useRef<typeof popover>(popover);
    useEffect(() => { popoverRef.current = popover; }, [popover]);

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
                // make the canvas focusable so keyboard interactions can work
                const canvas = map.getCanvas() as HTMLCanvasElement | null;
                if (canvas) {
                    canvas.tabIndex = 0;
                    canvas.style.touchAction = 'auto';
                }
            } catch (e) { }

            addCustomLayers(map, otherSignals, OwnCommunitySignal);
            
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

            // Click interactions: open popover anchored to clicked signal
            const signalLayers = ["signal-pins"];

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
                            // Determine color by alert type
                            let fillColor = '#22c55e'; // Default green
                            let lineColor = '#22c55e'; // Default green
                            let opacity = 0.15;
                            let alertType = f?.properties?.alertType;
                            
                            switch (alertType) {
                                case 'CRITICAL':
                                    fillColor = '#ef4444'; // Red
                                    lineColor = '#ef4444';
                                    opacity = 0.2; // Slightly more opacity for critical
                                    break;
                                case 'USER-INITIATED':
                                    fillColor = '#eab308'; // Yellow
                                    lineColor = '#eab308';
                                    opacity = 0.15;
                                    break;
                                case 'ONLINE':
                                    fillColor = '#22c55e'; // Green
                                    lineColor = '#22c55e';
                                    opacity = 0.15;
                                    break;
                                case 'OFFLINE':
                                    fillColor = '#6b7280'; // Gray
                                    lineColor = '#6b7280';
                                    opacity = 0.1;
                                    break;
                                default:
                                    fillColor = '#6b7280'; // Default gray
                                    lineColor = '#6b7280';
                                    opacity = 0.1;
                                    break;
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
            signalLayers.forEach(layerId => {
                map.on('click', layerId, hideInfoBubbleOnClick);
            });
            bindLayerClicks(signalLayers);

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

    return (
        <div style={{ 
            height: "calc(100vh - 70px)", 
            minHeight: "610px", 
            maxHeight: "93vh", 
            width: "100%", 
            position: "relative", 
            background: "#222", 
            overflow: "hidden" 
        }}>
            <div ref={mapContainer} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }} />

            <SignalPopover
                popover={popover}
                setPopover={setPopover}
                infoBubble={infoBubble}
                infoBubbleVisible={infoBubbleVisible}
                onClose={() => {
                    // remove any temporary signal boundary overlay when popover closes
                    const map = mapRef.current;
                    if (!map) return;
                    try {
                        if (map.getLayer('signal-boundary')) map.removeLayer('signal-boundary');
                        if (map.getLayer('signal-boundary-line')) map.removeLayer('signal-boundary-line');
                        if (map.getSource('signal-boundary')) map.removeSource('signal-boundary');
                    } catch (e) { /* ignore */ }
                }}
            />

            <MapControls 
                mapRef={mapRef} 
                mapLoaded={mapLoaded} 
                makeTooltip={makeTooltip} 
                addCustomLayers={(m) => addCustomLayers(m, otherSignals, OwnCommunitySignal)} 
            />
        </div>
    );
}