import { useEffect } from "react";
import type { MapPinData } from "../api/adminDashboardApi";

interface MapPinsProps {
  map: mapboxgl.Map | null;
  pins: MapPinData[];
  mapContainer: React.RefObject<HTMLDivElement>;
  onPinClick: (popoverData: {
    lng: number;
    lat: number;
    screen: { x: number; y: number };
    terminalID: string;
    terminalName: string;
    terminalStatus: string;
    timeSent: string;
    focalPerson: string;
    contactNumber: string;
    totalAlerts: number;
  }) => void;
}

/**
 * Helper to parse coordinates from address JSON
 */
function parseCoordinates(address: any): [number, number] | null {
  try {
    let addressObj = address;

    // If address is a string, try to parse it
    if (typeof addressObj === "string") {
      addressObj = JSON.parse(addressObj);
    }

    // Format 1: Direct lat/lng or latitude/longitude properties
    if (addressObj.lng && addressObj.lat) {
      return [addressObj.lng, addressObj.lat];
    }
    if (addressObj.longitude && addressObj.latitude) {
      return [addressObj.longitude, addressObj.latitude];
    }

    // Format 2: Coordinates as a STRING "lng, lat" (backend format)
    if (addressObj.coordinates && typeof addressObj.coordinates === "string") {
      const coords = addressObj.coordinates.split(",").map((s: string) => parseFloat(s.trim()));
      if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
        return [coords[0], coords[1]]; // [lng, lat]
      }
    }

    // Format 3: Nested coordinates object
    if (addressObj.coordinates && typeof addressObj.coordinates === "object") {
      if (addressObj.coordinates.longitude && addressObj.coordinates.latitude) {
        return [addressObj.coordinates.longitude, addressObj.coordinates.latitude];
      }
      if (addressObj.coordinates.lng && addressObj.coordinates.lat) {
        return [addressObj.coordinates.lng, addressObj.coordinates.lat];
      }
    }
  } catch (e) {
    // Silent error handling
  }
  return null;
}

/**
 * Component to render pins on the Mapbox map
 * Uses GeoJSON layers like the Visualization page for better performance
 */
export function MapPins({ map, pins, mapContainer, onPinClick }: MapPinsProps) {
  useEffect(() => {
    if (!map) return;

    // Event handlers defined at effect scope
    const handleClick = (e: mapboxgl.MapMouseEvent) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ["admin-pins-layer"],
      });

      if (features.length > 0) {
        const feature = features[0];
        const props = feature.properties;
        const coords = (feature.geometry as GeoJSON.Point).coordinates as [number, number];

        // Format time
        const timeSent = props?.latestAlertTime 
          ? new Date(props.latestAlertTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true })
          : "N/A";

        // Get screen coordinates (like Visualization does)
        const pt = map.project(coords);
        const rect = mapContainer.current?.getBoundingClientRect();
        const absX = (rect?.left ?? 0) + pt.x;
        const absY = (rect?.top ?? 0) + pt.y;

        // Call the callback with popover data
        onPinClick({
          lng: coords[0],
          lat: coords[1],
          screen: { x: absX, y: absY },
          terminalID: props?.terminalID || "N/A",
          terminalName: props?.terminalName || "N/A",
          terminalStatus: props?.terminalStatus || "N/A",
          timeSent,
          focalPerson: props?.focalPerson || "N/A",
          contactNumber: props?.contactNumber || "N/A",
          totalAlerts: props?.totalAlerts || 0,
        });
      }
    };

    const handleMouseEnter = () => {
      if (map && map.getCanvas) {
        map.getCanvas().style.cursor = "pointer";
      }
    };

    const handleMouseLeave = () => {
      if (map && map.getCanvas) {
        map.getCanvas().style.cursor = "";
      }
    };

    // Function to render pins
    const renderPins = () => {
    // Parse pins to extract valid coordinates
    const validPins = pins
      .map((pin) => {
        const coordinates = parseCoordinates(pin.address);
        
        if (!coordinates) {
          return null;
        }

        // Determine alert type based on terminal status and recent alerts
        const hasRecentAlert = pin.latestAlertTime
          ? new Date().getTime() - new Date(pin.latestAlertTime).getTime() < 3600000 // 1 hour
          : false;

        let alertType = "OFFLINE";
        if (pin.terminalStatus === "Online") {
          if (hasRecentAlert) {
            alertType = "CRITICAL";
          } else if (pin.totalAlerts > 0) {
            alertType = "USER-INITIATED";
          } else {
            alertType = "ONLINE";
          }
        }

        return {
          ...pin,
          coordinates,
          alertType,
        };
      })
      .filter((pin): pin is NonNullable<typeof pin> => pin !== null);

    // Create GeoJSON features for all pins
    const features = validPins.map((pin) => ({
      type: "Feature" as const,
      properties: {
        terminalID: pin.terminalID,
        terminalName: pin.terminalName,
        terminalStatus: pin.terminalStatus,
        focalPerson: pin.focalPerson || "N/A",
        contactNumber: pin.contactNumber || "N/A",
        totalAlerts: pin.totalAlerts,
        latestAlertTime: pin.latestAlertTime || "",
        alertType: pin.alertType,
      },
      geometry: {
        type: "Point" as const,
        coordinates: pin.coordinates,
      },
    }));

    // Add or update the pins source
    const sourceExists = map.getSource("admin-pins");
    
    if (!sourceExists) {
      map.addSource("admin-pins", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features,
        },
      });
      
      // Add layers only when source is first created
      // Add pulse layer for critical pins (similar to Visualization)
      map.addLayer({
        id: "admin-pins-pulse",
        type: "circle",
        source: "admin-pins",
        filter: ["==", ["get", "alertType"], "CRITICAL"],
        paint: {
          "circle-color": "#ef4444",
          "circle-radius": 13,
          "circle-opacity": 0.4,
          "circle-stroke-width": 0,
        },
      });

      // Add main pin layer with dynamic colors (this will be on top)
      map.addLayer({
        id: "admin-pins-layer",
        type: "circle",
        source: "admin-pins",
        paint: {
          "circle-color": [
            "case",
            ["==", ["get", "alertType"], "CRITICAL"],
            "#ef4444", // Red for critical
            ["==", ["get", "alertType"], "USER-INITIATED"],
            "#eab308", // Yellow for user-initiated
            ["==", ["get", "alertType"], "ONLINE"],
            "#22c55e", // Green for online
            ["==", ["get", "alertType"], "OFFLINE"],
            "#6b7280", // Gray for offline
            "#6b7280", // Default gray
          ],
          "circle-radius": 12,
          "circle-opacity": 1,
          "circle-stroke-color": "#fff",
          "circle-stroke-width": 2,
        },
      });

      // Add event listeners for newly created layers
      map.on("click", "admin-pins-layer", handleClick);
      map.on("mouseenter", "admin-pins-layer", handleMouseEnter);
      map.on("mouseleave", "admin-pins-layer", handleMouseLeave);
    } else {
      // Source exists, just update the data
      const source = map.getSource("admin-pins") as mapboxgl.GeoJSONSource;
      source.setData({
        type: "FeatureCollection",
        features,
      });
    }
    };

    // Wait for style to load before rendering
    if (map.isStyleLoaded()) {
      renderPins();
    } else {
      map.once("styledata", () => {
        renderPins();
      });
    }

    // Cleanup
    return () => {
      // Check if map still exists and has the necessary methods
      if (!map || typeof map.getLayer !== 'function') return;
      
      try {
        // Remove event listeners
        map.off("click", "admin-pins-layer", handleClick);
        map.off("mouseenter", "admin-pins-layer", handleMouseEnter);
        map.off("mouseleave", "admin-pins-layer", handleMouseLeave);
        
        // Remove layers and source
        if (map.getLayer("admin-pins-layer")) {
          map.removeLayer("admin-pins-layer");
        }
        if (map.getLayer("admin-pins-pulse")) {
          map.removeLayer("admin-pins-pulse");
        }
        if (map.getSource("admin-pins")) {
          map.removeSource("admin-pins");
        }
      } catch (e) {
        // Silent error handling
      }
    };
  }, [map, pins, mapContainer, onPinClick]);

  return null;
}
