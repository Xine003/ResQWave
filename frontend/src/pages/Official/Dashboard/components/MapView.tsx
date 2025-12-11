import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useCallback, useEffect, useRef, useState } from "react";
import useSignals from "../../Visualization/hooks/useSignals";
import { cinematicMapEntrance } from "../../Visualization/utils/flyingEffects";
import { addCustomLayers } from "../../Visualization/utils/mapHelpers";
import MapControls from "./MapControls";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export function MapView() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [, setMapLoaded] = useState(false);

  // Get signals from the centralized hook
  const signals = useSignals();
  const { otherSignals, ownCommunitySignal: OwnCommunitySignal, getDistressCoord } = signals;

  const distressCoord: [number, number] = getDistressCoord();

  /**
   * Helper function to re-render all layers (used when switching map styles)
   */
  const reRenderAllLayers = useCallback((map: mapboxgl.Map) => {
    // Re-add Caloocan boundary
    try {
      const caloocan175SourceId = "caloocan-175-boundary";
      const caloocan175LayerId = "caloocan-175-boundary-layer";
      const caloocan175StrokeLayerId = "caloocan-175-boundary-stroke";

      if (!map.getSource(caloocan175SourceId)) {
        map.addSource(caloocan175SourceId, {
          type: "vector",
          url: "mapbox://rodelll.aenwq122",
        });
      }

      if (!map.getLayer(caloocan175LayerId)) {
        map.addLayer({
          id: caloocan175LayerId,
          type: "fill",
          source: caloocan175SourceId,
          "source-layer": "175_boundary-cz8oek",
          paint: {
            "fill-color": "#0019bd",
            "fill-opacity": 0.05,
          },
        });
      }

      if (!map.getLayer(caloocan175StrokeLayerId)) {
        map.addLayer({
          id: caloocan175StrokeLayerId,
          type: "line",
          source: caloocan175SourceId,
          "source-layer": "175_boundary-cz8oek",
          paint: {
            "line-color": "#0019bd",
            "line-width": 3,
            "line-opacity": 0.4,
          },
        });
      }
    } catch (e) {
      console.warn("[MapView] could not re-add 175 Caloocan boundary", e);
    }

    // Re-add neighborhood boundaries
    const allSignals = [
      ...otherSignals,
      ...(OwnCommunitySignal ? [OwnCommunitySignal] : []),
    ];

    allSignals.forEach((signal, index) => {
      if (signal.boundary && signal.boundary.length > 0) {
        const boundarySourceId = `neighborhood-boundary-${signal.properties.deviceId || index}`;
        const boundaryLayerId = `neighborhood-boundary-layer-${signal.properties.deviceId || index}`;
        const boundaryStrokeLayerId = `neighborhood-boundary-stroke-${signal.properties.deviceId || index}`;

        try {
          if (!map.getSource(boundarySourceId)) {
            map.addSource(boundarySourceId, {
              type: "geojson",
              data: {
                type: "Feature",
                properties: {},
                geometry: {
                  type: "Polygon",
                  coordinates: [signal.boundary],
                },
              },
            });
          }

          if (!map.getLayer(boundaryLayerId)) {
            map.addLayer({
              id: boundaryLayerId,
              type: "fill",
              source: boundarySourceId,
              paint: {
                "fill-color": "#3b82f6",
                "fill-opacity": 0.1,
              },
            });
          }

          if (!map.getLayer(boundaryStrokeLayerId)) {
            map.addLayer({
              id: boundaryStrokeLayerId,
              type: "line",
              source: boundarySourceId,
              paint: {
                "line-color": "#3b82f6",
                "line-width": 2,
                "line-opacity": 0.6,
              },
            });
          }
        } catch (e) {
          console.warn("[MapView] could not re-add neighborhood boundary", e);
        }
      }
    });

    // Re-add signal pins
    addCustomLayers(map, otherSignals, OwnCommunitySignal);
  }, [otherSignals, OwnCommunitySignal]);

  /**
   * Initialize map canvas for interactions
   */
  const initializeMapCanvas = (map: mapboxgl.Map) => {
    try {
      const canvas = map.getCanvas() as HTMLCanvasElement | null;
      if (canvas) {
        canvas.tabIndex = 0;
        canvas.style.touchAction = "auto";
      }
    } catch {
      // Ignore errors
    }
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current as HTMLElement,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [121.04040046802031, 14.7721611560019],
      zoom: 12,
      pitch: 75,
      bearing: 0,
      antialias: true,
    });

    mapRef.current = map;

    map.on("load", () => {
      initializeMapCanvas(map);

      // Add Caloocan boundary layer (bottom layer)
      try {
        const caloocan175SourceId = "caloocan-175-boundary";
        const caloocan175LayerId = "caloocan-175-boundary-layer";
        const caloocan175StrokeLayerId = "caloocan-175-boundary-stroke";

        // Add vector tile source for 175 Caloocan boundary
        if (!map.getSource(caloocan175SourceId)) {
          map.addSource(caloocan175SourceId, {
            type: "vector",
            url: "mapbox://rodelll.aenwq122",
          });
        }

        // Add fill layer for 175 Caloocan boundary
        if (!map.getLayer(caloocan175LayerId)) {
          map.addLayer({
            id: caloocan175LayerId,
            type: "fill",
            source: caloocan175SourceId,
            "source-layer": "175_boundary-cz8oek",
            paint: {
              "fill-color": "#0019bd",
              "fill-opacity": 0.05,
            },
          });
        }

        // Add stroke layer for 175 Caloocan boundary
        if (!map.getLayer(caloocan175StrokeLayerId)) {
          map.addLayer({
            id: caloocan175StrokeLayerId,
            type: "line",
            source: caloocan175SourceId,
            "source-layer": "175_boundary-cz8oek",
            paint: {
              "line-color": "#0019bd",
              "line-width": 3,
              "line-opacity": 0.4,
            },
          });
        }
      } catch (e) {
        console.warn("[MapView] could not add 175 Caloocan boundary", e);
      }

      setTimeout(() => {
        cinematicMapEntrance(map, distressCoord);
      }, 600);

      setMapLoaded(true);
    });

    return () => {
      mapRef.current = null;
      map.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update map layers when signals change
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const allSignals = [
      ...otherSignals,
      ...(OwnCommunitySignal ? [OwnCommunitySignal] : []),
    ];

    // Add/update signal pins
    addCustomLayers(map, otherSignals, OwnCommunitySignal);

    // Add/update neighborhood boundaries
    try {
      allSignals.forEach((signal, index) => {
        if (signal.boundary && signal.boundary.length > 0) {
          const boundarySourceId = `neighborhood-boundary-${signal.properties.deviceId || index}`;
          const boundaryLayerId = `neighborhood-boundary-layer-${signal.properties.deviceId || index}`;
          const boundaryStrokeLayerId = `neighborhood-boundary-stroke-${signal.properties.deviceId || index}`;

          // Add or update boundary source
          if (!map.getSource(boundarySourceId)) {
            map.addSource(boundarySourceId, {
              type: "geojson",
              data: {
                type: "Feature",
                properties: {},
                geometry: {
                  type: "Polygon",
                  coordinates: [signal.boundary],
                },
              },
            });

            // Add fill layer
            if (!map.getLayer(boundaryLayerId)) {
              map.addLayer({
                id: boundaryLayerId,
                type: "fill",
                source: boundarySourceId,
                paint: {
                  "fill-color": "#3b82f6",
                  "fill-opacity": 0.1,
                },
              });
            }

            // Add stroke layer
            if (!map.getLayer(boundaryStrokeLayerId)) {
              map.addLayer({
                id: boundaryStrokeLayerId,
                type: "line",
                source: boundarySourceId,
                paint: {
                  "line-color": "#3b82f6",
                  "line-width": 2,
                  "line-opacity": 0.6,
                },
              });
            }
          } else {
            // Update existing source
            const source = map.getSource(boundarySourceId) as mapboxgl.GeoJSONSource;
            source.setData({
              type: "Feature",
              properties: {},
              geometry: {
                type: "Polygon",
                coordinates: [signal.boundary],
              },
            });
          }
        }
      });
    } catch (e) {
      console.warn("[MapView] could not update neighborhood boundaries", e);
    }
  }, [otherSignals, OwnCommunitySignal]);

  return (
    <div className="w-full h-full bg-[#171717] relative overflow-hidden">
      {/* Map Container */}
      <div
        ref={mapContainer}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1,
        }}
      />

      {/* Map Controls */}
      <MapControls
        mapRef={mapRef}
        addCustomLayers={reRenderAllLayers}
      />
    </div>
  );
}
