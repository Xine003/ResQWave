import { useSocket } from '@/contexts/SocketContext';
import { useCallback, useEffect } from 'react';
import type { MapAlertResponse, MapSignal } from '../api/mapAlerts';
import { transformToMapSignal } from '../api/mapAlerts';

interface UseMapWebSocketProps {
    onNewAlert: (signal: MapSignal) => void;
}

/**
 * Hook to listen for real-time map alerts via WebSocket
 */
export function useMapWebSocket({ onNewAlert }: UseMapWebSocketProps) {
    const { socket, isConnected } = useSocket();

    const handleMapReport = useCallback((data: MapAlertResponse) => {
        console.log('[WebSocket] New map report received:', data);

        try {
            // Transform the data using the same function as REST API
            const signal = transformToMapSignal(data);

            if (!signal) {
                console.warn('[WebSocket] Could not transform map report:', data);
                return;
            }

            console.log('[WebSocket] Transformed signal:', signal);
            onNewAlert(signal);
        } catch (error) {
            console.error('[WebSocket] Error processing map report:', error);
        }
    }, [onNewAlert]);

    useEffect(() => {
        if (!socket || !isConnected) {
            console.log('[WebSocket] Socket not ready, skipping map alert listener');
            return;
        }

        console.log('[WebSocket] Setting up mapReport:new listener');

        // Listen for new map alerts
        socket.on('mapReport:new', handleMapReport);

        // Cleanup
        return () => {
            console.log('[WebSocket] Cleaning up mapReport:new listener');
            socket.off('mapReport:new', handleMapReport);
        };
    }, [socket, isConnected, handleMapReport]);

    return { isConnected };
}
