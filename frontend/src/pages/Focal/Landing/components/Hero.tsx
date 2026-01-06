import mapboxgl from "mapbox-gl";
import { useEffect, useRef, useState } from "react";

mapboxgl.accessToken = "pk.eyJ1Ijoicm9kZWxsbCIsImEiOiJjbWU0OXNvb2gwYnM0MnpvbXNueXo2dzhxIn0.Ep43_IxVhaPhEqWBaAuuyA";

export function LandingHero({ showSearch, setShowSearch }: { showSearch: boolean, setShowSearch: (show: boolean) => void }) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [hoveredPin, setHoveredPin] = useState<{ color: string; coords: [number, number] } | null>(null);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [121.05372821089554, 14.75625635522509],
      zoom: 10,
      pitch: 0,
      bearing: 0,
      antialias: true,
    });
    mapRef.current = map;

    map.dragRotate.enable();
    if (map.touchZoomRotate && 'enableRotation' in map.touchZoomRotate && typeof map.touchZoomRotate.enableRotation === 'function') {
      map.touchZoomRotate.enableRotation();
    }

    map.on("load", () => {
      const cinematicEasing = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      // Helper function to create a circle polygon
      const createCircle = (center: [number, number], radiusInMeters: number, points = 64) => {
        const coords: [number, number][] = [];
        const earthRadius = 6378137;
        const lat = (center[1] * Math.PI) / 180;
        const lon = (center[0] * Math.PI) / 180;
        for (let i = 0; i < points; i++) {
          const angle = (((i * 360) / points) * Math.PI) / 180;
          const dx = (Math.cos(angle) * radiusInMeters) / earthRadius;
          const dy = (Math.sin(angle) * radiusInMeters) / earthRadius;
          const latOffset = lat + dy;
          const lonOffset = lon + dx / Math.cos(lat);
          coords.push([(lonOffset * 180) / Math.PI, (latOffset * 180) / Math.PI]);
        }
        coords.push(coords[0]);
        return {
          type: "Feature" as const,
          geometry: {
            type: "Polygon" as const,
            coordinates: [coords],
          },
          properties: {},
        };
      };

      try {
        if (!map.getSource("floods-metro-manila")) {
          map.addSource("floods-metro-manila", {
            type: "vector",
            url: "mapbox://rodelll.3lm08j9b"
          });
        }

        if (!map.getLayer("flood-polygons-metro-manila")) {
          map.addLayer({
            id: "flood-polygons-metro-manila",
            type: "fill",
            source: "floods-metro-manila",
            "source-layer": "MetroManila_Flood",
            paint: {
              "fill-color": [
                "match",
                ["get", "Var"],
                1, "#ffff00",
                2, "#ff9900",
                3, "#ff0000",
                "#000000"
              ],
              "fill-opacity": 0.5
            }
          }, "waterway-label");
        }
      } catch (e) {
        console.warn("Could not add flood polygons", e);
      }

      // Add static pins with circles
      try {
        // Pin coordinates and colors
        const pins = [
          { 
            coords: [121.05506938449884, 14.751882964225857] as [number, number], 
            color: "#ef4444", // Red
            id: "red"
          },
          { 
            coords: [121.05544250933724, 14.757527125034343]as [number, number], 
            color: "#eab308", // Yellow
            id: "yellow"
          },
          { 
            coords: [121.0596652039547, 14.752071361725228] as [number, number], 
            color: "#3b82f6", // Blue
            id: "blue"
          },
        ];

        // Add circles for each pin (excluding blue pin)
        pins.forEach((pin) => {
          // Skip blue pin - no circle
          if (pin.id === "blue") return;
          
          const circleSourceId = `pin-circle-${pin.id}`;
          const circleLayerId = `pin-circle-layer-${pin.id}`;

          if (!map.getSource(circleSourceId)) {
            map.addSource(circleSourceId, {
              type: "geojson",
              data: createCircle(pin.coords, 150) // 150 meter radius
            });
          }

          if (!map.getLayer(circleLayerId)) {
            map.addLayer({
              id: circleLayerId,
              type: "fill",
              source: circleSourceId,
              paint: {
                "fill-color": pin.color,
                "fill-opacity": 0.3,
              },
            });
          }
        });

        // Add second circle for red pin (outer circle)
        const redPin = pins.find(pin => pin.id === "red");
        if (redPin) {
          const circleSourceId2 = `pin-circle-${redPin.id}-outer`;
          const circleLayerId2 = `pin-circle-layer-${redPin.id}-outer`;

          if (!map.getSource(circleSourceId2)) {
            map.addSource(circleSourceId2, {
              type: "geojson",
              data: createCircle(redPin.coords, 200) // 200 meter radius for outer circle
            });
          }

          if (!map.getLayer(circleLayerId2)) {
            map.addLayer({
              id: circleLayerId2,
              type: "fill",
              source: circleSourceId2,
              paint: {
                "fill-color": redPin.color,
                "fill-opacity": 0.2, // Slightly more transparent
              },
            });
          }
        }

        // Animate red pin circles with pulsing effect
        if (redPin) {
          // Inner circle animation
          let minRadius1 = 120;
          let maxRadius1 = 180;
          let growing1 = true;
          let currentRadius1 = minRadius1;

          function animateRedCircle1() {
            if (growing1) {
              currentRadius1 += 0.8;
              if (currentRadius1 >= maxRadius1) {
                growing1 = false;
              }
            } else {
              currentRadius1 -= 0.8;
              if (currentRadius1 <= minRadius1) {
                growing1 = true;
              }
            }

            const source = map.getSource(`pin-circle-${redPin.id}`) as mapboxgl.GeoJSONSource;
            if (source) {
              source.setData(createCircle(redPin.coords, currentRadius1));
            }

            requestAnimationFrame(animateRedCircle1);
          }

          // Outer circle animation (different interval)
          let minRadius2 = 180;
          let maxRadius2 = 240;
          let growing2 = false; // Start opposite to inner circle
          let currentRadius2 = maxRadius2;

          function animateRedCircle2() {
            if (growing2) {
              currentRadius2 += 1.0; // Slightly different speed
              if (currentRadius2 >= maxRadius2) {
                growing2 = false;
              }
            } else {
              currentRadius2 -= 1.0;
              if (currentRadius2 <= minRadius2) {
                growing2 = true;
              }
            }

            const source = map.getSource(`pin-circle-${redPin.id}-outer`) as mapboxgl.GeoJSONSource;
            if (source) {
              source.setData(createCircle(redPin.coords, currentRadius2));
            }

            requestAnimationFrame(animateRedCircle2);
          }

          // Start animations after delays
          setTimeout(() => animateRedCircle1(), 1000);
          setTimeout(() => animateRedCircle2(), 1000);
        }


        // Add pins source
        if (!map.getSource("static-pins")) {
          map.addSource("static-pins", {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features: pins.map((pin) => ({
                type: "Feature" as const,
                properties: { color: pin.color, id: pin.id },
                geometry: { 
                  type: "Point" as const, 
                  coordinates: pin.coords 
                },
              })),
            },
          });
        }

        // Add pins layer
        if (!map.getLayer("static-pins-layer")) {
          map.addLayer({
            id: "static-pins-layer",
            type: "circle",
            source: "static-pins",
            paint: {
              "circle-color": ["get", "color"],
              "circle-radius": 12,
              "circle-opacity": 1,
              "circle-stroke-width": 0,
            },
          });
        }

        // Add hover interaction for pins
        map.on("mouseenter", "static-pins-layer", (e) => {
          map.getCanvas().style.cursor = "pointer";
          
          if (e.features && e.features.length > 0) {
            const feature = e.features[0];
            const geom = feature.geometry as GeoJSON.Point;
            const coords = geom.coordinates as [number, number];
            const color = feature.properties?.color;
            
            setHoveredPin({
              color: color,
              coords: coords,
            });
          }
        });

        map.on("mouseleave", "static-pins-layer", () => {
          map.getCanvas().style.cursor = "";
          setHoveredPin(null);
        });
      } catch (e) {
        console.warn("Could not add static pins", e);
      }

      map.flyTo({
        center: [121.056764, 14.756603],
        zoom: 15,
        pitch: 55,
        bearing: -17.6,
        duration: 4500,
        curve: 1.8,
        speed: 0.8,
        easing: cinematicEasing,
        essential: true,
      });
    });

    return () => {
      try {
        map.remove();
      } catch { }
      mapRef.current = null;
    };
  }, []);

  return (
    <main className="flex flex-1 flex-col md:flex-row items-center justify-center md:justify-between px-4 md:px-8 lg:px-12 xl:px-16 gap-8 w-full relative" style={{ overflow: 'hidden', zIndex: 20, position: 'relative', height: '100vh', minHeight: '100vh' }}>
      <div className="w-full md:w-auto flex flex-col justify-center gap-4 items-center md:items-start max-w-2xl" style={{ flex: '1 1 auto', transition: 'all 0.4s ease-in-out' }}>
        <style>{`
          .hero-content {
            transition: all 0.4s ease-in-out;
            text-align: center;
            width: 100%;
          }
          
          @media (min-width: 768px) {
            .hero-content {
              margin-top: -80px;
              margin-left: 60px;
              text-align: left;
            }
          }
          
          @media (min-width: 768px) and (max-width: 1279px) {
            .hero-content {
              margin-left: 20px;
              margin-right: 20px;
              max-width: 500px;
            }
          }
        `}</style>
        <div className="hero-content w-full">
          <h1
            className="text-[28px] sm:text-[36px] md:text-[44px] lg:text-[54px] font-bold mb-4 md:mb-6 leading-tight"
            style={{
              background: "linear-gradient(180deg, #FFFFFF 0%, #BFBFBF 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              color: "transparent"
            }}
          >
            Stronger Signals,<br />Safer Communities
          </h1>
          <p className="mb-6 md:mb-8 text-[14px] sm:text-[16px] md:text-[18px] text-gray-300 leading-relaxed">
            A simple, reliable terminal powered by LoRa—helping <br />
            <span style={{ display: 'inline-block', height: '1.5em' }}></span>
            communities send SOS alerts, share updates, and guide rescuers<br />
            <span style={{ display: 'inline-block', height: '1.5em' }}></span>
            when flooding strikes.
          </p>
        </div>
      </div>

      <style>{`
        .hero-map {
          width: 100%;
          max-width: 700px;
          height: 400px;
          position: relative;
          z-index: 1;
          border-radius: 32px;
          border: 8px solid #292929;
          box-shadow: 0 0 0 1px #222;
          margin: 20px auto 0;
          transition: all 0.4s ease-in-out;
        }
        
        @media (min-width: 1280px) {
          .hero-map {
            width: 100%;
            max-width: 700px;
            height: 563px;
            position: absolute;
            right: 0;
            top: 50%;
            transform: translateY(calc(-50% - 60px));
            border-radius: 0;
            border-top-left-radius: 53px;
            border-bottom-left-radius: 53px;
            border-top-right-radius: 0;
            border-bottom-right-radius: 0;
            border-right: none;
            border-left: 11px solid #292929;
            border-top: 11px solid #292929;
            border-bottom: 11px solid #292929;
            margin: 0;
          }
        }
      `}</style>
      
      <div className="overflow-hidden hero-map" ref={mapContainer}></div>

      {/* Pin Hover Popover */}
      {hoveredPin && mapRef.current && (() => {
        const map = mapRef.current;
        const pt = map.project(hoveredPin.coords);
        const rect = mapContainer.current?.getBoundingClientRect();
        const popoverWidth = 280;
        const popoverHeight = 80;
        
        // Calculate position relative to the map container
        const left = (rect?.left ?? 0) + pt.x;
        const top = (rect?.top ?? 0) + pt.y;
        
        return (
          <div
            style={{
              position: "absolute",
              left: left,
              top: top,
              transform: `translate(-46%, calc(-100% - 100px))`,
              zIndex: 1000,
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                position: "relative",
                backgroundColor: "rgba(0, 0, 0, 0.85)",
                color: "#fff",
                padding: "10px 14px",
                borderRadius: "6px",
                fontSize: "13px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                maxWidth: "280px",
                lineHeight: "1.4",
              }}
            >
              {hoveredPin.color === "#ef4444" && (
                <>
                  <div style={{ fontWeight: "600", marginBottom: "4px", color: "#ef4444" }}>Critical Alert</div>
                  <div>The LoRa terminal detects the flood water is high.</div>
                </>
              )}
              {hoveredPin.color === "#eab308" && (
                <>
                  <div style={{ fontWeight: "600", marginBottom: "4px", color: "#eab308" }}>User-Initiated</div>
                  <div>The user clicked the distress signal of LoRa terminal calling for rescue.</div>
                </>
              )}
              {hoveredPin.color === "#3b82f6" && (
                <>
                  <div style={{ fontWeight: "600", marginBottom: "4px", color: "#3b82f6" }}>Normal</div>
                  <div>No distress signal detected.</div>
                </>
              )}
              
              {/* Downward arrow pointer */}
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  transform: "translateX(-50%)",
                  bottom: "-18px",
                  width: 0,
                  height: 0,
                  borderLeft: "15px solid transparent",
                  borderRight: "15px solid transparent",
                  borderTop: "18px solid rgba(0, 0, 0, 0.85)",
                }}
              />
            </div>
          </div>
        );
      })()}
    </main>
  );
}