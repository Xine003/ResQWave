import type React from 'react';
import type mapboxgl from "mapbox-gl";

export function addCustomLayers(map: mapboxgl.Map, otherSignals: any[], OwnCommunitySignal: any) {
    // Helper to create a GeoJSON circle polygon from center and radius (meters)
    function createGeoJSONCircle(center: [number, number], radiusInMeters: number, points = 64): GeoJSON.Feature<GeoJSON.Polygon> {
        const coords: [number, number][] = [];
        const earthRadius = 6378137;
        const lat = center[1] * Math.PI / 180;
        const lon = center[0] * Math.PI / 180;
        for (let i = 0; i < points; i++) {
            const angle = (i * 360 / points) * Math.PI / 180;
            const dx = Math.cos(angle) * radiusInMeters / earthRadius;
            const dy = Math.sin(angle) * radiusInMeters / earthRadius;
            const latOffset = lat + dy;
            const lonOffset = lon + dx / Math.cos(lat);
            coords.push([
                lonOffset * 180 / Math.PI,
                latOffset * 180 / Math.PI
            ]);
        }
        coords.push(coords[0]); // close the polygon
        return {
            type: "Feature",
            geometry: {
                type: "Polygon",
                coordinates: [coords]
            },
            properties: {}
        };
    }

    // Only add signal dots (no radius overlays by default)
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
        const s = map.getSource("offline-signals") as mapboxgl.GeoJSONSource;
        s.setData({ type: "FeatureCollection", features: otherSignals.map((s2) => ({ type: "Feature", properties: s2.properties, geometry: { type: "Point", coordinates: s2.coordinates } })) });
    }

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

    // Expose helper for click handler
    (map as any).createGeoJSONCircle = createGeoJSONCircle;
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
