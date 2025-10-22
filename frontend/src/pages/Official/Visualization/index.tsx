import { useLiveReport } from '@/components/Official/LiveReportContext';
import { Button } from "@/components/ui/button";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CommunityGroupInfoSheet } from '../CommunityGroups/components/CommunityGroupInfoSheet';
import type { CommunityGroupDetails } from '../CommunityGroups/types';
import LiveReportSidebar from './components/LiveReportSidebar';
import MapControls from './components/MapControls';
import RescueFormPreview from './components/RescueFormPreview';
import SignalPopover from './components/SignalPopover';
import { RescueWaitlistProvider, useRescueWaitlist, type WaitlistedRescueForm } from './contexts/RescueWaitlistContext';
import useSignals from './hooks/useSignals';
import type { Signal, VisualizationSignals } from './types/signals';
import { cinematicMapEntrance, flyToSignal } from './utils/flyingEffects';
import { addCustomLayers, makeTooltip } from './utils/mapHelpers';

mapboxgl.accessToken = "pk.eyJ1Ijoicm9kZWxsbCIsImEiOiJjbWU0OXNvb2gwYnM0MnpvbXNueXo2dzhxIn0.Ep43_IxVhaPhEqWBaAuuyA";

function VisualizationContent() {
    const mapContainer = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    const { isLiveReportOpen, setIsLiveReportOpen } = useLiveReport();
    const { selectedWaitlistForm, setSelectedWaitlistForm } = useRescueWaitlist();
    const [showWaitlistPreview, setShowWaitlistPreview] = useState(false);
    const [showDispatchDialog, setShowDispatchDialog] = useState(false);
    const navigate = useNavigate();

    const handleDispatchRescue = () => {
        setShowDispatchDialog(true);
        
        // Auto-fade after 3 seconds
        setTimeout(() => {
            setShowDispatchDialog(false);
        }, 2000);
    };

    const handleOpenReportForm = () => {
        navigate('/reports');
        setShowDispatchDialog(false);
    };
    
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

    // keep a ref to the latest popover so map event handlers inside the load callback
    // (which are attached once) can see the current value and update its screen coords
    const popoverRef = useRef<typeof popover>(popover);
    useEffect(() => { popoverRef.current = popover; }, [popover]);

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

    // Helper function to display signal boundary
    const displaySignalBoundary = (signal: Signal) => {
        const map = mapRef.current;
        if (!map || !signal.boundary) return;

        // Remove previous boundary layer/source
        try {
            if (map.getLayer('signal-boundary')) map.removeLayer('signal-boundary');
            if (map.getLayer('signal-boundary-line')) map.removeLayer('signal-boundary-line');
            if (map.getSource('signal-boundary')) map.removeSource('signal-boundary');
        } catch (e) { /* ignore */ }

        // Determine color by alert type
        let fillColor = '#22c55e'; // Default green
        let lineColor = '#22c55e'; // Default green
        let opacity = 0.15;
        const alertType = signal.properties.alertType;
        
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

        // Add boundary source and layers
        map.addSource('signal-boundary', {
            type: 'geojson',
            data: {
                type: 'Feature',
                properties: {},
                geometry: {
                    type: 'Polygon',
                    coordinates: [signal.boundary]
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
    };

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
                if (features.length === 0 && sidebarOpenRef.current) {
                    // Only close if clicking on empty map area and sidebar is open
                    setIsLiveReportOpen(false);
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
                onDispatchRescue={handleDispatchRescue}
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
                    
                    // Display the signal boundary
                    displaySignalBoundary(signal);
                    
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
                onWaitlistCardClick={(form: WaitlistedRescueForm) => {
                    setSelectedWaitlistForm(form);
                    setShowWaitlistPreview(true);
                }}
            />

            {/* Community Group Info Sheet */}
            <CommunityGroupInfoSheet
                open={infoSheetOpen}
                onOpenChange={setInfoSheetOpen}
                communityData={selectedCommunityData}
            />

            {/* Waitlisted Rescue Form Preview */}
            {selectedWaitlistForm && (
                <RescueFormPreview 
                    isOpen={showWaitlistPreview}
                    onClose={() => {
                        setShowWaitlistPreview(false);
                        setSelectedWaitlistForm(null);
                    }}
                    onBack={() => {
                        setShowWaitlistPreview(false);
                    }}
                    formData={selectedWaitlistForm}
                    onDispatch={handleDispatchRescue}
                />
            )}

            {/* Dispatch Success Toast - positioned in bottom left */}
            {showDispatchDialog && (
                <div className="fixed bottom-6 left-21 z-50 animate-in slide-in-from-left-5 duration-300">
                    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg shadow-lg p-4 max-w-sm">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-white text-sm font-medium">
                                    PAMAKAI rescue team has been dispatched!
                                </h3>
                                <Button
                                    onClick={handleOpenReportForm}
                                    className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white text-xs h-8"
                                >
                                    Open report page
                                </Button>
                            </div>
                            <button
                                onClick={() => setShowDispatchDialog(false)}
                                className="text-gray-400 hover:text-white text-lg leading-none"
                            >
                                ×
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export function Visualization() {
    return (
        <RescueWaitlistProvider>
            <VisualizationContent />
        </RescueWaitlistProvider>
    );
}