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
import type { VisualizationSignals } from './types/signals';
import { cinematicMapEntrance, flyToSignal } from './utils/flyingEffects';
import { addCustomLayers, getPinColor, makeTooltip } from './utils/mapHelpers';

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
    
    // Signal & UI state from centralized hook
    const signals = useSignals();
    const { 
        otherSignals, 
        ownCommunitySignal: OwnCommunitySignal, 
        popover, 
        setPopover, 
        infoBubble, 
        setInfoBubble, 
        infoBubbleVisible, 
        setInfoBubbleVisible, 
        getDistressCoord 
    } = signals as unknown as VisualizationSignals;
    
    const distressCoord: [number, number] = getDistressCoord();
    const popoverRef = useRef<typeof popover>(popover);
    
    useEffect(() => { 
        popoverRef.current = popover; 
    }, [popover]);

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



    /**
     * Displays a colored circle with pulsing animation around a signal on the map
     */
    const displayBeatingCircle = (signal: any) => {
        const map = mapRef.current;
        if (!map) return;

        const coord = signal.coordinates;
        const alertType = signal.properties.alertType || signal.properties.status || 'offline';
        const color = getPinColor(alertType);

        // Remove previous circle if exists
        if (map.getLayer('signal-radius')) map.removeLayer('signal-radius');
        if (map.getSource('signal-radius')) map.removeSource('signal-radius');

        // Check if createGeoJSONCircle is available
        if (typeof (map as any).createGeoJSONCircle === 'function') {
            // Remove any previous animation frame
            if ((map as any)._pulseFrame) {
                cancelAnimationFrame((map as any)._pulseFrame);
                (map as any)._pulseFrame = null;
            }

            // Animation config
            interface PulseConfig {
                minRadius: number;
                maxRadius: number;
                duration: number;
                color: string;
                opacity: number;
            }
            const pulseConfig: PulseConfig = {
                minRadius: 0, // start at the signal point
                maxRadius: 50, // expand outward (50m radius)
                duration: 2000, // ms for one pulse
                color,
                opacity: 0.3
            };

            // Add source and layer for the pulse
            map.addSource('signal-radius', {
                type: 'geojson',
                data: (map as any).createGeoJSONCircle(coord, pulseConfig.minRadius)
            });

            map.addLayer({
                id: 'signal-radius',
                type: 'fill',
                source: 'signal-radius',
                paint: {
                    'fill-color': pulseConfig.color,
                    'fill-opacity': pulseConfig.opacity
                }
            });

            // Animation loop (play ONCE, then show static circle)
            function animatePulse(startTime: number) {
                if (!map) return;
                const now = performance.now();
                const elapsed = now - startTime;
                const t = Math.min(elapsed / pulseConfig.duration, 1);
                // Ease out for radius
                const easeOut = 1 - Math.pow(1 - t, 3);
                const currentRadius = pulseConfig.minRadius + (pulseConfig.maxRadius - pulseConfig.minRadius) * easeOut;
                const source = map.getSource('signal-radius') as mapboxgl.GeoJSONSource;
                if (source) {
                    source.setData((map as any).createGeoJSONCircle(coord, currentRadius));
                }
                if (t < 1) {
                    (map as any)._pulseFrame = requestAnimationFrame(() => animatePulse(startTime));
                } else {
                    // Animation done: show static circle at max radius
                    if (source) {
                        source.setData((map as any).createGeoJSONCircle(coord, pulseConfig.maxRadius));
                    }
                    map.setPaintProperty('signal-radius', 'fill-opacity', pulseConfig.opacity);
                    (map as any)._pulseFrame = null;
                }
            }
            (map as any)._pulseFrame = requestAnimationFrame(() => animatePulse(performance.now()));
        }
    };

    /**
     * Removes the signal circle from the map
     */
    const removeSignalCircle = (map: mapboxgl.Map) => {
        try {
            if (map.getLayer('signal-radius')) map.removeLayer('signal-radius');
            if (map.getSource('signal-radius')) map.removeSource('signal-radius');
        } catch (e) {
            // Ignore errors
        }
    };

    /**
     * Initialize map canvas for interactions
     */
    const initializeMapCanvas = (map: mapboxgl.Map) => {
        try {
            const canvas = map.getCanvas() as HTMLCanvasElement | null;
            if (canvas) {
                canvas.tabIndex = 0;
                canvas.style.touchAction = 'auto';
            }
        } catch (e) {
            // Ignore errors
        }
    };

    /**
     * Setup info bubble positioning
     */
    const setupInfoBubble = (map: mapboxgl.Map) => {
        try {
            const pt = map.project(distressCoord);
            setInfoBubble({ x: pt.x, y: pt.y });
        } catch (e) {
            // Ignore errors
        }

        map.on('move', () => {
            try {
                const pt = map.project(distressCoord);
                setInfoBubble({ x: pt.x, y: pt.y });
            } catch (e) {
                // Ignore errors
            }
        });
    };

    /**
     * Find community details for a signal
     */
    const findCommunityDetails = (deviceId: string) => {
        if (OwnCommunitySignal && deviceId === OwnCommunitySignal.properties.deviceId) {
            return OwnCommunitySignal.communityDetails;
        }
        const found = otherSignals.find(s => s.properties.deviceId === deviceId);
        return found?.communityDetails;
    };

    /**
     * Handle signal pin click
     */
    const handleSignalClick = (map: mapboxgl.Map, e: any) => {
        const f = e.features?.[0];
        const coord = (f?.geometry?.coordinates as [number, number]) || [e.lngLat.lng, e.lngLat.lat];
        const deviceId = f?.properties?.deviceId;

        // Find and display circle around clicked signal
        const signalData = deviceId === OwnCommunitySignal?.properties.deviceId 
            ? OwnCommunitySignal 
            : otherSignals.find(s => s.properties.deviceId === deviceId);
        
        if (signalData) {
            displayBeatingCircle(signalData);
        } else {
            // If not found in signals, create a signal object from the feature
            const createdSignal = {
                coordinates: coord,
                properties: f?.properties || {}
            };
            displayBeatingCircle(createdSignal);
        }

        flyToSignal(map, coord);
        
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
            altFocalPerson: props.altFocalPerson || undefined,
            alertType: props.alertType || undefined,
            contactNumber: props.contactNumber || undefined,
            timeSent: props.timeSent || undefined,
            communityDetails: findCommunityDetails(deviceId)
        });
    };

    /**
     * Setup all map interactions (clicks, hovers, popover updates)
     */
    const setupMapInteractions = (map: mapboxgl.Map) => {
        const signalLayers = ["signal-pins"];

        // Signal pin interactions
        signalLayers.forEach((layerId) => {
            map.on('click', layerId, (e) => handleSignalClick(map, e));
            map.on('click', layerId, () => setInfoBubbleVisible(false));
            map.on('mouseenter', layerId, () => (map.getCanvas().style.cursor = 'pointer'));
            map.on('mouseleave', layerId, () => (map.getCanvas().style.cursor = ''));
        });

        // Click on empty map area
        map.on('click', (e) => {
            const features = map.queryRenderedFeatures(e.point, { layers: signalLayers });
            if (features.length === 0 && sidebarOpenRef.current) {
                removeSignalCircle(map);
                setIsLiveReportOpen(false);
            }
        });

        // Keep popover anchored during map movement
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
                // Ignore errors
            }
        });
    };

    // Clean up: close sidebar when component unmounts
    useEffect(() => {
        return () => {
            setIsLiveReportOpen(false);
        };
    }, [setIsLiveReportOpen]);

    // Initialize map
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
            initializeMapCanvas(map);
            addCustomLayers(map, otherSignals, OwnCommunitySignal);
            setupInfoBubble(map);
            setupMapInteractions(map);
            
            setTimeout(() => {
                cinematicMapEntrance(map, distressCoord);
            }, 600);

            setMapLoaded(true);
        });

        return () => {
            mapRef.current = null;
            map.remove();
        };
    }, []);

    // Update map layers when signals change
    useEffect(() => {
        const map = mapRef.current;
        if (map && map.isStyleLoaded() && otherSignals.length > 0) {
            addCustomLayers(map, otherSignals, OwnCommunitySignal);
        }
    }, [otherSignals, OwnCommunitySignal]);

    /**
     * Handler for opening community info sheet from popover
     */
    const handleOpenCommunityInfo = () => {
        if (popover?.communityDetails) {
            setSelectedCommunityData(popover.communityDetails);
            setInfoSheetOpen(true);
        }
    };

    /**
     * Handler for closing popover
     */
    const handleClosePopover = () => {
        const map = mapRef.current;
        if (map) {
            removeSignalCircle(map);
        }
        setPopover(null);
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
                onClose={handleClosePopover}
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
                signals={OwnCommunitySignal ? [...otherSignals, OwnCommunitySignal] : otherSignals}
                onCardClick={(signal) => {
                    const map = mapRef.current;
                    if (!map) return;
                    
                    const coord = signal.coordinates;
                    
                    // Display beating circle around the selected signal
                    displayBeatingCircle(signal);
                    
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