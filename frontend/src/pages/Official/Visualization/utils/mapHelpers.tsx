import type React from 'react';

export function addCustomLayers(map: mapboxgl.Map, otherSignals: any[], OwnCommunitySignal: any) {
    // Helper function to get pin color based on alert type
    const getPinColor = (alertType: string) => {
        switch (alertType?.toLowerCase()) {
            case 'critical':
                return '#ef4444'; // Red
            case 'user-initiated':
                return '#eab308'; // Yellow
            case 'online':
                return '#22c55e'; // Green
            case 'offline':
                return '#6b7280'; // Gray
            default:
                return '#6b7280'; // Default gray
        }
    };

    // Combine all signals for a single source
    const allSignals = [
        ...otherSignals.map(s => ({
            ...s,
            properties: {
                ...s.properties,
                alertType: s.properties.alertType || s.properties.status || 'offline'
            }
        })),
        {
            ...OwnCommunitySignal,
            properties: {
                ...OwnCommunitySignal.properties,
                alertType: OwnCommunitySignal.properties.alertType || OwnCommunitySignal.properties.status || 'online'
            }
        }
    ];

    // Create unified signals source
    if (!map.getSource("all-signals")) {
        map.addSource("all-signals", {
            type: "geojson",
            data: {
                type: "FeatureCollection",
                features: allSignals.map((s) => ({
                    type: "Feature",
                    properties: s.properties,
                    geometry: { type: "Point", coordinates: s.coordinates }
                }))
            }
        });
    } else {
        // update data if source exists
        const s = map.getSource("all-signals") as mapboxgl.GeoJSONSource;
        s.setData({ 
            type: "FeatureCollection", 
            features: allSignals.map((s2) => ({ 
                type: "Feature", 
                properties: s2.properties, 
                geometry: { type: "Point", coordinates: s2.coordinates } 
            })) 
        });
    }

    // Add dynamic colored circles based on alert type
    if (!map.getLayer("signal-pins")) {
        map.addLayer({
            id: "signal-pins",
            type: "circle",
            source: "all-signals",
            paint: {
                "circle-color": [
                    "case",
                    ["==", ["get", "alertType"], "CRITICAL"], "#ef4444",
                    ["==", ["get", "alertType"], "USER-INITIATED"], "#eab308", 
                    ["==", ["get", "alertType"], "ONLINE"], "#22c55e",
                    ["==", ["get", "alertType"], "OFFLINE"], "#6b7280",
                    "#6b7280" // default gray
                ],
                "circle-radius": 12,
                "circle-opacity": 1,
                "circle-stroke-color": "#fff",
                "circle-stroke-width": 2
            }
        });
    }

    // Remove old layers if they exist
    if (map.getLayer("offline-core")) map.removeLayer("offline-core");
    if (map.getLayer("distress-core")) map.removeLayer("distress-core");
    if (map.getSource("offline-signals")) map.removeSource("offline-signals");
    if (map.getSource("distress-signal")) map.removeSource("distress-signal");
}

export const makeTooltip = (text: string): React.ReactElement => (
    <div style={{ position: 'relative', left: '-7px' }}>
        <div style={{ background: 'rgba(0,0,0,0.60)', color: '#fff', padding: '8px 10px', borderRadius: 6, fontSize: 13, boxShadow: '0 8px 20px rgba(2,6,23,0.18)' }}>{text}</div>
        {/* subtle shadow triangle behind the arrow */}
        <div style={{ position: 'absolute', right: -9, top: '50%', transform: 'translateY(-50%)', width: 0, height: 0, borderTop: '7px solid transparent', borderBottom: '7px solid transparent', borderLeft: '7px solid rgba(75,85,99,0.18)', filter: 'blur(0.2px)' }} />
        {/* main arrow pointing to the control */}
        <div style={{ position: 'absolute', right: -6, top: '50%', transform: 'translateY(-50%)', width: 0, height: 0, borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderLeft: '6px solid rgba(75,85,99,0.72)' }} />
    </div>
);