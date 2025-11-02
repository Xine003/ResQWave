import MapboxDraw from "@mapbox/mapbox-gl-draw";
import type { Map as MapboxMap } from "mapbox-gl";

export function createDraw(): MapboxDraw {
    return new MapboxDraw({
        displayControlsDefault: false,
        controls: {},
        styles: [
            // Polygon fill
            {
                id: 'gl-draw-polygon-fill',
                type: 'fill',
                filter: ['all', ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
                paint: {
                    'fill-color': '#2CBE00',
                    'fill-opacity': 0.1,
                },
            },
            // Polygon outline as dotted line
            {
                id: 'gl-draw-polygon-stroke',
                type: 'line',
                filter: ['all', ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
                layout: { 'line-cap': 'round', 'line-join': 'round' },
                paint: {
                    'line-color': '#2CBE00',
                    'line-width': 3,
                    'line-dasharray': [2, 4],
                },
            },
            // LineString (if drawing lines)
            {
                id: 'gl-draw-line',
                type: 'line',
                filter: ['all', ['==', '$type', 'LineString'], ['!=', 'mode', 'static']],
                layout: { 'line-cap': 'round', 'line-join': 'round' },
                paint: {
                    'line-color': '#2CBE00',
                    'line-width': 3,
                    'line-dasharray': [2, 4],
                },
            },
            // Vertices (main dots)
            {
                id: 'gl-draw-points',
                type: 'symbol',
                filter: ['all', ['==', '$type', 'Point'], ['!=', 'meta', 'midpoint']],
                layout: {
                    'icon-image': 'square-green',
                    'icon-size': 1.2,
                },
            },
            // Midpoints (editing points)
            {
                id: 'gl-draw-polygon-midpoint',
                type: 'circle',
                filter: ['all', ['==', '$type', 'Point'], ['==', 'meta', 'midpoint']],
                paint: { 'circle-radius': 4, 'circle-color': 'green' },
            },
        ],
    });
}

export function ensureSquareGreenImage(map: MapboxMap) {
    if (!map.hasImage('square-green')) {
        const size = 20;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.fillStyle = '#2CBE00';
            ctx.fillRect(0, 0, size, size);
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.strokeRect(0, 0, size, size);
            const imageData = ctx.getImageData(0, 0, size, size);
            map.addImage('square-green', imageData, { pixelRatio: 2 });
        }
    }
}

export function changeToDrawPolygon(draw: MapboxDraw | null) {
    try {
        draw?.changeMode('draw_polygon');
    } catch {
        // ignore
    }
}

export function makeUpdateCanSave(drawRef: { current: MapboxDraw | null }, setCanSave: (v: boolean) => void) {
    return function updateCanSave() {
        const draw = drawRef.current;
        if (!draw) return setCanSave(false);
        const data = draw.getAll();
        if (!data || !data.features) return setCanSave(false);
        const hasClosedPolygon = data.features.some(
            (f: GeoJSON.Feature) => f.geometry && f.geometry.type === "Polygon"
        );
        setCanSave(Boolean(hasClosedPolygon));
    };
}
