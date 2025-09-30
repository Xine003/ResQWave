import { useState } from 'react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip-white';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover-focal';
import { Layers, Locate, Minus, Plus, Trash2 } from 'lucide-react';
import type { MapControlsProps } from '../types/controls';

export default function MapControls({ mapRef, mapLoaded, addCustomLayers, editBoundaryOpen, handleDeleteBoundary }: MapControlsProps) {
    const [layersOpen, setLayersOpen] = useState(false);
    const [selectedLayer, setSelectedLayer] = useState<'terrain' | 'satellite'>('terrain');

    return (
        <div style={{ position: 'absolute', right: 21, bottom: 21, zIndex: 40, display: 'flex', flexDirection: 'column', gap: 11 }}>
            {/* Location button */}
            <Tooltip>
                <TooltipTrigger asChild>
                    <div
                        style={{
                            width: 50,
                            height: 50,
                            borderRadius: 7,
                            background: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: mapLoaded ? 'pointer' : 'not-allowed',
                            boxShadow: '0 4px 12px rgba(2,6,23,0.21)',
                            transition: 'background 0.18s'
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#EEEEEE')}
                        onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
                    >
                        <button
                            aria-label="Locate"
                            disabled={!mapLoaded}
                            onClick={() => {
                                const map = mapRef.current;
                                if (!map) return;
                                map.flyTo({ center: [121.04040046802031, 14.7721611560019], zoom: 17, speed: 1.2, curve: 1.4, essential: true });
                            }}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#000',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <Locate size={21} />
                        </button>
                    </div>
                </TooltipTrigger>
                <TooltipContent side="left" sideOffset={8}>
                    Your Location
                </TooltipContent>
            </Tooltip>

            {/* Layers popover */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Popover onOpenChange={(open) => setLayersOpen(open)}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <PopoverTrigger asChild>
                                <div
                                    style={{
                                        width: 50,
                                        height: 50,
                                        borderRadius: 7,
                                        background: layersOpen ? '#111827' : '#fff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        boxShadow: layersOpen ? '0 6px 16px rgba(0,0,0,0.35)' : '0 4px 12px rgba(2,6,23,0.21)',
                                        transition: 'background 0.18s, box-shadow 0.18s'
                                    }}
                                    onMouseEnter={e => { if (!layersOpen) e.currentTarget.style.background = '#EEEEEE' }}
                                    onMouseLeave={e => { if (!layersOpen) e.currentTarget.style.background = '#fff' }}
                                >
                                    <button aria-label="Layers" style={{ background: 'transparent', border: 'none', color: layersOpen ? '#fff' : '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Layers size={21} />
                                    </button>
                                </div>
                            </PopoverTrigger>
                        </TooltipTrigger>
                        {!layersOpen && (
                            <TooltipContent side="left" sideOffset={8}>
                                Layers
                            </TooltipContent>
                        )}
                    </Tooltip>
                    <PopoverContent side="left" align="center" zIndex={30} style={{ minWidth: 220, padding: 10, background: 'transparent', boxShadow: 'none', border: 'none', transform: 'translateX(8px)' }}>
                        {/* Segmented control */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', padding: 6, borderRadius: 12, boxShadow: '0 8px 20px rgba(2,6,23,0.12)' }}>
                            <button
                                onClick={() => {
                                    setSelectedLayer('terrain');
                                    const m = mapRef.current;
                                    if (m) {
                                        m.setStyle('mapbox://styles/mapbox/outdoors-v12');
                                        m.once('styledata', () => {
                                            addCustomLayers(m);
                                        });
                                    }
                                }}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: 8,
                                    background: selectedLayer === 'terrain' ? '#111827' : 'transparent',
                                    color: selectedLayer === 'terrain' ? '#fff' : '#9ca3af',
                                    border: 'none',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    boxShadow: selectedLayer === 'terrain' ? '0 6px 12px rgba(0,0,0,0.25)' : 'none'
                                }}
                            >
                                Terrain
                            </button>
                            <button
                                onClick={() => {
                                    setSelectedLayer('satellite');
                                    const m = mapRef.current;
                                    if (m) {
                                        m.setStyle('mapbox://styles/mapbox/satellite-streets-v12');
                                        m.once('styledata', () => {
                                            addCustomLayers(m);
                                        });
                                    }
                                }}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: 8,
                                    background: selectedLayer === 'satellite' ? '#111827' : 'transparent',
                                    color: selectedLayer === 'satellite' ? '#fff' : '#9ca3af',
                                    border: 'none',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    boxShadow: selectedLayer === 'satellite' ? '0 6px 12px rgba(0,0,0,0.25)' : 'none'
                                }}
                            >
                                Satellite
                            </button>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>

            {/* Delete/Reset button for boundary only when editing, now in its own row below layers */}
            {editBoundaryOpen && (
                <div>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div
                                style={{ width: 50, height: 50, borderRadius: 7, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(2,6,23,0.21)', transition: 'background 0.18s' }}
                                onMouseEnter={e => (e.currentTarget.style.background = '#EEEEEE')}
                                onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
                            >
                                <button
                                    aria-label="Delete boundary"
                                    onClick={handleDeleteBoundary}
                                    style={{ background: 'transparent', border: 'none', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}
                                >
                                    <Trash2 size={21} />
                                </button>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent side="left" sideOffset={8}>
                            Delete boundary
                        </TooltipContent>
                    </Tooltip>
                </div>
            )}

            {/* Zoom in/out */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div style={{ width: 50, borderTopLeftRadius: 7, borderTopRightRadius: 7, borderBottomLeftRadius: 0, borderBottomRightRadius: 0, overflow: 'hidden', background: '#fff', boxShadow: '0 6px 16px rgba(2,6,23,0.21)', display: 'flex', flexDirection: 'column' }}>
                            <button
                                aria-label="Zoom in"
                                onClick={() => { const m = mapRef.current; if (m) m.zoomIn(); }}
                                style={{
                                    width: '100%',
                                    height: 50,
                                    border: 'none',
                                    background: 'transparent',
                                    color: '#000',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderBottom: '1px solid rgba(0,0,0,0.12)',
                                    transition: 'background 0.18s',
                                    cursor: 'pointer'
                                }}
                                onMouseEnter={e => (e.currentTarget.style.background = '#EEEEEE')}
                                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                            >
                                <Minus size={21} />
                            </button>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent side="left" sideOffset={8}>
                        Zoom in
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div style={{ width: 50, borderTopLeftRadius: 0, borderTopRightRadius: 0, borderBottomLeftRadius: 7, borderBottomRightRadius: 7, overflow: 'hidden', background: '#fff', boxShadow: '0 6px 16px rgba(2,6,23,0.21)', display: 'flex', flexDirection: 'column' }}>
                            <button
                                aria-label="Zoom out"
                                onClick={() => { const m = mapRef.current; if (m) m.zoomOut(); }}
                                style={{
                                    width: '100%',
                                    height: 50,
                                    border: 'none',
                                    background: 'transparent',
                                    color: '#000',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'background 0.18s',
                                    cursor: 'pointer'
                                }}
                                onMouseEnter={e => (e.currentTarget.style.background = '#EEEEEE')}
                                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                            >
                                <Plus size={21} />
                            </button>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent side="left" sideOffset={8}>
                        Zoom out
                    </TooltipContent>
                </Tooltip>
            </div>
        </div>
    );
}
