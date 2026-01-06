import mapboxgl from "mapbox-gl";
import { useEffect, useRef } from "react";

mapboxgl.accessToken = "pk.eyJ1Ijoicm9kZWxsbCIsImEiOiJjbWU0OXNvb2gwYnM0MnpvbXNueXo2dzhxIn0.Ep43_IxVhaPhEqWBaAuuyA";

export function LandingHero({ showSearch, setShowSearch }: { showSearch: boolean, setShowSearch: (show: boolean) => void }) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [121.056764, 14.756603],
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
    </main>
  );
}