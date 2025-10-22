import { useLiveReport } from '@/components/Official/LiveReportContext';
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef, useState } from "react";
import { CommunityGroupInfoSheet } from '../CommunityGroups/components/CommunityGroupInfoSheet';
import type { CommunityGroupDetails } from '../CommunityGroups/types';
import LiveReportSidebar from './components/LiveReportSidebar';
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
    const { isLiveReportOpen, setIsLiveReportOpen } = useLiveReport();
    
    // Keep a ref to the latest sidebar state so map event handlers can see the current value
    const sidebarOpenRef = useRef<boolean>(isLiveReportOpen);
    useEffect(() => { sidebarOpenRef.current = isLiveReportOpen; }, [isLiveReportOpen]);
    
    // Community info sheet state
    const [infoSheetOpen, setInfoSheetOpen] = useState(false);
    const [selectedCommunityData, setSelectedCommunityData] = useState<CommunityGroupDetails | undefined>(undefined);
    
    // signal & UI state provided by the useSignals hook (centralized)
    const signals = useSignals();
    const { otherSignals, ownCommunitySignal: OwnCommunitySignal, popover, setPopover, infoBubble, setInfoBubble, infoBubbleVisible, setInfoBubbleVisible, getDistressCoord } = signals as unknown as VisualizationSignals;
    const distressCoord: [number, number] = getDistressCoord();

    // State for clicked pin animation
    const [clickedPinCoord, setClickedPinCoord] = useState<[number, number] | null>(null);
    const [clickedPinColor, setClickedPinColor] = useState<string>('#22c55e');

    // keep a ref to the latest popover so map event handlers inside the load callback
    // (which are attached once) can see the current value and update its screen coords
    const popoverRef = useRef<typeof popover>(popover);
    useEffect(() => { popoverRef.current = popover; }, [popover]);

    // Helper functions for beating animation
    const addBeatingAnimation = (map: mapboxgl.Map, coord: [number, number], color: string) => {
        // Remove existing animation layers
        removeBeatingAnimation(map);

        // Add source for the beating animation
        map.addSource('beating-animation', {
            type: 'geojson',
            data: {
                type: 'Feature',
                properties: {},
                geometry: {
                    type: 'Point',
                    coordinates: coord
                }
            }
        });

        // Add outer pulsing circle layer - positioned below signal pins
        map.addLayer({
            id: 'beating-circle-outer',
            type: 'circle',
            source: 'beating-animation',
            paint: {
                'circle-radius': 20,
                'circle-color': color,
                'circle-opacity': 0.3
            }
        }, 'signal-pins'); // Insert before signal-pins layer so it appears behind

        // Add inner pulsing circle layer - positioned below signal pins
        map.addLayer({
            id: 'beating-circle-inner',
            type: 'circle',
            source: 'beating-animation',
            paint: {
                'circle-radius': 12,
                'circle-color': color,
                'circle-opacity': 0.5
            }
        }, 'signal-pins'); // Insert before signal-pins layer so it appears behind

        // Animate the circles with a beating effect
        const startTime = Date.now();
        
        const animateBeating = () => {
            if (!map.getSource('beating-animation')) return; // Stop if source was removed
            
            const elapsed = Date.now() - startTime;
            const phase = (elapsed % 1200) / 1200; // 1.2 second cycle
            
            // Create pulsing effect with sine wave (0 to 1)
            const pulse = (Math.sin(phase * Math.PI * 2) + 1) / 2;
            
            // Calculate dynamic sizes and opacities
            const outerRadius = 15 + pulse * 10; // Pulse between 15-25
            const innerRadius = 8 + pulse * 6;   // Pulse between 8-14
            const outerOpacity = 0.1 + pulse * 0.3; // Pulse between 0.1-0.4
            const innerOpacity = 0.3 + pulse * 0.4; // Pulse between 0.3-0.7

            // Update outer circle
            if (map.getLayer('beating-circle-outer')) {
                map.setPaintProperty('beating-circle-outer', 'circle-radius', [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    8, outerRadius * 0.5,
                    12, outerRadius,
                    16, outerRadius * 1.5,
                    20, outerRadius * 2
                ]);
                map.setPaintProperty('beating-circle-outer', 'circle-opacity', outerOpacity);
            }

            // Update inner circle
            if (map.getLayer('beating-circle-inner')) {
                map.setPaintProperty('beating-circle-inner', 'circle-radius', [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    8, innerRadius * 0.5,
                    12, innerRadius,
                    16, innerRadius * 1.5,
                    20, innerRadius * 2
                ]);
                map.setPaintProperty('beating-circle-inner', 'circle-opacity', innerOpacity);
            }

            requestAnimationFrame(animateBeating);
        };
        
        animateBeating();
    };

    const removeBeatingAnimation = (map: mapboxgl.Map) => {
        try {
            if (map.getLayer('beating-circle-outer')) map.removeLayer('beating-circle-outer');
            if (map.getLayer('beating-circle-inner')) map.removeLayer('beating-circle-inner');
            if (map.getSource('beating-animation')) map.removeSource('beating-animation');
        } catch (e) {
            // ignore errors
        }
    };

    const getSignalColor = (alertType: string | undefined, status: string | undefined) => {
        if (status === 'offline') return '#6b7280'; // Gray for offline
        
        switch (alertType) {
            case 'CRITICAL':
                return '#ef4444'; // Red
            case 'USER-INITIATED':
                return '#eab308'; // Yellow
            case 'ONLINE':
                return '#22c55e'; // Green
            default:
                return '#22c55e'; // Default green
        }
    };

    // Handle map resize when sidebar opens/closes
    useEffect(() => {
        const map = mapRef.current;
        if (map) {
            // Delay the resize to allow for transition
            setTimeout(() => {
                map.resize();
            }, 300);
        }
    }, [isLiveReportOpen]);



    // Clean up: close sidebar when component unmounts
    useEffect(() => {
        return () => {
            setIsLiveReportOpen(false);
        };
    }, [setIsLiveReportOpen]);

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
                        const deviceId = f?.properties?.deviceId;

                        try {
                            // Get signal color for animation
                            const props = f?.properties || {};
                            const signalColor = getSignalColor(props.alertType, props.status);
                            
                            // Add beating animation at clicked pin location
                            addBeatingAnimation(map, coord, signalColor);
                            setClickedPinCoord(coord);
                            setClickedPinColor(signalColor);

                            // Center the map on the clicked signal's coordinates using utility
                            flyToSignal(map, coord);
                            // Show popover immediately at current projected position
                            const pt = map.project(coord);
                            const rect = mapContainer.current?.getBoundingClientRect();
                            const absX = (rect?.left ?? 0) + pt.x;
                            const absY = (rect?.top ?? 0) + pt.y;
                            
                            // Find the community details for this signal
                            let communityDetails = undefined;
                            if (deviceId === OwnCommunitySignal.properties.deviceId) {
                                communityDetails = OwnCommunitySignal.communityDetails;
                            } else {
                                const found = otherSignals.find(s => s.properties.deviceId === deviceId);
                                if (found) communityDetails = found.communityDetails;
                            }
                            
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
                                altFocalPerson: props.altFocalPerson || undefined,
                                alertType: props.alertType || undefined,
                                communityDetails: communityDetails
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
                                alertType: props.alertType || undefined,
                                communityDetails: undefined // fallback case - no community details
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

            // Close sidebar when clicking on the map (but not on signal pins)
            map.on('click', (e) => {
                // Check if the click was on a signal layer
                const features = map.queryRenderedFeatures(e.point, { layers: signalLayers });
                if (features.length === 0) {
                    // Remove beating animation when clicking on empty map area
                    removeBeatingAnimation(map);
                    setClickedPinCoord(null);
                    
                    if (sidebarOpenRef.current) {
                        // Only close if clicking on empty map area and sidebar is open
                        setIsLiveReportOpen(false);
                    }
                }
            });

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
            // Clean up beating animation
            removeBeatingAnimation(map);
            mapRef.current = null;
            map.remove();
        };
    }, []);

    // Handler for opening community info sheet from popover
    const handleOpenCommunityInfo = () => {
        if (popover?.communityDetails) {
            setSelectedCommunityData(popover.communityDetails);
            setInfoSheetOpen(true);
        }
    };

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
            {/* Map Container */}
            <div ref={mapContainer} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }} />

            <SignalPopover
                popover={popover}
                setPopover={setPopover}
                infoBubble={infoBubble}
                infoBubbleVisible={infoBubbleVisible}
                onOpenCommunityInfo={handleOpenCommunityInfo}
            />

            <MapControls 
                mapRef={mapRef} 
                mapLoaded={mapLoaded} 
                makeTooltip={makeTooltip} 
                addCustomLayers={(m) => addCustomLayers(m, otherSignals, OwnCommunitySignal)} 
                onToggleLiveReport={() => setIsLiveReportOpen(!isLiveReportOpen)}
                isLiveReportOpen={isLiveReportOpen}
            />

            {/* Live Report Sidebar */}
            <LiveReportSidebar
                isOpen={isLiveReportOpen}
                onClose={() => setIsLiveReportOpen(false)}
                signals={[...otherSignals, OwnCommunitySignal]}
                onCardClick={(signal) => {
                    const map = mapRef.current;
                    if (!map) return;
                    
                    const coord = signal.coordinates;
                    
                    // Get signal color for animation
                    const signalColor = getSignalColor(signal.properties.alertType, signal.properties.status);
                    
                    // Add beating animation at signal location
                    addBeatingAnimation(map, coord, signalColor);
                    setClickedPinCoord(coord);
                    setClickedPinColor(signalColor);
                    
                    // Fly to the signal location
                    flyToSignal(map, coord);
                    
                    // Wait a moment for the map to finish flying, then show popover
                    setTimeout(() => {
                        // Calculate screen position for popover
                        const pt = map.project(coord);
                        const rect = mapContainer.current?.getBoundingClientRect();
                        const absX = (rect?.left ?? 0) + pt.x;
                        const absY = (rect?.top ?? 0) + pt.y;
                        
                        // Open the popover with signal information
                        setPopover({
                            lng: coord[0],
                            lat: coord[1],
                            screen: { x: absX, y: absY },
                            status: signal.properties.status || undefined,
                            title: signal.properties.name || 'Unknown Location',
                            address: signal.properties.address || undefined,
                            date: signal.properties.date || undefined,
                            deviceId: signal.properties.deviceId || undefined,
                            focalPerson: signal.properties.focalPerson || undefined,
                            altFocalPerson: signal.properties.altFocalPerson || undefined,
                            alertType: signal.properties.alertType || undefined,
                            communityDetails: signal.communityDetails
                        });
                    }, 500); // Small delay to let the map finish flying
                }}
            />

            {/* Community Group Info Sheet */}
            <CommunityGroupInfoSheet
                open={infoSheetOpen}
                onOpenChange={setInfoSheetOpen}
                communityData={selectedCommunityData}
            />
        </div>
    );
}