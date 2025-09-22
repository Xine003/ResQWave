import React, { useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import Header from "./components/Header";

mapboxgl.accessToken = "pk.eyJ1Ijoicm9kZWxsbCIsImEiOiJjbWU0OXNvb2gwYnM0MnpvbXNueXo2dzhxIn0.Ep43_IxVhaPhEqWBaAuuyA";

export default function Dashboard() {
    const mapContainer = useRef(null);

    useEffect(() => {
        if (!mapContainer.current) return;
        const map = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [121.04040046802031, 14.7721611560019],
            zoom: 12,
            pitch: 75,
            bearing: 0,
            antialias: true,
        });

        map.on("load", () => {
            // Add offline distress signals
            const offlineCoords = [
                [121.03197820799186, 14.772888009898285],
                [121.04440528679821, 14.776897515717772],
                [121.039008311252, 14.768014818600191]
            ];
            map.addSource("offline-signals", {
                type: "geojson",
                data: {
                    type: "FeatureCollection",
                    features: offlineCoords.map((coord) => ({
                        type: "Feature",
                        properties: { status: "offline" },
                        geometry: {
                            type: "Point",
                            coordinates: coord,
                        },
                    })),
                },
            });
            // Animated concentric rings for offline signals
            const offlineRingPaint = (opacity: number) => ({
                "circle-color": "#6b7280",
                "circle-opacity": opacity,
            });
            map.addLayer({
                id: "offline-ring-3",
                type: "circle",
                source: "offline-signals",
                paint: { ...offlineRingPaint(0.12), "circle-radius": 34 },
            });
            map.addLayer({
                id: "offline-ring-2",
                type: "circle",
                source: "offline-signals",
                paint: { ...offlineRingPaint(0.18), "circle-radius": 24 },
            });
            map.addLayer({
                id: "offline-ring-1",
                type: "circle",
                source: "offline-signals",
                paint: { ...offlineRingPaint(0.26), "circle-radius": 16 },
            });
            // White ring for definition
            map.addLayer({
                id: "offline-core-stroke",
                type: "circle",
                source: "offline-signals",
                paint: {
                    "circle-color": "#ffffff",
                    "circle-radius": 12,
                    "circle-opacity": 1,
                },
            });
            // Core dot
            map.addLayer({
                id: "offline-core",
                type: "circle",
                source: "offline-signals",
                paint: {
                    "circle-color": "#6b7280",
                    "circle-radius": 10,
                    "circle-opacity": 1,
                    "circle-blur": 0,
                },
            });
            // Animate rings
            let rafOffline = 0;
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
                map.setPaintProperty("offline-ring-1", "circle-radius", r1);
                map.setPaintProperty("offline-ring-2", "circle-radius", r2);
                map.setPaintProperty("offline-ring-3", "circle-radius", r3);
                map.setPaintProperty("offline-ring-1", "circle-opacity", o1);
                map.setPaintProperty("offline-ring-2", "circle-opacity", o2);
                map.setPaintProperty("offline-ring-3", "circle-opacity", o3);
                rafOffline = requestAnimationFrame(tickOffline);
            };
            rafOffline = requestAnimationFrame(tickOffline);
            map.once('remove', () => cancelAnimationFrame(rafOffline));
            setTimeout(() => {
                map.flyTo({
                    center: [121.04040046802031, 14.7721611560019],
                    zoom: 16,
                    pitch: 35,
                    bearing: -17.6,
                    duration: 4000,
                    curve: 1.8,
                    speed: 0.8,
                    essential: true,
                });
            }, 600);

            // Add online distress signal marker with pulsing animation
            map.addSource("distress-signal", {
                type: "geojson",
                data: {
                    type: "FeatureCollection",
                    features: [
                        {
                            type: "Feature",
                            properties: { status: "online" },
                            geometry: {
                                type: "Point",
                                coordinates: [121.04040046802031, 14.7721611560019],
                            },
                        },
                    ],
                },
            });
            // Animated concentric rings
            const ringPaint = (opacity: number) => ({
                "circle-color": "#22c55e",
                "circle-opacity": opacity,
            });
            map.addLayer({
                id: "distress-ring-3",
                type: "circle",
                source: "distress-signal",
                paint: { ...ringPaint(0.12), "circle-radius": 34 }
            },
            );
            map.addLayer({
                id: "distress-ring-2",
                type: "circle",
                source: "distress-signal",
                paint: { ...ringPaint(0.18), "circle-radius": 24 }
            },
            );
            map.addLayer({
                id: "distress-ring-1",
                type: "circle",
                source: "distress-signal",
                paint: { ...ringPaint(0.26), "circle-radius": 16 }
            },
            );
            // White ring for definition
            map.addLayer({
                id: "distress-core-stroke",
                type: "circle",
                source: "distress-signal",
                paint: {
                    "circle-color": "#ffffff",
                    "circle-radius": 12,
                    "circle-opacity": 1,
                },
            });
            // Core dot
            map.addLayer({
                id: "distress-core",
                type: "circle",
                source: "distress-signal",
                paint: {
                    "circle-color": "#22c55e",
                    "circle-radius": 10,
                    "circle-opacity": 1,
                    "circle-blur": 0,
                },
            });
            // Animate rings
            let raf = 0;
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
                map.setPaintProperty("distress-ring-1", "circle-radius", r1);
                map.setPaintProperty("distress-ring-2", "circle-radius", r2);
                map.setPaintProperty("distress-ring-3", "circle-radius", r3);
                map.setPaintProperty("distress-ring-1", "circle-opacity", o1);
                map.setPaintProperty("distress-ring-2", "circle-opacity", o2);
                map.setPaintProperty("distress-ring-3", "circle-opacity", o3);
                raf = requestAnimationFrame(tick);
            };
            raf = requestAnimationFrame(tick);
            map.once('remove', () => cancelAnimationFrame(raf));
        });

        return () => map.remove();
    }, []);

    return (
        <div style={{ minHeight: "100vh", width: "100vw", position: "relative", background: "#222" }}>
            <Header />
            <div ref={mapContainer} style={{ position: "absolute", top: 75, left: 0, right: 0, bottom: 0, width: "100vw", height: "calc(100vh - 75px)", zIndex: 1 }} />
        </div>
    );
}
